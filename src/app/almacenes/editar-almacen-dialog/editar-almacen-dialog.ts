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

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MaterialService } from '../../services/material.service';
import { Almacen } from '../../models/insumo.model';

interface DialogData {
  almacen?: Almacen;
  esNuevo: boolean;
}

@Component({
  selector: 'app-editar-almacen-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './editar-almacen-dialog.html',
  styleUrls: ['./editar-almacen-dialog.scss'],
})
export class EditarAlmacenDialogComponent implements OnInit {
  almacenForm: FormGroup;
  esNuevo: boolean;
  almacen?: Almacen;

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private dialogRef: MatDialogRef<EditarAlmacenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.esNuevo = data.esNuevo;
    this.almacen = data.almacen;

    this.almacenForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      ubicacion: ['', [Validators.maxLength(200)]],
    });
  }

  ngOnInit(): void {
    if (!this.esNuevo && this.almacen) {
      this.almacenForm.patchValue({
        nombre: this.almacen.nombre,
        ubicacion: this.almacen.ubicacion,
      });
    }
  }

  onSubmit(): void {
    if (this.almacenForm.valid) {
      const almacenData = this.almacenForm.value;

      if (this.esNuevo) {
        this.materialService.crearAlmacen(almacenData).subscribe(() => {
          this.dialogRef.close(true);
        });
      } else if (this.almacen) {
        const almacenActualizado = {
          ...almacenData,
          id_almacen: this.almacen.id_almacen,
        };
        this.materialService
          .actualizarAlmacen(almacenActualizado)
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

export { EditarAlmacenDialogComponent as EditarAlmacenDialog };
