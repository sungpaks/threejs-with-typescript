import * as THREE from "three";

export default class AxisGridHelper {
  private grid: THREE.GridHelper;
  private axes: THREE.AxesHelper;
  private _visible: boolean;
  constructor(obj: THREE.Object3D, units: number = 10) {
    const grid = new THREE.GridHelper(units, units);
    const axes = new THREE.AxesHelper(10);

    // @ts-ignore
    axes.material.depthTest = false;
    axes.renderOrder = 2;

    grid.material.depthTest = false;
    grid.renderOrder = 1;

    this.grid = grid;
    this.axes = axes;

    obj.add(grid);
    obj.add(axes);
    this._visible = false;
  }

  get visible() {
    return this._visible;
  }
  set visible(v) {
    this._visible = v;
    this.grid.visible = v;
    this.axes.visible = v;
  }
}
