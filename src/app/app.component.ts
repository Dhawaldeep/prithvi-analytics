import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonToggle } from '@angular/material/button-toggle'
import { PrithviService } from './services/prithvi.service';
import { MODES } from './enums/modes.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  private title = 'Prithvi Analytics';
  @ViewChild('container') container?: ElementRef<HTMLDivElement>;
  @ViewChild('chipContainer') chipContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('modeButton') modeButton?: MatButtonToggle;
  public modeFormControl = new FormControl<MODES>(MODES.DEFAULT);

  private mouseDown = false;
  private clickTimeout?: NodeJS.Timer;

  public length = 0;

  private ngUnSubscribe = new Subject<void>();
  constructor(private titleService: Title, private prithviService: PrithviService, private renderer: Renderer2) {
    this.titleService.setTitle(this.title);
  }

  ngOnInit(): void {
    this.modeFormControl.valueChanges.pipe(takeUntil(this.ngUnSubscribe)).subscribe(modes => {
      this.prithviService.setMode(modes!);
    });
  }

  ngAfterViewInit(): void {
    this.prithviService.initialize(this.container!.nativeElement, this.ngUnSubscribe, [{
      assetUrl: '/assets/models/old_town_plovdiv/scene.gltf'
    }]);
    // this.prithviService.initialize(this.container!.nativeElement, this.ngUnSubscribe, [{
    //   assetUrl: '/assets/models/aerofotogrametria_-_cava_mineracao/scene.gltf'
    // }]);
    this.prithviService.getCurrentLength().pipe(takeUntil(this.ngUnSubscribe)).subscribe(data => {
      this.length = data.length;
      if (this.chipContainer) {
        if (data.event) {
          this.renderer.setStyle(this.chipContainer.nativeElement, 'display', 'block');
          this.renderer.setStyle(this.chipContainer.nativeElement, 'transform', `translate(${data.event.x}px, ${data.event.y}px)`);
        } else {
          this.renderer.setStyle(this.chipContainer.nativeElement, 'display', 'none');
        }
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      this.prithviService.onEscapePress();
    }
  }

  public onMouseDown() {
    if (this.modeFormControl.value === MODES.DEFAULT) return;
    this.mouseDown = true;
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
    this.clickTimeout = setTimeout(() => {
      this.mouseDown = false;
    }, 200);
  }

  public onMouseUp(event: MouseEvent) {
    if (this.modeFormControl.value === MODES.DEFAULT) return;
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
