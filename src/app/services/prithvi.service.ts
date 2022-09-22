import { Injectable } from '@angular/core';
import gsap from 'gsap';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { AxesHelper, BufferGeometry, Mesh, Object3D, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { ISizes } from '../interfaces/sizes.interface';
import { ISource } from '../interfaces/source.interface';
import { CameraService } from './camera.service';
import { RendererService } from './renderer.service';
import { ResourcesService } from './utils/resources.service';
import { SizesService } from './utils/sizes.service';
import { TimeService } from './utils/time.service';

@Injectable({
  providedIn: 'root'
})
export class PrithviService {
  private scene?: Scene;
  private camera?: PerspectiveCamera;
  private model?: Object3D;
  private controls?: OrbitControls;
  private renderer?: WebGLRenderer;

  constructor(
    private timeService: TimeService,
    private sizesService: SizesService,
    private cameraService: CameraService,
    private rendererService: RendererService,
    private resourcesService: ResourcesService,
  ) { }

  public initialize(container: HTMLDivElement, unsubscribeSub: Subject<void>, sources: ISource[]) {

    this.renderer = this.rendererService.setInstance(container);
    this.sizesService.setup();
    this.timeService.setup();
    // Initialize Scene
    this.scene = new Scene();
    this.scene.add(new AxesHelper(50));
    const sizes: ISizes = {
      width: container.clientWidth!,
      height: container.clientHeight!
    };
    const cameraInitialized = this.cameraService.initialize(sizes, this.renderer.domElement);
    this.camera = cameraInitialized.camera;
    this.controls = cameraInitialized.controls;
    this.timeService.tick();
    sources.forEach(source => {
      this.resourcesService.loadModel(source.assetUrl);
    });

    this.sizesService.getResize().pipe(takeUntil(unsubscribeSub)).subscribe(() => {
      const sizes = {
        width: container.clientWidth!,
        height: container.clientHeight!
      }
      this.onResize(sizes);
    });

    this.timeService.getTrigger().pipe(takeUntil(unsubscribeSub)).subscribe(() => {
      this.onUpdate();
    });

    this.resourcesService.getLoadedModel().subscribe(this.onModelLoaded.bind(this));
  }

  private onResize(sizes: ISizes) {
    this.cameraService.resize(sizes);
    this.rendererService.resize(sizes);
  }

  private onUpdate() {
    this.cameraService.update();
    this.rendererService.update(this.scene!, this.camera!);
  }

  private onModelLoaded(gltf: GLTF) {
    console.log('MODEL ', gltf);
    let isPlodiv = false;
    let isTeste = false;
    gltf.scene.traverse(object => {
      if (object instanceof Object3D) {
        if (object.name.includes('plovdiv')) {
          isPlodiv = object.name.includes('plovdiv');
          this.model = object;
          this.scene?.add(this.model);
        }
        if (object.name.includes('teste')) {
          isTeste = object.name.includes('teste');
          this.model = object;
          this.scene?.add(this.model);
        }
        
      }
    })
    console.log(this.model);
    let radius = 0;
    this.model?.traverse(object => {
      if (object instanceof Mesh) {
        (object.geometry as BufferGeometry).computeBoundingSphere();
        const boundingSphere = (object.geometry as BufferGeometry).boundingSphere;
        radius = boundingSphere!.radius;
      }
    });
    console.log(radius);
    if (isPlodiv) {
      this.model!.position.y = -radius * 1.5;
      this.model!.position.z = radius;
      this.model!.rotation.x += Math.PI;
      gsap.to(this.camera!.position, {
        x: 1.5 * radius,
        y: 1.5 * radius,
        z: 1.5 * radius,
        duration: 5
      });
    }
    if (isTeste) {
      this.model!.position.z = radius * 0.5;
      this.model!.rotation.x += Math.PI;
      gsap.to(this.camera!.position, {
        x: 1 * radius,
        y: 1 * radius,
        z: 1 * radius,
        duration: 3
      });
    }
    this.controls!.target.set(0, 0, 0);
  }

  public getLoadedPercentage() {
    return this.resourcesService.getLoadedPercentage();
  }

  public destroy() {
    this.timeService.stop();
    this.sizesService.destroy();
  }
}
