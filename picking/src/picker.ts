import * as THREE from "three";

class GPUPickHelper {
  private pickingTexture = new THREE.WebGLRenderTarget(1, 1);
  private pixelBuffer = new Uint8Array(4);
  private pickedObject: THREE.Object3D<THREE.Object3DEventMap> | null = null;
  private pickedObjectSavedColor: number = 0;

  constructor() {}
  pick(
    cssPosition: THREE.Vector2,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    time: number,
    renderer: THREE.WebGLRenderer,
    idToObject: Record<number, THREE.Mesh>
  ) {
    // 이미 다른 물체가 피킹된 경우 색을 복원
    if (
      this.pickedObject &&
      this.pickedObject instanceof THREE.Mesh &&
      isMeshStandardMaterial(this.pickedObject.material)
    ) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = null;
    }

    const { pickingTexture, pixelBuffer } = this;
    const pixelRatio = renderer.getPixelRatio();
    camera.setViewOffset(
      renderer.getContext().drawingBufferWidth, //전체 너비
      renderer.getContext().drawingBufferHeight, //전체 높이
      (cssPosition.x * pixelRatio) | 0, //사각 x좌표
      (cssPosition.y * pixelRatio) | 0, //사각 y좌표
      1, //사각 좌표 width
      1 //사각 좌표 height
    );
    renderer.setRenderTarget(pickingTexture);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    camera.clearViewOffset();

    renderer.readRenderTargetPixels(
      pickingTexture, // 읽을 렌더 타겟
      0, //x
      0, //y
      1, //width
      1, //height
      pixelBuffer //여기에 넣어주세요
    );

    const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | pixelBuffer[2];

    const intersectedObject = idToObject[id];
    if (intersectedObject) {
      // 가장 가까운 물체인 첫 물체를 선택
      this.pickedObject = intersectedObject;

      if (
        this.pickedObject &&
        this.pickedObject instanceof THREE.Mesh &&
        isMeshStandardMaterial(this.pickedObject.material)
      ) {
        this.pickedObjectSavedColor =
          this.pickedObject.material.emissive.getHex();

        this.pickedObject.material.emissive?.setHex(
          (time * 8) % 2 > 1 ? 0x00ff00 : 0xff00ff
        );
      }
    }
  }
  click(scene: THREE.Scene) {
    if (
      this.pickedObject &&
      this.pickedObject instanceof THREE.Mesh &&
      isMeshStandardMaterial(this.pickedObject.material)
    ) {
      this.pickedObject?.geometry.dispose();
      this.pickedObject?.material.dispose();
      scene.remove(this.pickedObject!);
    }
  }
}
function isMeshStandardMaterial(
  material: THREE.Material
): material is THREE.MeshStandardMaterial {
  return (material as THREE.MeshStandardMaterial).emissive !== undefined;
}

export default GPUPickHelper;
