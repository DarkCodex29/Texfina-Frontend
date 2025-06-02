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
import { Clase } from '../../models/insumo.model';

interface DialogData {
  clase?: Clase;
  esNuevo: boolean;
}

@Component({
  selector: 'app-editar-clase-dialog',
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
  templateUrl: './editar-clase-dialog.html',
  styleUrls: ['./editar-clase-dialog.scss'],
})
export class EditarClaseDialogComponent implements OnInit {
  claseForm: FormGroup;
  esNuevo: boolean;
  clase?: Clase;

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private dialogRef: MatDialogRef<EditarClaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.esNuevo = data.esNuevo;
    this.clase = data.clase;

    this.claseForm = this.fb.group({
      id_clase: ['', [Validators.required, Validators.pattern(/^[A-Z_]+$/)]],
      familia: ['', [Validators.required]],
      sub_familia: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (!this.esNuevo && this.clase) {
      this.claseForm.patchValue({
        id_clase: this.clase.id_clase,
        familia: this.clase.familia,
        sub_familia: this.clase.sub_familia,
      });

      // Si es edición, deshabilitar el campo código
      this.claseForm.get('id_clase')?.disable();
    }
  }

  onSubmit(): void {
    if (this.claseForm.valid) {
      const claseData = this.claseForm.value;

      if (this.esNuevo) {
        this.materialService.crearClase(claseData).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else if (this.clase) {
        this.materialService
          .actualizarClase(this.clase.id_clase, claseData)
          .subscribe(() => {
            this.dialogRef.close(true);
          });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

export { EditarClaseDialogComponent as EditarClaseDialog };
