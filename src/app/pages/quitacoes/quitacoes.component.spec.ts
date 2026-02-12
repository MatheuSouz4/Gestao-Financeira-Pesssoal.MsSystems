import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuitacoesComponent } from './quitacoes.component';

describe('QuitacoesComponent', () => {
  let component: QuitacoesComponent;
  let fixture: ComponentFixture<QuitacoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuitacoesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuitacoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
