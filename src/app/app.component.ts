import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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

  private ngUnSubscribe = new Subject<void>();
  constructor(private titleService: Title, private prithviServive: PrithviService) {
    this.titleService.setTitle(this.title);
  }

  ngAfterViewInit(): void {
    this.prithviServive.initialize(this.container!.nativeElement, this.ngUnSubscribe, [{
      assetUrl: '/assets/models/old_town_plovdiv/scene.gltf'
    }]);
    // this.prithviServive.initialize(this.container!.nativeElement, this.ngUnSubscribe, [{
    //   assetUrl: '/assets/models/aerofotogrametria_-_cava_mineracao/scene.gltf'
    // }]);
  }

  ngOnDestroy(): void {
    this.prithviServive.destroy();
    this.ngUnSubscribe.next();
    this.ngUnSubscribe.complete();
  }
}
