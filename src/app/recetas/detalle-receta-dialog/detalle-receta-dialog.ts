import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Receta } from '../../models/insumo.model';

@Component({
  selector: 'app-detalle-receta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './detalle-receta-dialog.html',
  styleUrls: ['./detalle-receta-dialog.scss']
})
export class DetalleRecetaDialogComponent {
  receta: Receta;

  constructor(
    private dialogRef: MatDialogRef<DetalleRecetaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { receta: Receta }
  ) {
    this.receta = data.receta;
    console.log('Data recibida en modal:', this.receta);
  }

  formatearCodigo(id?: number): string {
    if (!id) return 'REC-0000';
    return `REC-${id.toString().padStart(4, '0')}`;
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  formatearNumero(numero?: number): string {
    if (numero === null || numero === undefined) return '-';
    return numero.toFixed(2);
  }

  getIngredientesCount(receta: Receta): number {
    return receta.detalles?.length || 0;
  }

  getEstadoReceta(receta: Receta): string {
    const count = receta.detalles?.length || 0;
    return count > 0 ? 'Activa' : 'Vacía';
  }

  onClose(): void {
    this.dialogRef.close();
  }
} 