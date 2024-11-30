import "./style.css";
import * as THREE from "three";
import {
  FontLoader,
  OrbitControls,
  TextGeometry,
} from "three/examples/jsm/Addons.js";
import GPUPickHelper from "./picker";

export function getRandomColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}
export function getRandom(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

class App {
  private renderer: THREE.WebGLRenderer;
  private domApp: HTMLElement;
  private scene: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private pickPosition = { x: 0, y: 0 };
  private pickHelper: GPUPickHelper;
  private pickingScene: THREE.Scene;
  private objects: Record<string, THREE.Mesh> = {};

  constructor() {
    console.log("hi");
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.domApp = document.querySelector("#app")!;
    this.domApp.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000000, 1, 150);
    this.scene.background = new THREE.Color(0xffffff);

    this.pickingScene = new THREE.Scene();
    this.pickingScene.background = new THREE.Color(0);

    this.pickHelper = new GPUPickHelper();

    this.setupCamera();
    // this.setupLight();
    this.setupModels();
    this.setupControls();
    // this.setupHelpers();
    this.clearPickPosition();
    this.setupEvents();
  }
  private setupCamera() {
    const width = this.domApp.clientWidth;
    const height = this.domApp.clientHeight;

    // 카메라 생성
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    this.camera.position.set(10, 10, 10);

    // 조명 생성
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 0, 0);
    light.target.position.set(0, 0, -1); // 카메라 앞쪽을 비추도록 설정
    this.camera.add(light);
    this.camera.add(light.target);

    // 카메라를 씬에 추가
    this.scene.add(this.camera);
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
    const loader = new THREE.TextureLoader();
    const texture = loader.load("/src/resources/frame.png");
    const getNewBox = (id: number) => {
      const phongMaterial = new THREE.MeshPhongMaterial({
        color: getRandomColor(),
        map: texture,
        transparent: true,
        alphaTest: 0.1,
        side: THREE.DoubleSide,
        shininess: 100,
      });
      const geometry = new THREE.BoxGeometry(
        getRandom(1, 2),
        getRandom(1, 2),
        getRandom(1, 2)
      );
      const cube = new THREE.Mesh(geometry, phongMaterial);
      cube.position.set(
        getRandom(-10, 10),
        getRandom(-10, 10),
        getRandom(-10, 10)
      );
      cube.rotation.set(
        getRandom(0, Math.PI),
        getRandom(0, Math.PI),
        getRandom(0, Math.PI)
      );
      this.scene.add(cube);

      this.objects[id] = cube;
      const pickingMaterial = new THREE.MeshPhongMaterial({
        emissive: new THREE.Color().setHex(id, THREE.NoColorSpace),
        color: new THREE.Color(0, 0, 0),
        specular: new THREE.Color(0, 0, 0),
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5,
        blending: THREE.NoBlending,
      });
      const pickingCube = new THREE.Mesh(geometry, pickingMaterial);
      this.pickingScene.add(pickingCube);
      pickingCube.position.copy(cube.position);
      pickingCube.rotation.copy(cube.rotation);
      pickingCube.scale.copy(cube.scale);
    };
    for (let i = 0; i < 50; i++) {
      getNewBox(i + 1);
    }
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

  private getCanvasRelativePosition(event: MouseEvent) {
    const rect = this.domApp.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * this.domApp.offsetWidth) / rect.width,
      y: ((event.clientY - rect.top) * this.domApp.offsetHeight) / rect.height,
    };
  }

  private clearPickPosition() {
    this.pickPosition.x = -100000;
    this.pickPosition.y = -100000;
  }

  private setPickPosition(event: MouseEvent) {
    const pos = this.getCanvasRelativePosition(event);
    this.pickPosition.x = pos.x;
    this.pickPosition.y = pos.y;
  }

  private setupEvents() {
    window.onresize = this.resize.bind(this);
    this.resize();
    this.renderer.setAnimationLoop(this.render.bind(this));
    window.addEventListener("mousemove", this.setPickPosition.bind(this));
    window.addEventListener("mouseout", this.clearPickPosition.bind(this));
    window.addEventListener("mouseleave", this.clearPickPosition.bind(this));
    window.addEventListener("click", () => {
      this.pickHelper.click(this.scene);
      console.log(this.renderer.info);
    });
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

  private update(time: number) {}

  private render(time: number) {
    time *= 0.001; // ms -> s
    // this.update(time);
    this.pickHelper.pick(
      new THREE.Vector2(this.pickPosition.x, this.pickPosition.y),
      this.pickingScene,
      this.camera!,
      time,
      this.renderer,
      this.objects
    );
    this.renderer.render(this.scene, this.camera!);
  }
}

new App();
