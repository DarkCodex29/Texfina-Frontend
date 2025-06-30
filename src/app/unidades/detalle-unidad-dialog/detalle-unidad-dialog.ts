import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { Unidad } from '../../models/insumo.model';

@Component({
  selector: 'app-detalle-unidad-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
  ],
  templateUrl: './detalle-unidad-dialog.html',
  styleUrls: ['./detalle-unidad-dialog.scss'],
})
export class DetalleUnidadDialogComponent {
  unidad: Unidad;

  constructor(
    private dialogRef: MatDialogRef<DetalleUnidadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { unidad: Unidad }
  ) {
    this.unidad = data.unidad;
    console.log('Data recibida en modal:', this.unidad);
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

export { DetalleUnidadDialogComponent as DetalleUnidadDialog };
