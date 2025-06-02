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
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { MaterialService } from '../services/material.service';
import { Lote, Insumo } from '../models/insumo.model';
import { EditarLoteDialogComponent } from './editar-lote-dialog/editar-lote-dialog';
import { DetalleLoteDialogComponent } from './detalle-lote-dialog/detalle-lote-dialog';

@Component({
  selector: 'app-lotes',
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
    MatSelectModule,
    MatChipsModule,
    MatSortModule,
    MatDatepickerModule,
  ],
  templateUrl: './lotes.html',
  styleUrls: ['./lotes.scss'],
})
export class LotesComponent implements OnInit {
  lotes: Lote[] = [];
  insumos: Insumo[] = [];
  filtrosForm: FormGroup;
  displayedColumns: string[] = [
    'lote',
    'insumo',
    'ubicacion',
    'stock_actual',
    'fecha_expiracion',
    'estado',
    'acciones',
  ];

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      lote: [''],
      insumo: [''],
      estado: [''],
      ubicacion: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Cargar lotes e insumos en paralelo
    this.materialService.getLotes().subscribe((lotes) => {
      this.lotes = lotes;
    });

    this.materialService.getMateriales().subscribe((insumos) => {
      this.insumos = insumos;
    });
  }

  buscar(): void {
    const filtros = this.filtrosForm.value;
    this.materialService.buscarLotes(filtros).subscribe((lotes) => {
      this.lotes = lotes;
    });
  }

  abrirNuevoLote(): void {
    const dialogRef = this.dialog.open(EditarLoteDialogComponent, {
      width: '700px',
      disableClose: true,
      data: { esNuevo: true, insumos: this.insumos },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarDatos();
      }
    });
  }

  verDetalle(lote: Lote): void {
    const insumo = this.insumos.find((i) => i.id_insumo === lote.id_insumo);
    this.dialog.open(DetalleLoteDialogComponent, {
      width: '600px',
      data: { lote, insumo },
    });
  }

  editarLote(lote: Lote): void {
    const dialogRef = this.dialog.open(EditarLoteDialogComponent, {
      width: '700px',
      disableClose: true,
      data: { lote, esNuevo: false, insumos: this.insumos },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarDatos();
      }
    });
  }

  getInsumoNombre(id_insumo?: number): string {
    const insumo = this.insumos.find((i) => i.id_insumo === id_insumo);
    return insumo ? insumo.nombre : 'Sin asignar';
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

  getStockStatus(lote: Lote): string {
    const porcentaje =
      ((lote.stock_actual || 0) / (lote.stock_inicial || 1)) * 100;
    if (porcentaje <= 10) return 'critical';
    if (porcentaje <= 25) return 'low';
    if (porcentaje <= 50) return 'medium';
    return 'good';
  }

  isLoteVencido(lote: Lote): boolean {
    if (!lote.fecha_expiracion) return false;
    return new Date(lote.fecha_expiracion) < new Date();
  }

  isLotePorVencer(lote: Lote): boolean {
    if (!lote.fecha_expiracion) return false;
    const hoy = new Date();
    const fechaVencimiento = new Date(lote.fecha_expiracion);
    const diasDiferencia = Math.ceil(
      (fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 3600 * 24)
    );
    return diasDiferencia <= 30 && diasDiferencia > 0;
  }
}

export { LotesComponent as Lotes };
