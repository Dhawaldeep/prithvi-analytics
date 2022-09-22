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

  private loadedPercentage$ = new Subject<number>();
  private modelLoaded$ = new Subject<GLTF>();
  constructor() { }

  private onLoad() {
    console.log('Loaded');
  }

  private onProgress(url: string, loaded: number, total: number) {
    console.log(`Loading ${url}`, loaded, total);
    this.loadedPercentage$.next((loaded/total)*100);
  }

  private onError(url: string) {
    console.log('Error in loading ', url);
  }

  public loadModel(url: string) {
    this.gltfLoader.load(url, (gltf) => {
      this.modelLoaded$.next(gltf);
    })
  }

  public getLoadedPercentage() {
    return this.loadedPercentage$.asObservable();
  }

  public getLoadedModel() {
    return this.modelLoaded$.asObservable();
  }
}
