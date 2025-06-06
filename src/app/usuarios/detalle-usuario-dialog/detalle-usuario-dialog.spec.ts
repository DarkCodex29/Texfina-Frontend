import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleUsuarioDialogComponent } from './detalle-usuario-dialog';

describe('DetalleUsuarioDialogComponent', () => {
  let component: DetalleUsuarioDialogComponent;
  let fixture: ComponentFixture<DetalleUsuarioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleUsuarioDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleUsuarioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
