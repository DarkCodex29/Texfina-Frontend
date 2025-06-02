import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleUsuarioDialog } from './detalle-usuario-dialog';

describe('DetalleUsuarioDialog', () => {
  let component: DetalleUsuarioDialog;
  let fixture: ComponentFixture<DetalleUsuarioDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleUsuarioDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleUsuarioDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
