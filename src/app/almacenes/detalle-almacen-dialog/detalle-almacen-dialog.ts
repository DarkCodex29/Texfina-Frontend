import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Almacen } from '../../models/insumo.model';

@Component({
  selector: 'app-detalle-almacen-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './detalle-almacen-dialog.html',
  styleUrls: ['./detalle-almacen-dialog.scss'],
})
export class DetalleAlmacenDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<DetalleAlmacenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public almacen: Almacen
  ) {}

  formatearCodigo(id?: number): string {
    if (!id) return '00000';
    return id.toString().padStart(5, '0');
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}

export { DetalleAlmacenDialogComponent as DetalleAlmacenDialog };
