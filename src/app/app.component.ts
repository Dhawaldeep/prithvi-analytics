import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil, Observable } from 'rxjs';
import { map, tap, filter } from 'rxjs/operators';
import { MatButtonToggle } from '@angular/material/button-toggle'
import { PrithviService } from './services/prithvi.service';
import { MODES } from './enums/modes.enum';
import { environment } from 'src/environments/environment';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { InfoSheetComponent } from './components/info-sheet/info-sheet.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('container') container?: ElementRef<HTMLDivElement>;
  @ViewChild('chipContainer') chipContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('modeButton') modeButton?: MatButtonToggle;
  public title = 'Prithvi Analytics';
  public hideTitle = false;

  // public modeFormControl = new FormControl<MODES>(MODES.DEFAULT);

  public measurementControl = new FormControl<boolean>(false);

  private mouseDown = false;
  private clickTimeout?: NodeJS.Timer;

  public length = 0;
  public area = 0;

  public loadingBarScale$: Observable<string>;
  private ngUnSubscribe = new Subject<void>();
  private error?: Error;
  constructor(
    private titleService: Title,
    private prithviService: PrithviService,
    private renderer: Renderer2,
    private _bottomSheet: MatBottomSheet,
    private snackbar: MatSnackBar,
  ) {
    this.titleService.setTitle(this.title);
    this.loadingBarScale$ = prithviService.getLoadedAmount().pipe(
      takeUntil(this.ngUnSubscribe),
      tap(val => {
        if (val === 1) {
          setTimeout(() => {
            this.hideTitle = true;
          }, 500);
        }
      }),
      map((val) => (val < 1 ? `scaleX(${val})` : ''))
    );
  }

  ngOnInit(): void {
    // this.modeFormControl.valueChanges.pipe(takeUntil(this.ngUnSubscribe)).subscribe(modes => {
    //   this.prithviService.setMode(modes!);
    //   if (modes === MODES.DEFAULT) {
    //     this.container!.nativeElement.style.cursor = 'grab';
    //   }
    //   if (modes === MODES.DIM) {
    //     this.container!.nativeElement.style.cursor = 'crosshair';
    //   }
    // });

    this.measurementControl.valueChanges.pipe(takeUntil(this.ngUnSubscribe)).subscribe((enabled) => {
      this.prithviService.setMode(enabled ? MODES.DIM : MODES.DEFAULT);
      if (!enabled) {
        this.container!.nativeElement.style.cursor = 'grab';
      } else {
        this.container!.nativeElement.style.cursor = 'crosshair';
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
    this.prithviService.getCurrentLength().pipe(
      takeUntil(this.ngUnSubscribe)
    ).subscribe({
      next: ({ value, error }) => {
        this.length = value.length;
        this.area = value.area || 0;
        if (this.chipContainer) {
          if (value.event) {
            this.renderer.setStyle(this.chipContainer.nativeElement, 'display', 'block');
            this.renderer.setStyle(this.chipContainer.nativeElement, 'transform', `translate(${value.event.x}px, ${value.event.y}px)`);
          } else {
            this.renderer.setStyle(this.chipContainer.nativeElement, 'display', 'none');
          }
        }

        if (error && !this.error) {
          const errorMessage = error.message;
          console.log(errorMessage);
          this.snackbar.open(errorMessage, 'Dismiss');
        }
        this.error = error;
      },
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.prithviService.onEscapePress();
    }
  }

  public onMouseDown() {
    // if (this.modeFormControl.value === MODES.DEFAULT) {
    if (!this.measurementControl.value) {
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
    if (!this.measurementControl.value) {
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

  public openInfoBox() {
    this._bottomSheet.open(InfoSheetComponent);
  }

  ngOnDestroy(): void {
    this.prithviService.destroy();
    this.ngUnSubscribe.next();
    this.ngUnSubscribe.complete();
  }
}
