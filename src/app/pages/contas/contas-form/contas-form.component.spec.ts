import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContasFormComponent } from './contas-form.component';

describe('ContasFormComponent', () => {
  let component: ContasFormComponent;
  let fixture: ComponentFixture<ContasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContasFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
