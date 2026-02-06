import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjecoesComponent } from './projecoes.component';

describe('ProjecoesComponent', () => {
  let component: ProjecoesComponent;
  let fixture: ComponentFixture<ProjecoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjecoesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjecoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
