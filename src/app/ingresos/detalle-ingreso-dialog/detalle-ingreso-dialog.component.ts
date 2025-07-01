import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Ingreso } from '../../models/insumo.model';

@Component({
  selector: 'app-detalle-ingreso-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './detalle-ingreso-dialog.component.html',
  styleUrls: ['./detalle-ingreso-dialog.component.scss'],
})
export class DetalleIngresoDialogComponent {
  ingreso: Ingreso;

  constructor(
    private dialogRef: MatDialogRef<DetalleIngresoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ingreso: Ingreso }
  ) {
    this.ingreso = data.ingreso;
    console.log('Data recibida en modal:', this.ingreso);
  }

  formatearCodigo(id?: number): string {
    if (!id) return '00001';
    return id.toString().padStart(5, '0');
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  formatearFecha(fecha?: Date | string): string {
    if (!fecha) return '-';
    try {
      const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  }

  formatearCantidad(cantidad?: number): string {
    return (
      cantidad?.toLocaleString('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }) || '0'
    );
  }

  formatearPrecio(precio?: number): string {
    if (!precio || precio === 0) return 'S/ 0.00';
    return `S/ ${precio.toFixed(2)}`;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
