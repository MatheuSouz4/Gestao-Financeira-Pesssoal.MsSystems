import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstornoFormComponent } from './estorno-form.component';

describe('EstornoFormComponent', () => {
  let component: EstornoFormComponent;
  let fixture: ComponentFixture<EstornoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstornoFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstornoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
