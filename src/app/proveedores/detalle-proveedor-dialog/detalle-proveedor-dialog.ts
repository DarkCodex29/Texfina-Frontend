import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Proveedor } from '../../models/insumo.model';

@Component({
  selector: 'app-detalle-proveedor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './detalle-proveedor-dialog.html',
  styleUrls: ['./detalle-proveedor-dialog.scss'],
})
export class DetalleProveedorDialogComponent {
  proveedor: Proveedor;

  constructor(
    private dialogRef: MatDialogRef<DetalleProveedorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { proveedor: Proveedor }
  ) {
    this.proveedor = data.proveedor;
    console.log('Data recibida en modal:', this.proveedor);
  }

  formatearCodigo(id?: number): string {
    if (!id) return '00001';
    return id.toString().padStart(5, '0');
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
