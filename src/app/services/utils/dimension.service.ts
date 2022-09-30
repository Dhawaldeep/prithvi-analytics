import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { BufferAttribute, BufferGeometry, DoubleSide, Intersection, Line, Mesh, MeshBasicMaterial, Shape, ShapeGeometry, SphereGeometry, Triangle, Vector2, Vector3 } from 'three';
import * as poly2tri from 'poly2tri';

@Injectable({
  providedIn: 'root'
})
export class DimensionService {
  private lengthMarkers: Mesh[] = [];

  private dimensionLine?: Line;
  private dimensionPolygon?: Mesh;
  private meshAdded$ = new Subject<Mesh | Line>();
  private lengthObj$ = new BehaviorSubject<{
    value: {
      position?: Vector3;
      length: number;
      area?: number;
    },
    error?: Error
  }>({ value: { length: 0 } });
  private requestMeshRemoval$ = new Subject<void>();
  constructor() { }

  public setMarker(data: { dimIntersections: Intersection[]; modelIntersections: Intersection[]; }) {
    if (data.dimIntersections.length > 0 || data.modelIntersections.length > 0) {
      if (this.lengthMarkers.length > 3 && this.dimensionPolygon) {
        this.requestMeshRemoval$.next();
      }
    }
    if (data.dimIntersections.length > 0 && this.lengthMarkers.length > 2) {
      const bufferGeometry = new BufferGeometry();

      const points = this.lengthMarkers.map(m => m.position);
      const triangles: Triangle[] = [];
      try {
        const swctx = new poly2tri.SweepContext(points.map(v => {
          return new poly2tri.Point(v.x, v.z);
        }));
        swctx.triangulate();
        const vertices = new Float32Array(swctx.getTriangles().map(triangle => {
          const triangleVertices = triangle.getPoints().map(point => {
            const y = points.find(v => v.x === point.x && v.z === point.y)!.y;
            return new Vector3(point.x, y, point.y);
          });
          triangles.push(new Triangle(triangleVertices[0], triangleVertices[1], triangleVertices[2]));
          return triangleVertices
        }).reduce((acc, curr) => {
          return [
            ...acc,
            ...curr.reduce((pacc, pcurr) => {
              return [
                ...pacc,
                pcurr.x, pcurr.y, pcurr.z
              ]
            }, [] as number[])
          ]
        }, [] as number[]));

        const surfaceArea = triangles.reduce((acc, curr) => {
          return acc + curr.getArea();
        }, 0);

        bufferGeometry.setAttribute('position', new BufferAttribute(vertices, 3));

        this.dimensionPolygon = new Mesh(bufferGeometry, new MeshBasicMaterial({ color: 0xD50000, transparent: true, opacity: 0.5, side: DoubleSide }));
        // this.dimensionPolygon.renderOrder = 2;
        (this.dimensionPolygon.material as MeshBasicMaterial).depthTest = false;
        this.meshAdded$.next(this.dimensionPolygon);

        const lengthObj: { length: number; prevPos: Vector3 } = [...this.lengthMarkers, this.lengthMarkers[0]].reduce((acc, curr) => {
          const segmentDistance = acc.prevPos.distanceTo(curr.position);
          return {
            prevPos: curr.position,
            length: segmentDistance + acc.length,
          }
        }, {
          length: 0,
          prevPos: this.lengthMarkers[0].position
        } as { length: number; prevPos: Vector3 });

        this.lengthObj$.next({
          value: {
            length: lengthObj.length,
            area: surfaceArea,
            position: lengthObj.prevPos
          }
        });

      } catch (error) {
        this.lengthObj$.next({ value: this.lengthObj$.value.value, error: new Error(`Not a valid polygon. Please press 'Escape' key & draw a valid polygon, with no intersecting sides, to measure area.`) });
      }
    } else {
      if (data.modelIntersections.length > 0) {
        const position = data.modelIntersections[0].point;
        position.setY(position.y);
        const marker = new Mesh(new SphereGeometry(1), new MeshBasicMaterial({ color: 0xD50000, transparent: true, opacity: 0.5 }));
        marker.position.copy(position);
        marker.userData = {
          'type': 'marker'
        };
        // marker.renderOrder = 2;
        (marker.material as MeshBasicMaterial).depthTest = false;
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
            (this.dimensionLine.material as MeshBasicMaterial).depthTest = false;
            // this.dimensionLine.renderOrder = 2;
          }
          const lengthObj: { length: number; prevPos: Vector3 } = this.lengthMarkers.reduce((acc, curr) => {
            const segmentDistance = acc.prevPos.distanceTo(curr.position);
            return {
              prevPos: curr.position,
              length: segmentDistance + acc.length,
            }
          }, {
            length: 0,
            prevPos: this.lengthMarkers[0].position
          } as { length: number; prevPos: Vector3 });

          this.lengthObj$.next({
            value: {
              length: lengthObj.length,
              position: lengthObj.prevPos
            }
          });
        }
      }
    }
  }

  public meshAdded() {
    return this.meshAdded$.asObservable();
  }

  public getLengthObj() {
    return this.lengthObj$.asObservable();
  }

  public getToBeRemovedMeshes() {
    return [...this.lengthMarkers, this.dimensionLine, this.dimensionPolygon];
  }

  public requestDimMeshesRemoval() {
    return this.requestMeshRemoval$.asObservable();
  }

  public destroy() {
    this.lengthMarkers.splice(0);
    delete this['dimensionLine'];
    delete this['dimensionPolygon'];
    this.lengthObj$.next({
      value: {
        length: 0,
      }
    });
  }

}
