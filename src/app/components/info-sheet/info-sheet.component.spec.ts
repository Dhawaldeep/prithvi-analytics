import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoSheetComponent } from './info-sheet.component';

describe('InfoSheetComponent', () => {
  let component: InfoSheetComponent;
  let fixture: ComponentFixture<InfoSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InfoSheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
