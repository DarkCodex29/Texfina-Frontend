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
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MaterialService } from '../services/material.service';
import { Ingreso, Insumo, Unidad, Lote } from '../models/insumo.model';

@Component({
  selector: 'app-ingresos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatSortModule,
    MatDialogModule,
  ],
  templateUrl: './ingresos.html',
  styleUrls: ['./ingresos.scss'],
})
export class IngresosComponent implements OnInit {
  ingresos: Ingreso[] = [];
  insumos: Insumo[] = [];
  unidades: Unidad[] = [];
  lotes: Lote[] = [];
  filtrosForm: FormGroup;

  displayedColumns: string[] = [
    'fecha',
    'insumo',
    'cantidad',
    'presentacion',
    'lote',
    'precio_total',
    'numero_remision',
    'estado',
    'acciones',
  ];

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      insumo: [''],
      numero_remision: [''],
      orden_compra: [''],
      estado: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Cargar ingresos e insumos en paralelo
    this.materialService.getIngresos().subscribe((ingresos) => {
      this.ingresos = ingresos;
    });

    this.materialService.getMateriales().subscribe((insumos: any) => {
      this.insumos = insumos;
    });

    this.materialService.getUnidades().subscribe((unidades) => {
      this.unidades = unidades;
    });

    this.materialService.getLotes().subscribe((lotes) => {
      this.lotes = lotes;
    });
  }

  buscar(): void {
    const filtros = this.filtrosForm.value;
    this.materialService.buscarIngresos(filtros).subscribe((ingresos) => {
      this.ingresos = ingresos;
    });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.cargarDatos();
  }

  abrirNuevoIngreso(): void {
    // TODO: Implementar modal de nuevo ingreso
    console.log('Abrir modal de nuevo ingreso');
  }

  verDetalle(ingreso: Ingreso): void {
    // TODO: Implementar modal de detalle
    console.log('Ver detalle de ingreso:', ingreso);
  }

  editarIngreso(ingreso: Ingreso): void {
    // TODO: Implementar modal de edición
    console.log('Editar ingreso:', ingreso);
  }

  getInsumoNombre(id_insumo?: number): string {
    if (!id_insumo) return '-';
    const insumo = this.insumos.find((i) => i.id_insumo === id_insumo);
    return insumo ? insumo.nombre : `Insumo #${id_insumo}`;
  }

  getUnidadNombre(id_unidad?: string): string {
    if (!id_unidad) return '';
    const unidad = this.unidades.find((u) => u.id_unidad === id_unidad);
    return unidad ? unidad.nombre : id_unidad;
  }

  getLoteNombre(id_lote?: number): string {
    if (!id_lote) return '-';
    const lote = this.lotes.find((l) => l.id_lote === id_lote);
    return lote ? lote.lote || `Lote #${id_lote}` : `Lote #${id_lote}`;
  }

  getColorEstado(estado?: string): string {
    switch (estado?.toUpperCase()) {
      case 'PROCESADO':
        return 'success';
      case 'PENDIENTE':
        return 'warn';
      case 'ANULADO':
        return 'default';
      default:
        return 'primary';
    }
  }
}

export { IngresosComponent as Ingresos };
