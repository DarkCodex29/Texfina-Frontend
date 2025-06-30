import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Lote, Insumo } from '../../models/insumo.model';

interface DialogData {
  lote: Lote;
  insumo?: Insumo;
}

@Component({
  selector: 'app-detalle-lote-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './detalle-lote-dialog.html',
  styleUrls: ['./detalle-lote-dialog.scss'],
})
export class DetalleLoteDialogComponent {
  lote: Lote;
  insumo?: Insumo;
  Math = Math;

  constructor(
    public dialogRef: MatDialogRef<DetalleLoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.lote = data.lote;
    this.insumo = data.insumo;
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  getEstadoColor(estado?: string): string {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'success';
      case 'agotado':
        return 'warn';
      case 'vencido':
        return 'danger';
      case 'reservado':
        return 'primary';
      default:
        return 'default';
    }
  }

  getStockStatus(): string {
    const porcentaje = this.calcularPorcentajeStock();
    if (porcentaje <= 10) return 'critical';
    if (porcentaje <= 25) return 'low';
    if (porcentaje <= 50) return 'medium';
    return 'good';
  }

  calcularPorcentajeStock(): number {
    const stockInicial = this.lote.stock_inicial ?? 0;
    const stockActual = this.lote.stock_actual ?? 0;
    if (stockInicial === 0) return 0;
    return Math.round((stockActual / stockInicial) * 100);
  }

  isLoteVencido(): boolean {
    if (!this.lote.fecha_expiracion) return false;
    return new Date(this.lote.fecha_expiracion) < new Date();
  }

  isLotePorVencer(): boolean {
    if (!this.lote.fecha_expiracion) return false;
    const hoy = new Date();
    const fechaVencimiento = new Date(this.lote.fecha_expiracion);
    const diasDiferencia = Math.ceil(
      (fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24)
    );
    return diasDiferencia <= 30 && diasDiferencia > 0;
  }

  getDiasParaVencimiento(): number {
    if (!this.lote.fecha_expiracion) return 0;
    const hoy = new Date();
    const fechaVencimiento = new Date(this.lote.fecha_expiracion);
    return Math.ceil(
      (fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24)
    );
  }

  getPrecioUnitario(): number {
    const stockInicial = this.lote.stock_inicial ?? 0;
    const precioTotal = this.lote.precio_total ?? 0;
    if (stockInicial === 0) return 0;
    return precioTotal / stockInicial;
  }

  getValorActual(): number {
    const stockActual = this.lote.stock_actual ?? 0;
    const precioUnitario = this.getPrecioUnitario();
    return stockActual * precioUnitario;
  }

  getRecomendacion(): string {
    if (this.isLoteVencido()) {
      return 'Este lote ha vencido y debe ser retirado del inventario.';
    }

    if (this.isLotePorVencer()) {
      const dias = this.getDiasParaVencimiento();
      return `Este lote vence en ${dias} días. Considere usarlo pronto.`;
    }

    const porcentaje = this.calcularPorcentajeStock();
    if (porcentaje <= 10) {
      return 'Stock crítico. Considere reordenar este insumo.';
    }

    if (porcentaje <= 25) {
      return 'Stock bajo. Revise si necesita reordenar.';
    }

    return 'El lote está en buen estado y con stock adecuado.';
  }

  getEjemplosUso(): string[] {
    if (!this.insumo) return [];

    const ejemplos: string[] = [];
    const nombre = this.insumo.nombre.toLowerCase();

    if (nombre.includes('hilo') || nombre.includes('fibra')) {
      ejemplos.push('Producción de telas', 'Tejido de punto', 'Bordados');
    } else if (nombre.includes('tela') || nombre.includes('textil')) {
      ejemplos.push('Confección de prendas', 'Tapicería', 'Decoración');
    } else if (nombre.includes('botón') || nombre.includes('cremallera')) {
      ejemplos.push('Acabados de prendas', 'Accesorios', 'Reparaciones');
    } else if (nombre.includes('tinte') || nombre.includes('color')) {
      ejemplos.push('Teñido de telas', 'Estampados', 'Acabados textiles');
    } else {
      ejemplos.push(
        'Producción textil',
        'Manufactura',
        'Procesos industriales'
      );
    }

    return ejemplos;
  }

  getDiasAbsolutos(): number {
    return Math.abs(this.getDiasParaVencimiento());
  }

  formatearCodigo(id?: number): string {
    if (!id) return '00001';
    return id.toString().padStart(5, '0');
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  formatearFecha(fecha?: string | Date): string {
    if (!fecha) return '-';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleDateString('es-ES');
  }

  formatearNumero(numero?: number): string {
    if (numero === null || numero === undefined) return '0';
    return numero.toString();
  }

  formatearPrecio(precio?: number): string {
    if (!precio) return '$0.00';
    return `$${precio.toFixed(2)}`;
  }

  getEstadoVencimiento(): string {
    if (!this.lote.fecha_expiracion) return '-';

    const hoy = new Date();
    const fechaVencimiento = new Date(this.lote.fecha_expiracion);
    const diffTime = fechaVencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Vencido';
    if (diffDays <= 7) return 'Por vencer';
    return 'Vigente';
  }
}
