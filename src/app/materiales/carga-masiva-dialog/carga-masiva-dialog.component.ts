import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfiguracionCargaMasiva } from '../../services/carga-masiva.service';

export interface CargaMasivaDialogData {
  configuracion: ConfiguracionCargaMasiva<any>;
  onDescargarPlantilla: () => void;
  onProcesarArchivo: (archivo: File) => Promise<void>;
}

@Component({
  selector: 'app-carga-masiva-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './carga-masiva-dialog.component.html',
  styleUrls: ['./carga-masiva-dialog.component.scss'],
})
export class CargaMasivaDialogComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  archivoSeleccionado: File | null = null;
  procesando = false;
  mensaje = '';
  tipoMensaje: 'info' | 'success' | 'error' = 'info';

  constructor(
    public dialogRef: MatDialogRef<CargaMasivaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CargaMasivaDialogData
  ) {}

  descargarPlantilla(): void {
    try {
      this.data.onDescargarPlantilla();
      this.mostrarMensaje('Plantilla descargada exitosamente', 'success');
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
      this.mostrarMensaje('Error al descargar la plantilla', 'error');
    }
  }

  seleccionarArchivo(): void {
    this.fileInput.nativeElement.click();
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];

      if (this.validarArchivo(archivo)) {
        this.archivoSeleccionado = archivo;
        this.mensaje = `Archivo seleccionado: ${archivo.name}`;
        this.tipoMensaje = 'info';
      }
    }
  }

  private validarArchivo(archivo: File): boolean {
    const extensionesPermitidas = ['.xlsx', '.xls'];
    const extension = archivo.name
      .toLowerCase()
      .substring(archivo.name.lastIndexOf('.'));

    if (!extensionesPermitidas.includes(extension)) {
      this.mostrarMensaje(
        'Solo se permiten archivos Excel (.xlsx, .xls)',
        'error'
      );
      return false;
    }

    const tamañoMaximo = 10 * 1024 * 1024;
    if (archivo.size > tamañoMaximo) {
      this.mostrarMensaje('El archivo no puede ser mayor a 10MB', 'error');
      return false;
    }

    return true;
  }

  async procesar(): Promise<void> {
    if (!this.archivoSeleccionado) {
      this.mostrarMensaje('Debe seleccionar un archivo', 'error');
      return;
    }

    this.procesando = true;
    this.mostrarMensaje('Procesando archivo...', 'info');

    try {
      await this.data.onProcesarArchivo(this.archivoSeleccionado);
      this.mostrarMensaje('Archivo procesado exitosamente', 'success');

      setTimeout(() => {
        this.dialogRef.close(true);
      }, 2000);
    } catch (error: any) {
      console.error('Error al procesar archivo:', error);
      this.mostrarMensaje(
        error.message || 'Error al procesar el archivo',
        'error'
      );
    } finally {
      this.procesando = false;
    }
  }

  private mostrarMensaje(
    mensaje: string,
    tipo: 'info' | 'success' | 'error'
  ): void {
    this.mensaje = mensaje;
    this.tipoMensaje = tipo;
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  get puedeCargar(): boolean {
    return !!this.archivoSeleccionado && !this.procesando;
  }
}
