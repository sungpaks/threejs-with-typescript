import "./style.css";
import * as THREE from "three";
import {
  FontLoader,
  OrbitControls,
  TextGeometry,
} from "three/examples/jsm/Addons.js";

class App {
  private renderer: THREE.WebGLRenderer;
  private domApp: HTMLElement;
  private scene: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private rtScene?: THREE.Scene;
  private rtCamera?: THREE.Camera;
  private renderTarget?: THREE.WebGLRenderTarget;

  constructor() {
    console.log("hi");
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.domApp = document.querySelector("#app")!;
    this.domApp.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000000, 1, 150);

    this.setupCamera();
    this.setupLight();
    this.setupRenderTarget();
    this.setupModels();
    this.setupControls();
    this.setupHelpers();
    this.setupEvents();
  }
  private setupCamera() {
    const width = this.domApp.clientWidth;
    const height = this.domApp.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    this.camera.position.z = 40;
    this.camera.position.y = 40;
  }
  private setupLight() {
    const lights = [];
    for (let i = 0; i < 2; i++) {
      lights[i] = new THREE.DirectionalLight(0xffffff, 3);
      this.scene.add(lights[i]);
    }
    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
  }
  private setupModels() {
    const material = new THREE.MeshBasicMaterial({
      map: this.renderTarget!.texture,
    });
    const geometry = new THREE.BoxGeometry(20, 20, 20);
    const lineGeometry = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const line = new THREE.LineSegments(lineGeometry, lineMaterial);
    const box = new THREE.Mesh(geometry, material);
    const group = new THREE.Group();
    group.add(box);
    group.add(line);
    this.scene.add(group);
  }

  private createPlane(material: THREE.Material) {
    const geometry = new THREE.PlaneGeometry(50, 50);
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI / 2;
    plane.name = "myPlane";
    return plane;
  }

  private createHemiSphere() {
    const material = new THREE.MeshPhongMaterial({
      color: 0xbbbbbb,
      shininess: 100,
    });
    const geometry = new THREE.SphereGeometry(
      10,
      32,
      32,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    const sphere = new THREE.Mesh(geometry, material);
    sphere.name = "mySphere";
    return sphere;
  }

  private createTorus() {
    const material = new THREE.MeshPhongMaterial({
      color: 0xbbbbbb,
      shininess: 100,
    });
    const geometry = new THREE.TorusGeometry(3, 1, 16, 100);
    const torus = new THREE.Mesh(geometry, material);
    torus.name = "myTorus";
    return torus;
  }

  private setupHelpers() {
    const gridHelper = new THREE.GridHelper(100, 100, 0xffffff, 0x444444);
    this.scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(100);
    this.scene.add(axesHelper);
  }

  private setupControls() {
    new OrbitControls(this.camera!, this.domApp!);
  }

  private setupRenderTarget() {
    const rtWidth = 512;
    const rtHeight = 512;
    const renderTarget = new THREE.WebGLRenderTarget(rtWidth, rtHeight);
    const rtCamera = new THREE.PerspectiveCamera(
      75,
      rtWidth / rtHeight,
      0.1,
      1000
    );
    rtCamera.position.y = 40;
    rtCamera.lookAt(0, 0, 0);

    const rtScene = new THREE.Scene();
    // rtScene.background = new THREE.Color("red");
    this.rtScene = rtScene;
    this.rtCamera = rtCamera;
    this.renderTarget = renderTarget;

    const light = new THREE.AmbientLight(0x404040); // 부드러운 조명
    this.rtScene!.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // 강한 조명 추가
    directionalLight.position.set(10, 10, 10);
    this.rtScene!.add(directionalLight);

    const setupRTModels = () => {
      const basicMaterial = new THREE.MeshBasicMaterial({
        color: 0x808080,
        side: THREE.DoubleSide,
      });
      const plane = this.createPlane(basicMaterial);
      const hemiSphere = this.createHemiSphere();
      this.rtScene!.add(plane);
      this.rtScene!.add(hemiSphere);

      for (let i = 0; i < 8; i++) {
        const torusSystem = new THREE.Object3D();
        const torus = this.createTorus();
        torusSystem.add(torus);
        torus.position.set(0, 4, 20);
        torus.rotation.y = Math.PI / 2;
        torusSystem.rotation.y = (i * Math.PI) / 4;
        this.rtScene!.add(torusSystem);
      }

      const ballGeometry = new THREE.SphereGeometry(2, 32, 32);
      const ballMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
      const ball = new THREE.Mesh(ballGeometry, ballMaterial);
      const ballSystem = new THREE.Object3D();
      ballSystem.add(ball);
      ball.position.set(0, 4, 20);
      ballSystem.name = "ballSystem";
      this.rtScene!.add(ballSystem);
    };
    setupRTModels();
  }

  private setupEvents() {
    window.onresize = this.resize.bind(this);
    this.resize();
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  private resize() {
    const width = this.domApp.clientWidth;
    const height = this.domApp.clientHeight;
    const camera = this.camera;

    if (camera) {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    this.renderer.setSize(width, height);
  }

  private update(time: number) {
    time *= 0.001; // ms -> s

    const ball = this.rtScene!.getObjectByName("ballSystem") as THREE.Object3D;
    if (ball) {
      ball.rotation.y = Math.cos(time / 2) * Math.PI * 20;
    }
  }

  private render(time: number) {
    this.update(time);
    this.renderer.setRenderTarget(this.renderTarget!);
    this.renderer.render(this.rtScene!, this.rtCamera!);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera!);
  }
}

new App();
