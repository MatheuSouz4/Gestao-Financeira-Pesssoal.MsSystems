import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LancamentosFormComponent } from './lancamentos-form.component';

describe('LancamentosFormComponent', () => {
  let component: LancamentosFormComponent;
  let fixture: ComponentFixture<LancamentosFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LancamentosFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LancamentosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
