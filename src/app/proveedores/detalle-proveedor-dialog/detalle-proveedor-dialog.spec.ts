import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleProveedorDialog } from './detalle-proveedor-dialog';

describe('DetalleProveedorDialog', () => {
  let component: DetalleProveedorDialog;
  let fixture: ComponentFixture<DetalleProveedorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleProveedorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleProveedorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
