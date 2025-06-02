import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarProveedorDialog } from './editar-proveedor-dialog';

describe('EditarProveedorDialog', () => {
  let component: EditarProveedorDialog;
  let fixture: ComponentFixture<EditarProveedorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarProveedorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarProveedorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
