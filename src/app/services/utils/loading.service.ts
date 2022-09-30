import { Injectable } from '@angular/core';
import { Mesh, PlaneGeometry, ShaderMaterial } from 'three';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private overlayGeometry?: PlaneGeometry;
  private overlayMaterial?: ShaderMaterial;

  constructor() { }

  public initLoadingObjects() {
    this.overlayGeometry = new PlaneGeometry(2, 2, 1, 1);
    this.overlayMaterial = new ShaderMaterial({
      // wireframe: true,
      transparent: true,
      uniforms: {
        uAlpha: { value: 1 },
      },
      vertexShader: `
           void main()
           {
               gl_Position = vec4(position, 1.0);
           }
       `,
      fragmentShader: `
           uniform float uAlpha;
   
           void main()
           {
               gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
           }
       `,
    });
    return new Mesh(this.overlayGeometry, this.overlayMaterial);
  }

  public destroy() {
    delete this['overlayGeometry'];
    delete this['overlayMaterial'];
  }
}
