import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { PrithviService } from './services/prithvi.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private title = 'Prithvi Analytics';
  @ViewChild('container') container?: ElementRef<HTMLDivElement>;

  private mouseDown = false;
  private clickTimeout?: NodeJS.Timer;

  private ngUnSubscribe = new Subject<void>();
  constructor(private titleService: Title, private prithviService: PrithviService) {
    this.titleService.setTitle(this.title);
  }

  ngAfterViewInit(): void {
    this.prithviService.initialize(this.container!.nativeElement, this.ngUnSubscribe, [{
      assetUrl: '/assets/models/old_town_plovdiv/scene.gltf'
    }]);
    // this.prithviService.initialize(this.container!.nativeElement, this.ngUnSubscribe, [{
    //   assetUrl: '/assets/models/aerofotogrametria_-_cava_mineracao/scene.gltf'
    // }]);
  }

  public onMouseDown() {
    this.mouseDown = true;
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
    this.clickTimeout = setTimeout(() => {
      this.mouseDown = false;
    }, 500);
  }

  public onMouseUp(event: MouseEvent) {
    if (this.mouseDown) {
      this.prithviService.onClick(event);
      if (this.clickTimeout) {
        clearTimeout(this.clickTimeout);
      }
    }
  }

  ngOnDestroy(): void {
    this.prithviService.destroy();
    this.ngUnSubscribe.next();
    this.ngUnSubscribe.complete();
  }
}
