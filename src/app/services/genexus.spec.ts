import { TestBed } from '@angular/core/testing';
import { GenexusService } from './genexus'


describe('Genexus', () => {
  let service: GenexusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GenexusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
