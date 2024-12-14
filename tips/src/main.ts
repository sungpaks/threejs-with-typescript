import "./style.css";
import * as THREE from "three";
import {
  FontLoader,
  OrbitControls,
  TextGeometry,
} from "three/examples/jsm/Addons.js";

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

class App {
  private renderer: THREE.WebGLRenderer;
  private domApp: HTMLElement;
  private scene: THREE.Scene;
  private camera?: THREE.OrthographicCamera;
  private cube?: THREE.Mesh;
  private canvas: HTMLCanvasElement;
  private renderTarget?: THREE.WebGLRenderTarget;
  private rtScene?: THREE.Scene;
  private rtCamera?: THREE.OrthographicCamera;
  private plane?: THREE.Mesh;

  constructor() {
    console.log("hi");
    this.domApp = document.querySelector("#app")!;
    this.canvas = this.domApp.appendChild(document.createElement("canvas"));
    this.canvas.tabIndex = 0;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.max(3, window.devicePixelRatio));
    this.renderer.autoClearColor = false;
    // this.canvas.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.setupCamera();
    this.setupLight();
    this.setupRenderTarget();
    this.setupModels();
    // this.setupControls();
    this.setupEvents();
  }
  private setupCamera() {
    const camera = new THREE.OrthographicCamera(
      -this.canvas.width / 2,
      this.canvas.width / 2,
      this.canvas.height / 2,
      -this.canvas.height / 2,
      -1,
      1
    );
    this.camera = camera;
    this.scene.add(this.camera);
  }
  private setupLight() {
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 1);
    this.scene.add(light);
  }
  private setupModels() {
    const geometry = new THREE.PlaneGeometry(
      this.canvas.width,
      this.canvas.height
    );
    const material = new THREE.MeshStandardMaterial({
      map: this.renderTarget?.texture,
    });
    const plane = new THREE.Mesh(geometry, material);
    this.scene.add(plane);
    this.plane = plane;
  }
  private setupCubeInRenderTarget() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: getRandomColor(),
    });
    const cube = new THREE.Mesh(geometry, material);
    if (this.rtScene) this.rtScene.add(cube);
    this.cube = cube;
  }
  private setupRenderTarget() {
    const renderTarget = new THREE.WebGLRenderTarget(
      this.canvas.width,
      this.canvas.height
    );
    const rtCamera = new THREE.OrthographicCamera(-20, 20, 10, -10, -1, 1);
    const rtScene = new THREE.Scene();
    rtScene.background = new THREE.Color("white");
    this.renderTarget = renderTarget;
    this.rtCamera = rtCamera;
    this.rtScene = rtScene;

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(0, 0, 1);
    rtScene.add(light);

    this.setupCubeInRenderTarget();
  }
  private setupControls() {
    new OrbitControls(this.camera!, this.domApp!);
  }

  private getRelativePositions(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * this.canvas.width) / rect.width;
    const y = ((e.clientY - rect.top) * this.canvas.height) / rect.height;
    return { x, y };
  }

  private moveRect(e: MouseEvent) {
    const { x, y } = this.getRelativePositions(e);
    const normalizedX = (x / this.canvas.width) * 2 - 1;
    const normalizedY = (y / this.canvas.height) * -2 + 1;
    const flatted = new THREE.Vector3(normalizedX, normalizedY, 0).unproject(
      this.rtCamera!
    );
    this.cube?.position.set(flatted.x, flatted.y, 0);
  }

  private setupEvents() {
    window.onresize = this.resize.bind(this);
    this.resize();
    this.renderer.setAnimationLoop(this.render.bind(this));
    window.addEventListener("mousemove", this.moveRect.bind(this));
    window.addEventListener("keydown", (e) => {
      if (e.key === "r") {
        // @ts-ignore
        this.cube?.material.color.set(getRandomColor());
      }
    });
  }

  private resize() {
    const width = this.domApp.clientWidth;
    const height = this.domApp.clientHeight;
    const camera = this.camera;

    if (camera) {
      camera.updateProjectionMatrix();
    }
    // if (this.renderTarget) {
    //   this.renderTarget.setSize(width, height);
    // }
    this.renderer.setSize(width, height);
  }

  private update(time: number) {
    this.cube?.rotation.set(time, time, time);
  }

  private render(time: number) {
    time *= 0.001; // ms -> s
    this.update(time);
    if (this.renderTarget) {
      this.renderer.setRenderTarget(this.renderTarget);
      this.renderer.render(this.rtScene!, this.rtCamera!);
      this.renderer.setRenderTarget(null);
    }
    this.renderer.render(this.scene, this.camera!);
  }
}

new App();
