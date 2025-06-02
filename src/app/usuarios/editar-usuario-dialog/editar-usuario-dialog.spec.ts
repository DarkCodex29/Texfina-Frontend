import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarUsuarioDialog } from './editar-usuario-dialog';

describe('EditarUsuarioDialog', () => {
  let component: EditarUsuarioDialog;
  let fixture: ComponentFixture<EditarUsuarioDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarUsuarioDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarUsuarioDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
