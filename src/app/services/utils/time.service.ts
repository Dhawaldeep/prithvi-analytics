import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private start?: number;
  private current?: number;
  private elapsed?: number;
  private delta?: number;

  private isActive = false;

  private trigger = new Subject<void>();
  constructor() { }

  public setup() {
    this.start = Date.now();
    this.current = this.start;

    this.elapsed = 0;
    this.delta = 16;

    window.requestAnimationFrame(() => {
      this.tick();
    });
    this.isActive = true;
  }

  public tick() {
    if (this.isActive) {
      const currentTime = Date.now();
      this.delta = currentTime - this.current!;
      this.current = currentTime;
      this.elapsed = this.current - this.start!;
  
      this.trigger.next();
  
      window.requestAnimationFrame(() => {
        this.tick();
      });
    }
  }

  public getTrigger() {
    return this.trigger.asObservable();
  }

  public stop() {
    delete this['start'];
    delete this['delta'];
    delete this['current'];
    delete this['elapsed'];

    this.isActive = false;
  }
}
