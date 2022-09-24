import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BufferGeometry, Line, Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three';

@Injectable({
  providedIn: 'root'
})
export class DimensionService {
  private lengthMarkers: Mesh[] = [];

  private dimensionLine?: Line;

  private meshAdded$ = new Subject<Mesh | Line>();
  private lengthObj$ = new Subject<{
    position?: Vector3;
    length: number;
  }>();
  constructor() { }

  public setMarker(position: Vector3) {
    const marker = new Mesh(new SphereGeometry(), new MeshBasicMaterial({ color: 0xD50000, transparent: true, opacity: 0.5 }));
    marker.position.copy(position);
    this.lengthMarkers.push(marker);
    this.meshAdded$.next(marker);
    if (this.lengthMarkers.length > 0) {
      if (this.dimensionLine) {
        this.dimensionLine.geometry.setFromPoints(this.lengthMarkers.map(marker => marker.position));
        this.meshAdded$.next(this.dimensionLine);
      } else {
        const geometry = new BufferGeometry();
        geometry.setFromPoints(this.lengthMarkers.map(marker => marker.position));
        this.dimensionLine = new Line(geometry, new MeshBasicMaterial({ color: 0xD50000 }));
      }
      const lengthObj: {length: number; prevPos: Vector3} = this.lengthMarkers.reduce((acc, curr) => {
        const segmentDistance = acc.prevPos.distanceTo(curr.position);
        return {
          prevPos: curr.position,
          length: segmentDistance + acc.length,
        }
      }, {
        length: 0,
        prevPos: this.lengthMarkers[0].position
      } as {length: number; prevPos: Vector3});

      this.lengthObj$.next({
        length: lengthObj.length,
        position: lengthObj.prevPos
      });
    }
  }

  public meshAdded() {
    return this.meshAdded$.asObservable();
  }

  public getLengthObj() {
    return this.lengthObj$.asObservable();
  }

  public getToBeRemovedMeshes() {
    return [...this.lengthMarkers, this.dimensionLine];
  }

  public destroy() {
    this.lengthMarkers.splice(0);
    delete this['dimensionLine'];
    this.lengthObj$.next({
      length: 0,
    });
  }

}
