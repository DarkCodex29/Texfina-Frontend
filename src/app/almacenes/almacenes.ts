import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MaterialService } from '../services/material.service';
import { Almacen } from '../models/insumo.model';
import { EditarAlmacenDialogComponent } from './editar-almacen-dialog/editar-almacen-dialog';
import { DetalleAlmacenDialogComponent } from './detalle-almacen-dialog/detalle-almacen-dialog';

@Component({
  selector: 'app-almacenes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './almacenes.html',
  styleUrls: ['./almacenes.scss'],
})
export class AlmacenesComponent implements OnInit {
  almacenes: Almacen[] = [];
  filtrosForm: FormGroup;
  displayedColumns: string[] = ['codigo', 'nombre', 'ubicacion', 'acciones'];

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      nombre: [''],
      ubicacion: [''],
    });
  }

  ngOnInit(): void {
    this.cargarAlmacenes();
  }

  cargarAlmacenes(): void {
    this.materialService.getAlmacenes().subscribe((almacenes) => {
      this.almacenes = almacenes;
    });
  }

  buscar(): void {
    const filtros = this.filtrosForm.value;
    // Implementar búsqueda filtrada cuando esté lista la API
    this.cargarAlmacenes();
  }

  formatearCodigo(id?: number): string {
    if (!id) return '00000';
    return id.toString().padStart(5, '0');
  }

  abrirNuevoAlmacen(): void {
    const dialogRef = this.dialog.open(EditarAlmacenDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { esNuevo: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarAlmacenes();
      }
    });
  }

  verDetalle(almacen: Almacen): void {
    this.dialog.open(DetalleAlmacenDialogComponent, {
      width: '600px',
      data: almacen,
    });
  }

  editarAlmacen(almacen: Almacen): void {
    const dialogRef = this.dialog.open(EditarAlmacenDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { almacen, esNuevo: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarAlmacenes();
      }
    });
  }
}

export { AlmacenesComponent as Almacenes };
