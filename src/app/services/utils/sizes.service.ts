import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';
import { ISizes } from 'src/app/interfaces/sizes.interface';

@Injectable({
  providedIn: 'root'
})
export class SizesService {
  private resize = new Subject<void>()
  constructor() { }

  public setup() {
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private onResize() {
      this.resize.next();
  }

  public getResize() {
    return this.resize.asObservable();
  }

  public destroy() {
    window.removeEventListener('resize', this.onResize.bind(this));
  }


}
