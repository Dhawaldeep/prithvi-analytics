import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'
import { Intersection, Mesh, Object3D, PerspectiveCamera, Raycaster, Vector2 } from 'three';
import { ISizes } from 'src/app/interfaces/sizes.interface';

@Injectable({
  providedIn: 'root'
})
export class RaycasterService {
  private instance = new Raycaster();
  private pointer = new Vector2();

  private intersections$ = new Subject<{ modelIntersections: Intersection[]; dimIntersections: Intersection[]}>();
  constructor() { }

  public raycastOnClickedPoint(event: MouseEvent, sizes: ISizes, camera: PerspectiveCamera, model: Object3D, markers: Mesh[]) {
    this.pointer.x = (event.clientX / sizes.width) * 2 - 1;
    this.pointer.y = -(event.clientY / sizes.height) * 2 + 1;

    this.instance.setFromCamera(this.pointer, camera);
    const intersections = this.instance.intersectObject(model, true);
    const dimIntersections = this.instance.intersectObjects(markers);
    this.intersections$.next({
      modelIntersections: intersections,
      dimIntersections,
    });
  }

  public getIntersections() {
    return this.intersections$.asObservable();
  }
}
