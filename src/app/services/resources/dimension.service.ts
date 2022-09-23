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
  constructor() { }

  public setMarker(position: Vector3) {
    const marker = new Mesh(new SphereGeometry(), new MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 }));
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
        this.dimensionLine = new Line(geometry, new MeshBasicMaterial({ color: 0x00ff00 }));
      }
    }
  }

  public meshAdded() {
    return this.meshAdded$.asObservable();
  }

  
}
