import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Consumo } from '../../models/consumo.model';
import { Insumo, Lote } from '../../models/insumo.model';

interface DetalleConsumoData {
  consumo: Consumo;
  insumos?: Insumo[];
  lotes?: Lote[];
}

@Component({
  selector: 'app-detalle-consumo-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './detalle-consumo-dialog.component.html',
  styleUrls: ['./detalle-consumo-dialog.component.scss'],
})
export class DetalleConsumoDialogComponent {
  consumo: Consumo;
  insumos: Insumo[];
  lotes: Lote[];
  insumoNombre: string = '';
  insumoCodigoFox: string = '';
  unidadNombre: string = '';
  loteNombre: string = '';

  constructor(
    private dialogRef: MatDialogRef<DetalleConsumoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DetalleConsumoData
  ) {
    this.consumo = data.consumo;
    this.insumos = data.insumos || [];
    this.lotes = data.lotes || [];

    console.log('Data recibida en modal detalle consumo:', this.data);
    this.cargarDatosRelacionados();
  }

  private cargarDatosRelacionados(): void {
    if (this.consumo.id_insumo) {
      const insumo = this.insumos.find(
        (i) => i.id_insumo === this.consumo.id_insumo
      );
      this.insumoNombre = insumo?.nombre || 'Insumo no encontrado';
      this.insumoCodigoFox = insumo?.id_fox || 'Sin código';
      this.unidadNombre = insumo?.unidad?.nombre || 'Sin unidad';
    }

    if (this.consumo.id_lote) {
      const lote = this.lotes.find((l) => l.id_lote === this.consumo.id_lote);
      this.loteNombre = lote?.lote || 'Lote no encontrado';
    }
  }

  formatearCodigo(id?: number): string {
    if (!id) return '00001';
    return id.toString().padStart(5, '0');
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '-';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatearCantidad(cantidad?: number): string {
    if (!cantidad) return '-';
    return `${cantidad.toFixed(2)}`;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
