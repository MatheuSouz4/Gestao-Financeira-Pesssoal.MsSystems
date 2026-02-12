import { TestBed } from '@angular/core/testing';

import { QuitacoesService } from './quitacoes.service';

describe('QuitacoesService', () => {
  let service: QuitacoesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuitacoesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
