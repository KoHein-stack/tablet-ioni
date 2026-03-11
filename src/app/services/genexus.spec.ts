import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GenexusService } from './genexus'


describe('Genexus', () => {
  let service: GenexusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(GenexusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
