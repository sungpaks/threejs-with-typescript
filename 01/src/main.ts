import "./style.css";
import * as THREE from "three";
import { FontLoader, TextGeometry } from "three/examples/jsm/Addons.js";

class App {
  private renderer: THREE.WebGLRenderer;
  private domApp: HTMLElement;
  private scene: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private cube?: THREE.Mesh;
  private text?: THREE.Object3D;

  constructor() {
    console.log("hi");
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.domApp = document.querySelector("#app")!;
    this.domApp.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.setupCamera();
    this.setupLight();
    this.setupModels();
    this.setupEvents();
  }
  private setupCamera() {
    const width = this.domApp.clientWidth;
    const height = this.domApp.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    this.camera.position.z = 2;
  }
  private setupLight() {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    this.scene.add(light);
  }
  private setupModels() {
    // this.setupCube();
    this.setupText();
  }

  private setupCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1); //가로,세로,깊이
    const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
    this.cube = new THREE.Mesh(geometry, material);

    this.scene.add(this.cube);
  }

  private async setupText() {
    const loader = new FontLoader();
    const font = await loader.loadAsync(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"
    );
    const geometry = new TextGeometry("HELLO!", {
      font: font,
      size: 0.2,
      height: 0.05,
      curveSegments: 30,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 5,
    });
    const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const textMesh = new THREE.Mesh(geometry, material);

    geometry.computeBoundingBox();
    geometry.boundingBox?.getCenter(textMesh.position).multiplyScalar(-1);

    const parent = new THREE.Object3D();
    parent.add(textMesh);
    this.text = parent;

    this.scene.add(parent);
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
    if (this.cube) {
      this.cube.rotation.x = time;
      this.cube.rotation.y = time;
    }
    if (this.text) {
      this.text.rotation.x = time;
      this.text.rotation.y = time;
    }
  }

  private render(time: number) {
    this.update(time);
    this.renderer.render(this.scene, this.camera!);
  }
}

new App();
