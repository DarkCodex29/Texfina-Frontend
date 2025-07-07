import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface CampoDetalle {
  key: string;
  label: string;
  tipo: 'text' | 'number' | 'select' | 'textarea' | 'date';
  ancho?: 'normal' | 'completo';
  opciones?: { value: any; label: string }[];
  formateo?: (valor: any) => string;
}

export interface ConfiguracionDetalle {
  entidad: string;
  entidadArticulo: string;
  filas: CampoDetalle[][];
  datos: any;
}

@Component({
  selector: 'app-detalle-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './detalle-dialog.component.html',
  styleUrls: ['./detalle-dialog.component.scss'],
})
export class DetalleDialogComponent {
  config: ConfiguracionDetalle;

  constructor(
    private dialogRef: MatDialogRef<DetalleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfiguracionDetalle
  ) {
    this.config = data;
  }

  obtenerValorCampo(key: string): string {
    const valor = this.config.datos[key];

    // Buscar si hay formateo personalizado
    const campo = this.buscarCampo(key);
    if (campo?.formateo) {
      return campo.formateo(valor);
    }

    // Formateo por defecto
    if (valor === null || valor === undefined || valor === '') {
      return '-';
    }

    return valor.toString();
  }

  private buscarCampo(key: string): CampoDetalle | undefined {
    for (const fila of this.config.filas) {
      const campo = fila.find((c) => c.key === key);
      if (campo) {
        return campo;
      }
    }
    return undefined;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
