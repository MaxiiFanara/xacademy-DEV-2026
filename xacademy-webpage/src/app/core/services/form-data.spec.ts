import { TestBed } from '@angular/core/testing';

import { FormData } from './form-data';

describe('FormData', () => {
  let service: FormData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
