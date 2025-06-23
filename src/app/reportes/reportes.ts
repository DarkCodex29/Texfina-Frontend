import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { Subject, takeUntil, debounceTime } from 'rxjs';

export interface ReporteInventario {
  id_insumo: number;
  codigo_fox: string;
  nombre: string;
  almacen: string;
  clase: string;
  stock_actual: number;
  costo_unitario: number;
  valor_total: number;
  rotacion: number;
  dias_inventario: number;
}

export interface ReporteMovimiento {
  id_movimiento: number;
  fecha: string;
  tipo_movimiento: 'INGRESO' | 'EGRESO' | 'AJUSTE';
  codigo_fox: string;
  material: string;
  cantidad: number;
  almacen: string;
  usuario: string;
  observaciones: string;
}

export interface KPI {
  nombre: string;
  valor: string;
  descripcion: string;
  tendencia: 'up' | 'down' | 'stable';
  porcentaje?: number;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatSortModule,
  ],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.scss'],
})
export class ReportesComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estado del componente
  filtrosForm: FormGroup;
  filtrosExpanded = true;
  cargandoReporte = false;
  hasError = false;
  errorMessage = '';

  // Datos
  reporteInventario: ReporteInventario[] = [];
  reporteMovimientos: ReporteMovimiento[] = [];
  reporteInventarioFiltrado: ReporteInventario[] = [];
  reporteMovimientosFiltrado: ReporteMovimiento[] = [];
  kpis: KPI[] = [];

  // Catálogos
  almacenes = [
    { id: 1, nombre: 'Almacén Principal' },
    { id: 2, nombre: 'Almacén Secundario' },
    { id: 3, nombre: 'Almacén de Tránsito' },
  ];

  clases = [
    { id: 1, nombre: 'Fibras Naturales' },
    { id: 2, nombre: 'Fibras Sintéticas' },
    { id: 3, nombre: 'Hilos' },
    { id: 4, nombre: 'Telas' },
    { id: 5, nombre: 'Accesorios' },
  ];

  // Configuración de tablas
  displayedColumnsInventario: string[] = [
    'codigo',
    'material',
    'almacen',
    'clase',
    'stock',
    'valor',
    'rotacion',
    'dias',
  ];

  displayedColumnsMovimientos: string[] = [
    'fecha',
    'tipo',
    'codigo',
    'material',
    'cantidad',
    'almacen',
    'usuario',
  ];

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.filtrosForm = this.fb.group({
      tipo_reporte_text: [''],
      fecha_desde_text: [''],
      fecha_hasta_text: [''],
      almacen: [''],
      clase: [''],
    });
  }

  ngOnInit(): void {
    this.cargarKPIs();
    this.cargarReporteInventario();
    this.cargarReporteMovimientos();

    // Escuchar cambios en filtros con debounce
    this.filtrosForm.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(() => {
        this.aplicarFiltros();
      });
  }

  ngAfterViewInit(): void {
    // Inicialización después de la vista
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== GESTIÓN DE FILTROS =====
  toggleFiltros(): void {
    this.filtrosExpanded = !this.filtrosExpanded;
  }

  limpiarFiltros(): void {
    this.filtrosForm.patchValue({
      tipo_reporte_text: '',
      fecha_desde_text: '',
      fecha_hasta_text: '',
      almacen: '',
      clase: '',
    });
    this.aplicarFiltros();
  }

  // ===== GESTIÓN DE DATOS =====
  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;

    // Filtrar reporte de inventario
    this.reporteInventarioFiltrado = this.reporteInventario.filter((item) => {
      const matchTipo =
        !filtros.tipo_reporte_text ||
        'inventario'
          .toLowerCase()
          .includes(filtros.tipo_reporte_text.toLowerCase());
      const matchFechaDesde = !filtros.fecha_desde_text || true; // Por simplicidad
      const matchFechaHasta = !filtros.fecha_hasta_text || true; // Por simplicidad
      const matchAlmacen =
        !filtros.almacen ||
        item.almacen.toLowerCase().includes(filtros.almacen.toLowerCase());
      const matchClase =
        !filtros.clase ||
        item.clase.toLowerCase().includes(filtros.clase.toLowerCase());

      return (
        matchTipo &&
        matchFechaDesde &&
        matchFechaHasta &&
        matchAlmacen &&
        matchClase
      );
    });

    // Filtrar reporte de movimientos
    this.reporteMovimientosFiltrado = this.reporteMovimientos.filter((item) => {
      const matchTipo =
        !filtros.tipo_reporte_text ||
        'movimientos'
          .toLowerCase()
          .includes(filtros.tipo_reporte_text.toLowerCase());
      const matchFechaDesde =
        !filtros.fecha_desde_text ||
        item.fecha.includes(filtros.fecha_desde_text);
      const matchFechaHasta =
        !filtros.fecha_hasta_text ||
        item.fecha.includes(filtros.fecha_hasta_text);
      const matchAlmacen =
        !filtros.almacen ||
        item.almacen.toLowerCase().includes(filtros.almacen.toLowerCase());
      const matchClase = !filtros.clase || true; // Los movimientos no tienen clase directa

      return (
        matchTipo &&
        matchFechaDesde &&
        matchFechaHasta &&
        matchAlmacen &&
        matchClase
      );
    });
  }

  cargarKPIs(): void {
    this.kpis = [
      {
        nombre: 'Valor Total Inventario',
        valor: 'S/ 485,240.50',
        descripcion: 'Valorización total del inventario',
        tendencia: 'up',
        porcentaje: 12.5,
      },
      {
        nombre: 'Rotación Promedio',
        valor: '4.2x',
        descripcion: 'Rotación promedio anual',
        tendencia: 'stable',
        porcentaje: 0.8,
      },
      {
        nombre: 'Días de Inventario',
        valor: '87 días',
        descripcion: 'Promedio días de inventario',
        tendencia: 'down',
        porcentaje: -5.2,
      },
      {
        nombre: 'Items Críticos',
        valor: '23',
        descripcion: 'Items con stock crítico',
        tendencia: 'up',
        porcentaje: 18.5,
      },
    ];
  }

  cargarReporteInventario(): void {
    this.reporteInventario = [
      {
        id_insumo: 1,
        codigo_fox: 'ALG001',
        nombre: 'Algodón Pima Blanco',
        almacen: 'Almacén Principal',
        clase: 'Fibras Naturales',
        stock_actual: 450.75,
        costo_unitario: 8.5,
        valor_total: 3831.38,
        rotacion: 6.2,
        dias_inventario: 59,
      },
      {
        id_insumo: 2,
        codigo_fox: 'POL002',
        nombre: 'Poliéster 150D Negro',
        almacen: 'Almacén Secundario',
        clase: 'Fibras Sintéticas',
        stock_actual: 325.2,
        costo_unitario: 12.75,
        valor_total: 4146.3,
        rotacion: 4.8,
        dias_inventario: 76,
      },
      {
        id_insumo: 3,
        codigo_fox: 'HIL003',
        nombre: 'Hilo de Algodón 30/1',
        almacen: 'Almacén Principal',
        clase: 'Hilos',
        stock_actual: 850.0,
        costo_unitario: 15.25,
        valor_total: 12962.5,
        rotacion: 8.1,
        dias_inventario: 45,
      },
      {
        id_insumo: 4,
        codigo_fox: 'TEL004',
        nombre: 'Tela Jersey Algodón',
        almacen: 'Almacén Principal',
        clase: 'Telas',
        stock_actual: 125.5,
        costo_unitario: 28.9,
        valor_total: 3626.95,
        rotacion: 3.2,
        dias_inventario: 114,
      },
      {
        id_insumo: 5,
        codigo_fox: 'ACC005',
        nombre: 'Botones Metálicos',
        almacen: 'Almacén de Tránsito',
        clase: 'Accesorios',
        stock_actual: 2500.0,
        costo_unitario: 0.85,
        valor_total: 2125.0,
        rotacion: 12.5,
        dias_inventario: 29,
      },
    ];
    this.reporteInventarioFiltrado = [...this.reporteInventario];
  }

  cargarReporteMovimientos(): void {
    this.reporteMovimientos = [
      {
        id_movimiento: 1,
        fecha: '2024-01-15',
        tipo_movimiento: 'INGRESO',
        codigo_fox: 'ALG001',
        material: 'Algodón Pima Blanco',
        cantidad: 250.0,
        almacen: 'Almacén Principal',
        usuario: 'Juan Pérez',
        observaciones: 'Compra directa',
      },
      {
        id_movimiento: 2,
        fecha: '2024-01-14',
        tipo_movimiento: 'EGRESO',
        codigo_fox: 'POL002',
        material: 'Poliéster 150D Negro',
        cantidad: -125.5,
        almacen: 'Almacén Secundario',
        usuario: 'María García',
        observaciones: 'Producción lote #1024',
      },
      {
        id_movimiento: 3,
        fecha: '2024-01-13',
        tipo_movimiento: 'AJUSTE',
        codigo_fox: 'HIL003',
        material: 'Hilo de Algodón 30/1',
        cantidad: 15.25,
        almacen: 'Almacén Principal',
        usuario: 'Carlos López',
        observaciones: 'Corrección inventario',
      },
      {
        id_movimiento: 4,
        fecha: '2024-01-12',
        tipo_movimiento: 'INGRESO',
        codigo_fox: 'TEL004',
        material: 'Tela Jersey Algodón',
        cantidad: 85.0,
        almacen: 'Almacén Principal',
        usuario: 'Ana Rodríguez',
        observaciones: 'Transferencia interna',
      },
    ];
    this.reporteMovimientosFiltrado = [...this.reporteMovimientos];
  }

  // ===== COMPUTED PROPERTIES =====
  get isEmpty(): boolean {
    const tipoFiltro =
      this.filtrosForm.value.tipo_reporte_text?.toLowerCase() || '';

    if (tipoFiltro.includes('movimiento')) {
      return this.reporteMovimientosFiltrado.length === 0;
    } else {
      // Por defecto muestra inventario
      return this.reporteInventarioFiltrado.length === 0;
    }
  }

  get currentReportType(): 'inventario' | 'movimientos' {
    const tipoFiltro =
      this.filtrosForm.value.tipo_reporte_text?.toLowerCase() || '';
    return tipoFiltro.includes('movimiento') ? 'movimientos' : 'inventario';
  }

  // ===== ORDENAMIENTO =====
  sortData(column: string): void {
    console.log('Ordenando por:', column);
    // Implementar lógica de ordenamiento
  }

  // ===== FUNCIONES DE EXPORTACIÓN =====
  exportarExcel(): void {
    this.snackBar.open('Exportando a Excel...', 'Cerrar', { duration: 3000 });
  }

  exportarPDF(): void {
    this.snackBar.open('Exportando a PDF...', 'Cerrar', { duration: 3000 });
  }

  programarReporte(): void {
    this.snackBar.open('Función de programación en desarrollo...', 'Cerrar', {
      duration: 3000,
    });
  }

  // ===== HELPERS DE CLASES CSS =====
  getCardClass(tendencia: string): string {
    switch (tendencia) {
      case 'up':
        return 'card-success';
      case 'down':
        return 'card-warning';
      default:
        return 'card-info';
    }
  }

  getTrendClass(tendencia: string): string {
    switch (tendencia) {
      case 'up':
        return 'trend-up';
      case 'down':
        return 'trend-down';
      default:
        return 'trend-stable';
    }
  }

  getRotacionClass(rotacion: number): string {
    if (rotacion >= 8) return 'badge-success';
    if (rotacion >= 4) return 'badge-warning';
    return 'badge-danger';
  }

  getTipoMovimientoClass(tipo: string): string {
    switch (tipo) {
      case 'INGRESO':
        return 'badge-success';
      case 'EGRESO':
        return 'badge-danger';
      case 'AJUSTE':
        return 'badge-warning';
      default:
        return 'badge-neutral';
    }
  }

  getCantidadClass(tipo: string): string {
    switch (tipo) {
      case 'INGRESO':
        return 'text-success';
      case 'EGRESO':
        return 'text-danger';
      default:
        return 'text-neutral';
    }
  }

  // ===== FORMATEO =====
  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(valor);
  }

  formatearNumero(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(valor);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE');
  }

  formatearCantidad(cantidad: number): string {
    const signo = cantidad >= 0 ? '+' : '';
    return `${signo}${this.formatearNumero(Math.abs(cantidad))}`;
  }

  // ===== ICONOS =====
  getIconoTendencia(tendencia: string): string {
    switch (tendencia) {
      case 'up':
        return 'trending_up';
      case 'down':
        return 'trending_down';
      default:
        return 'trending_flat';
    }
  }

  // ===== PAGINACIÓN =====
  getCurrentPageItems(): string {
    const total =
      this.currentReportType === 'inventario'
        ? this.reporteInventarioFiltrado.length
        : this.reporteMovimientosFiltrado.length;
    return `1-${total}`;
  }

  getTotalItems(): number {
    return this.currentReportType === 'inventario'
      ? this.reporteInventarioFiltrado.length
      : this.reporteMovimientosFiltrado.length;
  }

  isFirstPage(): boolean {
    return true; // Por ahora no hay paginación real
  }

  isLastPage(): boolean {
    return true; // Por ahora no hay paginación real
  }
}
