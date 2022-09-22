import { Injectable } from '@angular/core';
import { CineonToneMapping, PCFSoftShadowMap, PerspectiveCamera, Scene, sRGBEncoding, WebGLRenderer } from 'three';
import { ISizes } from '../interfaces/sizes.interface';

@Injectable({
  providedIn: 'root'
})
export class RendererService {
  public instance?: WebGLRenderer;

  constructor() { }

  public setInstance(container: HTMLDivElement) {
    this.instance = new WebGLRenderer({
      antialias: true,
    });
    this.instance.physicallyCorrectLights = true;
    this.instance.outputEncoding = sRGBEncoding;
    this.instance.toneMapping = CineonToneMapping;
    this.instance.toneMappingExposure = 1.75;
    // this.instance.shadowMap.enabled = true;
    // this.instance.shadowMap.type = PCFSoftShadowMap;
    this.instance.setClearColor('#211d20');
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.instance.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.instance.domElement);
    return this.instance;
  }

  public resize(sizes: ISizes) {
    this.instance?.setSize(sizes.width, sizes.height);
    this.instance?.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
  }

  public update(scene: Scene, camera: PerspectiveCamera){
    this.instance?.render(scene, camera);
  }
}
