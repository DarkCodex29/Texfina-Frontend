import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfiguracionConfirmacion {
  titulo: string;
  subtitulo: string;
  mensaje: string;
  mensajeSecundario?: string;
  tipo: 'danger' | 'warning' | 'info';
  textoBotonConfirmar?: string;
  textoBotonCancelar?: string;
}

@Component({
  selector: 'app-confirmacion-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirmacion-dialog.component.html',
  styleUrls: ['./confirmacion-dialog.component.scss'],
})
export class ConfirmacionDialogComponent {
  config: ConfiguracionConfirmacion;

  constructor(
    private dialogRef: MatDialogRef<ConfirmacionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfiguracionConfirmacion
  ) {
    this.config = data;
  }

  obtenerIcono(): string {
    switch (this.config.tipo) {
      case 'danger':
        return 'delete_forever';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'help';
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
