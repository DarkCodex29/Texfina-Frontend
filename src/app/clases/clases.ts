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
import { Clase } from '../models/insumo.model';
import { EditarClaseDialogComponent } from './editar-clase-dialog/editar-clase-dialog';
import { DetalleClaseDialogComponent } from './detalle-clase-dialog/detalle-clase-dialog';

@Component({
  selector: 'app-clases',
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
  templateUrl: './clases.html',
  styleUrls: ['./clases.scss'],
})
export class ClasesComponent implements OnInit {
  clases: Clase[] = [];
  filtrosForm: FormGroup;
  displayedColumns: string[] = ['codigo', 'familia', 'sub_familia', 'acciones'];

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      familia: [''],
      sub_familia: [''],
    });
  }

  ngOnInit(): void {
    this.cargarClases();
  }

  cargarClases(): void {
    this.materialService.getClases().subscribe((clases) => {
      this.clases = clases;
    });
  }

  buscar(): void {
    const filtros = this.filtrosForm.value;
    // Implementar búsqueda filtrada cuando esté lista la API
    this.cargarClases();
  }

  abrirNuevaClase(): void {
    const dialogRef = this.dialog.open(EditarClaseDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { esNuevo: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarClases();
      }
    });
  }

  verDetalle(clase: Clase): void {
    this.dialog.open(DetalleClaseDialogComponent, {
      width: '600px',
      data: clase,
    });
  }

  editarClase(clase: Clase): void {
    const dialogRef = this.dialog.open(EditarClaseDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { clase, esNuevo: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarClases();
      }
    });
  }
}

export { ClasesComponent as Clases };
