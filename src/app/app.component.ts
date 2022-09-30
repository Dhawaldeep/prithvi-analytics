import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatButtonToggle } from '@angular/material/button-toggle'
import { PrithviService } from './services/prithvi.service';
import { MODES } from './enums/modes.enum';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  public area = 0;

  public loadingBarScale$: Observable<string>;
  private ngUnSubscribe = new Subject<void>();
  constructor(
    private titleService: Title,
    private prithviService: PrithviService,
    private renderer: Renderer2,
    private sanckbar: MatSnackBar,
  ) {
    this.titleService.setTitle(this.title);
    this.loadingBarScale$ = prithviService.getLoadedAmount().pipe(
      takeUntil(this.ngUnSubscribe),
      map((val) => (val < 1 ? `scaleX(${val})` : ''))
    );
  }

  ngOnInit(): void {
    this.modeFormControl.valueChanges.pipe(takeUntil(this.ngUnSubscribe)).subscribe(modes => {
      this.prithviService.setMode(modes!);
      if (modes === MODES.DEFAULT) {
        this.container!.nativeElement.style.cursor = 'grab';
      }
      if (modes === MODES.DIM) {
        this.container!.nativeElement.style.cursor = 'crosshair';
        this.sanckbar.open(`
          Left click the 3D model, and the measurement between the two markers will display.\n
          Keep clicking to add more measurement markers. When the first marker and the last marker are close enough, the area will display.\n
          Press 'Escape' key to clear the measurement.
        `, 'OK', {
          verticalPosition: 'top',
        });
      }
    });
  }

  ngAfterViewInit(): void {
    this.prithviService.initialize(this.container!.nativeElement, this.ngUnSubscribe, [{
      assetUrl: `${environment.baseHref}assets/models/old_town_plovdiv/scene.gltf`
    }]);
    // this.prithviService.initialize(this.container!.nativeElement, this.ngUnSubscribe, [{
    //   assetUrl: `${environment.baseHref}assets/models/aerofotogrametria_-_cava_mineracao/scene.gltf`
    // }]);
    this.prithviService.getCurrentLength().pipe(takeUntil(this.ngUnSubscribe)).subscribe(data => {
      this.length = data.length;
      this.area = data.area || 0;
      if (this.chipContainer) {
        if (data.event) {
          this.renderer.setStyle(this.chipContainer.nativeElement, 'display', 'block');
          this.renderer.setStyle(this.chipContainer.nativeElement, 'transform', `translate(${data.event.x}px, ${data.event.y}px)`);
        } else {
          this.renderer.setStyle(this.chipContainer.nativeElement, 'display', 'none');
        }
      }
    });

    this.sanckbar.open("ORBIT: Left click + drag or One finger drag (touch). ZOOM: Double click on model or scroll anywhere or Pinch (touch). PAN: Right click + drag or Two fingers drag (touch)", "OK", {
      verticalPosition: 'top',
    }).afterDismissed().subscribe(() => {
      this.sanckbar.open("Cick on 'Measurement' button to toggle measurement mode.", 'OK', {
        verticalPosition: 'top',
      });
    })
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.code === 'Escape') {
      this.prithviService.onEscapePress();
    }
  }

  public onMouseDown() {
    if (this.modeFormControl.value === MODES.DEFAULT) {
      if (this.container) {
        this.container.nativeElement.style.cursor = 'grabbing';
      }
      return;
    };
    this.mouseDown = true;
    if (this.clickTimeout) {
      clearTimeout(this.clickTimeout);
    }
    this.clickTimeout = setTimeout(() => {
      this.mouseDown = false;
    }, 200);
  }

  public onMouseUp(event: MouseEvent) {
    if (this.modeFormControl.value === MODES.DEFAULT) {
      if (this.container) {
        this.container.nativeElement.style.cursor = 'grab';
      }
    } else {
      if (this.container) {
        this.container.nativeElement.style.cursor = 'crosshair';
      }
    };
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
