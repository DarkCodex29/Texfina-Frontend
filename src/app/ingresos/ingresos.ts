import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSortModule } from '@angular/material/sort';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

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
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatPaginatorModule,
    MatCardModule,
    MatTooltipModule,
    MatChipsModule,
    MatSortModule,
  ],
  templateUrl: './ingresos.html',
  styleUrls: ['./ingresos.scss'],
})
export class IngresosComponent implements OnInit, AfterViewInit, OnDestroy {
  // ============================================================================
  // PROPIEDADES DE DATOS
  // ============================================================================
  ingresos: Ingreso[] = [];
  ingresosFiltrados: Ingreso[] = [];
  insumos: Insumo[] = [];
  unidades: Unidad[] = [];
  lotes: Lote[] = [];
  dataSource = new MatTableDataSource<Ingreso>([]);

  // ============================================================================
  // PROPIEDADES DE ESTADO
  // ============================================================================
  isLoading = false;
  hasError = false;
  errorMessage = '';
  filtrosExpanded = false;

  // ============================================================================
  // PROPIEDADES DE FILTROS
  // ============================================================================
  filtrosForm: FormGroup;
  private destroy$ = new Subject<void>();

  // ============================================================================
  // CONFIGURACIÓN DE TABLA
  // ============================================================================
  displayedColumns: string[] = [
    'fecha',
    'insumo',
    'cantidad',
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
    this.inicializarFiltros();
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    // Configuración adicional después de la vista
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================================================
  // MÉTODOS DE INICIALIZACIÓN
  // ============================================================================
  inicializarFiltros(): void {
    // Configurar filtros en tiempo real con debounce
    this.filtrosForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltros();
      });
  }

  cargarDatos(): void {
    this.isLoading = true;
    this.hasError = false;

    // Cargar ingresos e insumos en paralelo
    this.materialService.getIngresos().subscribe({
      next: (ingresos) => {
        this.ingresos = ingresos;
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (error) => {
        this.hasError = true;
        this.errorMessage = 'Error al cargar los ingresos';
        this.isLoading = false;
        console.error('Error al cargar ingresos:', error);
      },
    });

    this.materialService.getMateriales().subscribe({
      next: (insumos: any) => {
        this.insumos = insumos;
      },
      error: (error) => console.error('Error al cargar insumos:', error),
    });

    this.materialService.getUnidades().subscribe({
      next: (unidades) => {
        this.unidades = unidades;
      },
      error: (error) => console.error('Error al cargar unidades:', error),
    });

    this.materialService.getLotes().subscribe({
      next: (lotes) => {
        this.lotes = lotes;
      },
      error: (error) => console.error('Error al cargar lotes:', error),
    });
  }

  // ============================================================================
  // MÉTODOS DE FILTROS
  // ============================================================================
  toggleFiltros(): void {
    this.filtrosExpanded = !this.filtrosExpanded;
  }

  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    let ingresosFiltrados = [...this.ingresos];

    // Filtro por Insumo
    if (filtros.insumo && filtros.insumo.trim()) {
      ingresosFiltrados = ingresosFiltrados.filter((ingreso) => {
        const insumoNombre = this.getInsumoNombre(ingreso.id_insumo);
        return insumoNombre
          .toLowerCase()
          .includes(filtros.insumo.toLowerCase());
      });
    }

    // Filtro por Número de Remisión
    if (filtros.numero_remision && filtros.numero_remision.trim()) {
      ingresosFiltrados = ingresosFiltrados.filter((ingreso) =>
        ingreso.numero_remision
          ?.toLowerCase()
          .includes(filtros.numero_remision.toLowerCase())
      );
    }

    // Filtro por Orden de Compra
    if (filtros.orden_compra && filtros.orden_compra.trim()) {
      ingresosFiltrados = ingresosFiltrados.filter((ingreso) =>
        ingreso.orden_compra
          ?.toLowerCase()
          .includes(filtros.orden_compra.toLowerCase())
      );
    }

    // Filtro por Estado
    if (filtros.estado && filtros.estado.trim()) {
      ingresosFiltrados = ingresosFiltrados.filter((ingreso) =>
        this.getEstadoIngreso(ingreso)
          .toLowerCase()
          .includes(filtros.estado.toLowerCase())
      );
    }

    this.ingresosFiltrados = ingresosFiltrados;
    this.dataSource.data = this.ingresosFiltrados;
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.aplicarFiltros();
  }

  // ============================================================================
  // MÉTODOS DE TABLA
  // ============================================================================
  sortData(column: string): void {
    console.log('Ordenar por:', column);
    // TODO: Implementar ordenamiento
  }

  // ============================================================================
  // MÉTODOS DE ACCIONES
  // ============================================================================
  abrirRegistroIngreso(): void {
    console.log('Abrir registro de ingreso');
    // TODO: Implementar modal de registro
  }

  abrirIngresoMasivo(): void {
    console.log('Abrir ingreso masivo');
    // TODO: Implementar modal de ingreso masivo
  }

  verDetalle(ingreso: Ingreso): void {
    console.log('Ver detalle de ingreso:', ingreso);
    // TODO: Implementar modal de detalle
  }

  editarIngreso(ingreso: Ingreso): void {
    console.log('Editar ingreso:', ingreso);
    // TODO: Implementar modal de edición
  }

  reintentarCarga(): void {
    this.cargarDatos();
  }

  // ============================================================================
  // MÉTODOS UTILITARIOS
  // ============================================================================
  getInsumoNombre(id_insumo?: number): string {
    if (!id_insumo) return '-';
    const insumo = this.insumos.find((i) => i.id_insumo === id_insumo);
    return insumo ? insumo.nombre : `Insumo #${id_insumo}`;
  }

  getInsumoCodigoFox(id_insumo?: number): string {
    if (!id_insumo) return '';
    const insumo = this.insumos.find((i) => i.id_insumo === id_insumo);
    return insumo?.id_fox || '';
  }

  getUnidadNombre(id_unidad?: string): string {
    if (!id_unidad) return '';
    const unidad = this.unidades.find((u) => u.id_unidad === id_unidad);
    return unidad ? unidad.nombre : id_unidad;
  }

  getLoteNombre(id_lote?: number): string {
    if (!id_lote) return '-';
    const lote = this.lotes.find((l) => l.id_lote === id_lote);
    return lote ? lote.lote || `L-${id_lote}` : `L-${id_lote}`;
  }

  getEstadoIngreso(ingreso: Ingreso): string {
    return ingreso.estado || 'PENDIENTE';
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  }

  formatearCantidad(cantidad?: number): string {
    return (
      cantidad?.toLocaleString('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }) || '0'
    );
  }

  formatearPrecio(precio?: number): string {
    if (!precio) return 'S/ 0.00';
    return precio.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'PEN',
      currencyDisplay: 'symbol',
    });
  }

  // ============================================================================
  // PROPIEDADES COMPUTADAS PARA ESTADOS
  // ============================================================================
  get isEmpty(): boolean {
    return !this.isLoading && !this.hasError && this.ingresos.length === 0;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      !this.hasError &&
      this.ingresos.length > 0 &&
      this.ingresosFiltrados.length === 0
    );
  }
}

export { IngresosComponent as Ingresos };
