import { Injectable } from '@angular/core';
import { LoadingManager } from 'three';
import { Subject } from 'rxjs';

import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

@Injectable({
  providedIn: 'root'
})
export class ResourcesService {
  private manager = new LoadingManager(this.onLoad.bind(this), this.onProgress.bind(this), this.onError.bind(this));
  private gltfLoader = new GLTFLoader(this.manager);

  private loaded$ = new Subject<number>();
  private modelLoaded$ = new Subject<GLTF>();
  private resourcesLoaded$ = new Subject<void>();
  constructor() { }

  private onLoad() {
    // console.log('Loaded');
    this.resourcesLoaded$.next();
  }

  private onProgress(_url: string, loaded: number, total: number) {
    // console.log(`Loading ${url}`, loaded, total);
    this.loaded$.next((loaded/total));
  }

  private onError(url: string) {
    console.log('Error in loading ', url);
  }

  public loadModel(url: string) {
    this.gltfLoader.load(url, (gltf) => {
      this.modelLoaded$.next(gltf);
    })
  }

  public getLoadedAmount() {
    return this.loaded$.asObservable();
  }

  public getLoadedModel() {
    return this.modelLoaded$.asObservable();
  }

  public getResourcesLoaded() {
    return this.resourcesLoaded$.asObservable();
  }
  
}
