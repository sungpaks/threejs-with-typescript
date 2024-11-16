import "./style.css";
import * as THREE from "three";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import AxisGridHelper from "./axisGridHelper";
import { OrbitControls } from "three/examples/jsm/Addons.js";

class App {
  private renderer: THREE.WebGLRenderer;
  private domApp: HTMLElement;
  private scene: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private objects: THREE.Object3D[] = [];
  private solarSystem?: THREE.Object3D;
  private earthSystem?: THREE.Object3D;
  private sun?: THREE.Mesh;
  private earth?: THREE.Mesh;
  private moon?: THREE.Mesh;
  private gui: GUI;
  private controls?: OrbitControls;

  constructor() {
    console.log("hi");
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.domApp = document.querySelector("#app")!;
    this.domApp.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.gui = new GUI();

    this.setupCamera();
    this.setupLight();
    this.setupModels();
    this.setupEvents();
  }
  private setupCamera() {
    const width = this.domApp.clientWidth;
    const height = this.domApp.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    this.camera.position.y = 30;
    this.camera.up.set(0, 0, 1);
    this.camera.lookAt(0, 0, 0);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
  }
  private setupLight() {
    const color = 0xffffff;
    const intensity = 500;
    const light = new THREE.PointLight(color, intensity);
    light.position.set(0, 0, 0);
    this.scene.add(light);
  }
  private setupModels() {
    const geometry = new THREE.SphereGeometry(1, 36, 36);
    this.setupSolarSystem();
    this.setupSun(geometry);
    this.setupEarth(geometry);
    this.setupMoon(geometry);

    this.makeAxisGrid(this.solarSystem!, "solarSystem", 25);
    this.makeAxisGrid(this.earthSystem!, "earthSystem");
    this.makeAxisGrid(this.sun!, "sun");
    this.makeAxisGrid(this.earth!, "earth");
    this.makeAxisGrid(this.moon!, "moon");
  }

  private setupSolarSystem() {
    const solarSystem = new THREE.Object3D();
    this.scene.add(solarSystem);
    this.objects.push(solarSystem);
    this.solarSystem = solarSystem;
  }

  private setupSun(geometry: THREE.SphereGeometry) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load("/src/textures/sun.png");
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });

    const sun = new THREE.Mesh(geometry, material);
    sun.scale.set(5, 5, 5); // 태양은 더 크게
    this.solarSystem!.add(sun);
    this.objects.push(sun);
    this.sun = sun;
  }

  private setupEarth(geometry: THREE.SphereGeometry) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load("/src/textures/earth.png");
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: 0x222222,
    });
    const earth = new THREE.Mesh(geometry, material);
    this.solarSystem!.add(earth);
    earth.translateX(10); // 태양에서 10만큼 떨어진 곳에 지구
    this.objects.push(earth);
    this.earth = earth;

    // 지구계를 정의하여 나중에 달 넣을때 사용
    const earthSystem = new THREE.Object3D();
    earth.add(earthSystem);
    this.objects.push(earthSystem);
    this.earthSystem = earthSystem;
  }

  private setupMoon(geomtry: THREE.SphereGeometry) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load("/src/textures/moon.png");
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      emissive: 0x222222,
    });
    const moon = new THREE.Mesh(geomtry, material);
    moon.translateX(2); // 지구에서 2만큼 떨어진 곳에 달
    moon.scale.set(0.25, 0.25, 0.25); // 달은 지구의 1/4 크기
    this.objects.push(moon);
    this.earthSystem!.add(moon);
    this.moon = moon;
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
    this.objects.forEach((obj) => {
      obj.rotation.y = time / 4;
    });
  }

  private makeAxisGrid(obj: THREE.Object3D, label: string, units?: number) {
    const helper = new AxisGridHelper(obj, units);
    helper.visible = false;
    this.gui.add(helper, "visible").name(label);
  }

  private render(time: number) {
    this.update(time);
    this.controls?.update();
    this.renderer.render(this.scene, this.camera!);
  }
}

new App();
