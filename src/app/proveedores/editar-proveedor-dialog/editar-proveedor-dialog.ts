import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Proveedor } from '../../models/insumo.model';

@Component({
  selector: 'app-editar-proveedor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './editar-proveedor-dialog.html',
  styleUrls: ['./editar-proveedor-dialog.scss'],
})
export class EditarProveedorDialogComponent {
  proveedorForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditarProveedorDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { proveedor?: Proveedor; esNuevo: boolean }
  ) {
    this.isEditMode = !data.esNuevo;

    this.proveedorForm = this.fb.group({
      empresa: ['', [Validators.required]],
      ruc: ['', [Validators.required]],
      contacto: [''],
      direccion: [''],
    });

    if (this.isEditMode && data.proveedor) {
      this.cargarDatosProveedor(data.proveedor);
    }
  }

  cargarDatosProveedor(proveedor: Proveedor): void {
    this.proveedorForm.patchValue({
      ruc: proveedor.ruc || '',
      empresa: proveedor.empresa || '',
      direccion: proveedor.direccion || '',
      contacto: proveedor.contacto || '',
    });
  }

  formatearCodigo(id?: number): string {
    if (!id) return '00000';
    return id.toString().padStart(5, '0');
  }

  onSubmit(): void {
    if (this.proveedorForm.valid) {
      const formData = this.proveedorForm.value;

      const proveedor: Proveedor = {
        empresa: formData.empresa,
        ruc: formData.ruc,
        direccion: formData.direccion,
        contacto: formData.contacto,
      };

      if (this.isEditMode) {
        proveedor.id_proveedor = this.data.proveedor?.id_proveedor;
      }

      this.dialogRef.close(proveedor);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
