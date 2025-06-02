import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Insumo } from '../../models/insumo.model';

@Component({
  selector: 'app-detalle-material-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './detalle-material-dialog.component.html',
  styleUrls: ['./detalle-material-dialog.component.scss'],
})
export class DetalleMaterialDialogComponent {
  material: Insumo;

  // Datos por defecto basados en el diseño
  detalleCompleto = {
    codigo: '103832',
    lote: 'KN542',
    descripcion_material: 'Tinte1',
    proveedor: 'Texfina',
    almacen: 'Texfina',
    unidad_medida_base: 'KG',
    tipo_material: 'KG',
    codigo_ean1: '2345678907654',
    codigo_ean2: '432345676543',
  };

  constructor(
    private dialogRef: MatDialogRef<DetalleMaterialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Insumo
  ) {
    this.material = data;

    // Mapear datos del material a los campos del detalle
    if (this.material) {
      this.detalleCompleto = {
        codigo: this.material.id_fox || '103832',
        lote: 'KN542', // Este vendría de la relación con lotes
        descripcion_material: this.material.nombre || 'Tinte1',
        proveedor: 'Texfina', // Este vendría de la relación con proveedores
        almacen: 'Texfina', // Este vendría de la relación con almacenes
        unidad_medida_base: this.material.id_unidad || 'KG',
        tipo_material: this.material.id_unidad || 'KG',
        codigo_ean1: '2345678907654', // Estos campos no están en la BD actual
        codigo_ean2: '432345676543',
      };
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
