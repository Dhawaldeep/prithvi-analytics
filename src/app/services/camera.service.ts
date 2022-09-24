import { Injectable } from '@angular/core';
import { PerspectiveCamera } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ISizes } from '../interfaces/sizes.interface';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  public instance?: PerspectiveCamera;
  public controls?: OrbitControls;
  constructor() { }

  public initialize(sizes: ISizes, canvas: HTMLCanvasElement): {camera: PerspectiveCamera; controls: OrbitControls} {
    this.instance = new PerspectiveCamera(35, sizes.width/sizes.height, 0.01, 5000);
    this.instance.position.set(75, 75, 75);
    return { camera: this.instance, controls: this.setOrbitControl(canvas)};
  }

  public setOrbitControl(canvas: HTMLCanvasElement): OrbitControls {
    this.controls = new OrbitControls(this.instance!, canvas);
    this.controls.enableDamping = true;
    return this.controls;
  }

  public resize(sizes: ISizes) {
    this.instance!.aspect = sizes.width/sizes.height;
    this.instance?.updateProjectionMatrix();
  }

  public update() {
    this.controls?.update();
  }

  public destroy() {
    this.controls?.dispose();
  }
}
