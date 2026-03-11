import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuitacoesFormComponent } from './quitacoes-form.component';

describe('QuitacoesFormComponent', () => {
  let component: QuitacoesFormComponent;
  let fixture: ComponentFixture<QuitacoesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuitacoesFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuitacoesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
