import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  HostListener,
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
import { MatSortModule, MatSort } from '@angular/material/sort';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  finalize,
  delay,
} from 'rxjs';

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
  @ViewChild(MatSort) sort!: MatSort;

  // ============================================================================
  // PROPIEDADES DE DATOS
  // ============================================================================
  ingresos: Ingreso[] = [];
  insumos: Insumo[] = [];
  unidades: Unidad[] = [];
  lotes: Lote[] = [];
  dataSource = new MatTableDataSource<Ingreso>([]);

  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosExpanded = true;
  filtrosColumnaHabilitados = false;
  filtrosColumnaActivos = false;
  private destroy$ = new Subject<void>();

  // ============================================================================
  // PROPIEDADES DE ESTADO
  // ============================================================================
  isLoading = false;
  hasError = false;
  errorMessage = '';

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

  get ingresosFiltrados(): Ingreso[] {
    return this.dataSource.data;
  }

  get isEmpty(): boolean {
    return !this.isLoading && this.ingresos.length === 0 && !this.hasError;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      this.dataSource.data.length === 0 &&
      this.ingresos.length > 0
    );
  }

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtroGeneralForm = this.fb.group({
      busquedaGeneral: [''],
    });

    this.filtrosColumnaForm = this.fb.group({
      fecha: [''],
      insumo: [''],
      cantidad: [''],
      lote: [''],
      precio_total: [''],
      numero_remision: [''],
      estado: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.configurarFiltroGeneralEnTiempoReal();
    this.configurarFiltrosColumnaEnTiempoReal();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  configurarFiltroGeneralEnTiempoReal(): void {
    this.filtroGeneralForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltroGeneral();
      });
  }

  configurarFiltrosColumnaEnTiempoReal(): void {
    this.filtrosColumnaForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltrosColumna();
      });
  }

  // ============================================================================
  // MÉTODOS DE INICIALIZACIÓN
  // ============================================================================
  cargarDatos(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log('🔄 Iniciando carga de ingresos - isLoading:', this.isLoading);

    // Cargar ingresos e insumos en paralelo
    this.materialService
      .getIngresos()
      .pipe(
        delay(1500),
        finalize(() => {
          this.isLoading = false;
          console.log('✅ Carga completada - isLoading:', this.isLoading);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (ingresos) => {
          console.log('📦 Ingresos cargados:', ingresos.length);
          this.ingresos = ingresos;
          this.dataSource.data = [...ingresos];
        },
        error: (error) => {
          console.error('❌ Error al cargar ingresos:', error);
          this.hasError = true;
          this.errorMessage =
            'Error al cargar los ingresos. Por favor, intenta nuevamente.';
          this.ingresos = [];
          this.dataSource.data = [];
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

  reintentarCarga(): void {
    this.cargarDatos();
  }

  // ============================================================================
  // MÉTODOS DE FILTROS
  // ============================================================================
  aplicarFiltroGeneral(): void {
    const busqueda = this.filtroGeneralForm
      .get('busquedaGeneral')
      ?.value?.trim()
      .toLowerCase();

    if (!busqueda) {
      this.dataSource.data = [...this.ingresos];
      return;
    }

    const ingresosFiltrados = this.ingresos.filter((ingreso) => {
      const insumoNombre = this.getInsumoNombre(
        ingreso.id_insumo
      ).toLowerCase();
      const insumoCodigoFox = this.getInsumoCodigoFox(
        ingreso.id_insumo
      ).toLowerCase();
      const numeroRemision = ingreso.numero_remision?.toLowerCase() || '';
      const ordenCompra = ingreso.orden_compra?.toLowerCase() || '';
      const loteNombre = this.getLoteNombre(ingreso.id_lote).toLowerCase();
      const estado = this.getEstadoIngreso(ingreso).toLowerCase();
      const fecha = this.formatearFecha(ingreso.fecha).toLowerCase();

      return (
        insumoNombre.includes(busqueda) ||
        insumoCodigoFox.includes(busqueda) ||
        numeroRemision.includes(busqueda) ||
        ordenCompra.includes(busqueda) ||
        loteNombre.includes(busqueda) ||
        estado.includes(busqueda) ||
        fecha.includes(busqueda)
      );
    });

    this.dataSource.data = ingresosFiltrados;
  }

  aplicarFiltrosColumna(): void {
    const filtros = this.filtrosColumnaForm.value;
    let ingresosFiltrados = [...this.ingresos];

    // Filtro por Fecha
    if (filtros.fecha && filtros.fecha.trim()) {
      ingresosFiltrados = ingresosFiltrados.filter((ingreso) => {
        const fecha = this.formatearFecha(ingreso.fecha);
        return fecha.includes(filtros.fecha);
      });
    }

    // Filtro por Insumo
    if (filtros.insumo && filtros.insumo.trim()) {
      ingresosFiltrados = ingresosFiltrados.filter((ingreso) => {
        const insumoNombre = this.getInsumoNombre(ingreso.id_insumo);
        return insumoNombre
          .toLowerCase()
          .includes(filtros.insumo.toLowerCase());
      });
    }

    // Filtro por Cantidad
    if (filtros.cantidad && filtros.cantidad.toString().trim()) {
      const cantidadFiltro = parseFloat(filtros.cantidad);
      if (!isNaN(cantidadFiltro)) {
        ingresosFiltrados = ingresosFiltrados.filter((ingreso) => {
          const cantidad = ingreso.cantidad || 0;
          return (
            cantidad >= cantidadFiltro - 0.01 &&
            cantidad <= cantidadFiltro + 0.01
          );
        });
      }
    }

    // Filtro por Lote
    if (filtros.lote && filtros.lote.trim()) {
      ingresosFiltrados = ingresosFiltrados.filter((ingreso) => {
        const loteNombre = this.getLoteNombre(ingreso.id_lote);
        return loteNombre.toLowerCase().includes(filtros.lote.toLowerCase());
      });
    }

    // Filtro por Precio Total
    if (filtros.precio_total && filtros.precio_total.toString().trim()) {
      const precioFiltro = parseFloat(filtros.precio_total);
      if (!isNaN(precioFiltro)) {
        ingresosFiltrados = ingresosFiltrados.filter((ingreso) => {
          const precio = ingreso.precio_total_formula || 0;
          return precio >= precioFiltro - 0.01 && precio <= precioFiltro + 0.01;
        });
      }
    }

    // Filtro por Número de Remisión
    if (filtros.numero_remision && filtros.numero_remision.trim()) {
      ingresosFiltrados = ingresosFiltrados.filter((ingreso) =>
        ingreso.numero_remision
          ?.toLowerCase()
          .includes(filtros.numero_remision.toLowerCase())
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

    this.dataSource.data = ingresosFiltrados;
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.reset();
    this.dataSource.data = [...this.ingresos];
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
    this.dataSource.data = [...this.ingresos];
  }

  toggleFiltrosColumna() {
    this.filtrosColumnaHabilitados = !this.filtrosColumnaHabilitados;
    this.filtrosColumnaActivos = !this.filtrosColumnaActivos;

    if (this.filtrosColumnaHabilitados) {
      if (this.filtrosColumnaActivos) {
        this.limpiarFiltroGeneral();
      } else {
        this.limpiarFiltrosColumna();
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'F3') {
      event.preventDefault();
      this.toggleFiltrosColumna();
    }
  }

  toggleFiltros(): void {
    this.filtrosExpanded = !this.filtrosExpanded;
  }

  // ============================================================================
  // MÉTODOS DE TABLA
  // ============================================================================
  sortData(column: string): void {
    if (this.sort) {
      // Si ya está ordenado por esta columna, cambiar dirección
      if (this.sort.active === column) {
        this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        // Nueva columna, empezar con ascendente
        this.sort.active = column;
        this.sort.direction = 'asc';
      }
      this.sort.sortChange.emit({
        active: this.sort.active,
        direction: this.sort.direction,
      });
    }
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

  formatearFecha(fecha?: Date | string): string {
    if (!fecha) return '-';
    try {
      const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
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
}

export { IngresosComponent as Ingresos };
