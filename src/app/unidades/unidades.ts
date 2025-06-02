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
import { Unidad } from '../models/insumo.model';
import { EditarUnidadDialogComponent } from './editar-unidad-dialog/editar-unidad-dialog';
import { DetalleUnidadDialogComponent } from './detalle-unidad-dialog/detalle-unidad-dialog';

@Component({
  selector: 'app-unidades',
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
  templateUrl: './unidades.html',
  styleUrls: ['./unidades.scss'],
})
export class UnidadesComponent implements OnInit {
  unidades: Unidad[] = [];
  filtrosForm: FormGroup;
  displayedColumns: string[] = ['codigo', 'descripcion', 'acciones'];

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      descripcion: [''],
    });
  }

  ngOnInit(): void {
    this.cargarUnidades();
  }

  cargarUnidades(): void {
    this.materialService.getUnidades().subscribe((unidades) => {
      this.unidades = unidades;
    });
  }

  buscar(): void {
    const filtros = this.filtrosForm.value;
    // Implementar búsqueda filtrada cuando esté lista la API
    this.cargarUnidades();
  }

  abrirNuevaUnidad(): void {
    const dialogRef = this.dialog.open(EditarUnidadDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { esNuevo: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarUnidades();
      }
    });
  }

  verDetalle(unidad: Unidad): void {
    this.dialog.open(DetalleUnidadDialogComponent, {
      width: '500px',
      data: unidad,
    });
  }

  editarUnidad(unidad: Unidad): void {
    const dialogRef = this.dialog.open(EditarUnidadDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { unidad, esNuevo: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarUnidades();
      }
    });
  }
}

export { UnidadesComponent as Unidades };
