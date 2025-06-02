import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MaterialService } from '../../services/material.service';
import { Unidad } from '../../models/insumo.model';

interface DialogData {
  unidad?: Unidad;
  esNuevo: boolean;
}

@Component({
  selector: 'app-editar-unidad-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './editar-unidad-dialog.html',
  styleUrls: ['./editar-unidad-dialog.scss'],
})
export class EditarUnidadDialogComponent implements OnInit {
  unidadForm: FormGroup;
  esNuevo: boolean;

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private dialogRef: MatDialogRef<EditarUnidadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.esNuevo = data.esNuevo;
    this.unidadForm = this.fb.group({
      id_unidad: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[A-Z0-9_]+$/),
        ],
      ],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  ngOnInit(): void {
    if (!this.esNuevo && this.data.unidad) {
      this.unidadForm.patchValue(this.data.unidad);
      // Deshabilitar el campo ID al editar
      this.unidadForm.get('id_unidad')?.disable();
    }
  }

  onSubmit(): void {
    if (this.unidadForm.valid) {
      const unidadData = {
        ...this.unidadForm.value,
        id_unidad: this.unidadForm.get('id_unidad')?.value?.toUpperCase(),
      };

      try {
        if (this.esNuevo) {
          this.materialService.crearUnidad(unidadData).subscribe({
            next: (result) => {
              this.dialogRef.close(result);
            },
            error: (error) => {
              console.error('Error al crear unidad:', error);
              // Aquí podrías mostrar un mensaje de error
            },
          });
        } else {
          // Combinar datos para actualizar con ID original preservado
          const unidadActualizada = {
            ...unidadData,
            id_unidad: this.data.unidad!.id_unidad,
          };
          this.materialService.actualizarUnidad(unidadActualizada).subscribe({
            next: (result) => {
              this.dialogRef.close(result);
            },
            error: (error) => {
              console.error('Error al actualizar unidad:', error);
              // Aquí podrías mostrar un mensaje de error
            },
          });
        }
      } catch (error) {
        console.error('Error:', error);
        // Aquí podrías mostrar un mensaje de error
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Validadores personalizados
  get idUnidadErrors() {
    const control = this.unidadForm.get('id_unidad');
    if (control?.hasError('required')) return 'El código es requerido';
    if (control?.hasError('maxlength'))
      return 'El código no puede exceder 50 caracteres';
    if (control?.hasError('pattern'))
      return 'Solo se permiten letras mayúsculas, números y guiones bajos';
    return null;
  }

  get nombreErrors() {
    const control = this.unidadForm.get('nombre');
    if (control?.hasError('required')) return 'El nombre es requerido';
    if (control?.hasError('maxlength'))
      return 'El nombre no puede exceder 100 caracteres';
    return null;
  }
}

export { EditarUnidadDialogComponent as EditarUnidadDialog };
