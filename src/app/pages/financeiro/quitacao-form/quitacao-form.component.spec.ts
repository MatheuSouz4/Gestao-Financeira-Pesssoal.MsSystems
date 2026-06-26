import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuitacaoFormComponent } from './quitacao-form.component';

describe('QuitacaoFormComponent', () => {
  let component: QuitacaoFormComponent;
  let fixture: ComponentFixture<QuitacaoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuitacaoFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QuitacaoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
