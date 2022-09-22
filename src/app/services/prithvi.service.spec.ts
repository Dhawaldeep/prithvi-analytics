import { TestBed } from '@angular/core/testing';

import { PrithviService } from './prithvi.service';

describe('PrithviService', () => {
  let service: PrithviService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrithviService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
