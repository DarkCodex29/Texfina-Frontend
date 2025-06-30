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
import {
  ExportacionService,
  ConfiguracionExportacion,
  ColumnaExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
  MapeoColumna,
} from '../services/carga-masiva.service';
import { Ingreso, Insumo, Unidad, Lote } from '../models/insumo.model';
import { IngresoMaterialDialogComponent } from './ingreso-material-dialog/ingreso-material-dialog.component';

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
  dropdownExportAbierto = false;
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
    private fb: FormBuilder,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
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
    const dialogRef = this.dialog.open(IngresoMaterialDialogComponent, {
      width: '800px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Actualizar la lista de ingresos después de crear uno nuevo
        this.cargarDatos();
        console.log('✅ Ingreso registrado exitosamente:', result);
      }
    });
  }

  abrirIngresoMasivo(): void {
    console.log('Abrir ingreso masivo');
    // TODO: Implementar modal de ingreso masivo
  }

  verDetalle(ingreso: Ingreso): void {
    console.log('Ver detalle de ingreso:', ingreso);
    // TODO: Implementar modal de detalle
  }

  editar(ingreso: Ingreso): void {
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
    if (!precio || precio === 0) return 'S/ 0.00';
    return `S/ ${precio.toFixed(2)}`;
  }

  // ============================================================================
  // CONFIGURACIONES ESPECÍFICAS SEGÚN BD REAL
  // ============================================================================

  private configurarExportacion(): ConfiguracionExportacion<Ingreso> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'ingresos',
      nombreEntidad: 'Ingresos',
      columnas: [
        { campo: 'id_ingreso', titulo: 'ID', formato: 'numero' },
        { campo: 'fecha', titulo: 'Fecha', formato: 'fecha' },
        { campo: 'id_insumo', titulo: 'ID Insumo', formato: 'numero' },
        { campo: 'presentacion', titulo: 'Presentación', formato: 'texto' },
        { campo: 'id_unidad', titulo: 'Unidad', formato: 'texto' },
        { campo: 'cantidad', titulo: 'Cantidad', formato: 'numero' },
        { campo: 'id_lote', titulo: 'ID Lote', formato: 'numero' },
        {
          campo: 'precio_total_formula',
          titulo: 'Precio Total',
          formato: 'numero',
        },
        { campo: 'numero_remision', titulo: 'N° Remisión', formato: 'texto' },
        { campo: 'orden_compra', titulo: 'Orden Compra', formato: 'texto' },
        { campo: 'estado', titulo: 'Estado', formato: 'texto' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.ingresos.length,
        cantidadFiltrada: this.dataSource.data.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Ingreso> {
    return {
      tipoEntidad: 'ingresos',
      mapeoColumnas: [
        {
          columnaArchivo: 'Fecha',
          campoEntidad: 'fecha',
          obligatorio: true,
          tipoEsperado: 'fecha',
        },
        {
          columnaArchivo: 'ID Insumo',
          campoEntidad: 'id_insumo',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Presentación',
          campoEntidad: 'presentacion',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Cantidad',
          campoEntidad: 'cantidad',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'N° Remisión',
          campoEntidad: 'numero_remision',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Estado',
          campoEntidad: 'estado',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'presentacion',
          validador: (valor) => !valor || valor.length <= 100,
          mensajeError: 'La presentación debe tener máximo 100 caracteres',
        },
        {
          campo: 'numero_remision',
          validador: (valor) => !valor || valor.length <= 50,
          mensajeError: 'El número de remisión debe tener máximo 50 caracteres',
        },
        {
          campo: 'estado',
          validador: (valor) => !valor || valor.length <= 50,
          mensajeError: 'El estado debe tener máximo 50 caracteres',
        },
      ],
    };
  }

  private obtenerFiltrosActivos(): any {
    const filtroGeneral = this.filtroGeneralForm.get('busquedaGeneral')?.value;
    const filtrosColumna = this.filtrosColumnaForm.value;

    return {
      filtroGeneral: filtroGeneral || '',
      filtrosColumna: Object.entries(filtrosColumna)
        .filter(([_, valor]) => valor && valor.toString().trim())
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}),
    };
  }

  // ============================================================================
  // EXPORTACIÓN
  // ============================================================================

  exportarExcel(): void {
    try {
      const config = this.configurarExportacion();
      this.exportacionService.exportarExcel(config);
      this.dropdownExportAbierto = false;
    } catch (error) {
      console.error('Error al exportar Excel:', error);
    }
  }

  exportarPDF(): void {
    try {
      const config = this.configurarExportacion();
      this.exportacionService.exportarPDF(config);
      this.dropdownExportAbierto = false;
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    }
  }

  // ============================================================================
  // CARGA MASIVA
  // ============================================================================

  cargaMasiva(): void {
    // const dialogRef = this.dialog.open(CargaMasivaDialogComponent, {
    //   width: '600px', disableClose: true,
    //   data: {
    //     configuracion: this.configurarCargaMasiva(),
    //     onDescargarPlantilla: () => this.descargarPlantillaCargaMasiva(),
    //     onProcesarArchivo: (archivo: File) => this.procesarArchivoCargaMasiva(archivo)
    //   }
    // });
    console.log('Carga masiva - Funcionalidad en desarrollo');
  }

  // ============================================================================
  // CRUD COMPLETO
  // ============================================================================

  agregar(): void {
    this.abrirRegistroIngreso();
  }

  eliminar(ingreso: Ingreso): void {
    const confirmacion = confirm(
      `¿Está seguro que desea eliminar el ingreso del ${this.formatearFecha(
        ingreso.fecha
      )}?`
    );
    if (confirmacion && ingreso.id_ingreso) {
      console.log('Eliminar ingreso - Funcionalidad en desarrollo');
    }
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }
}

export { IngresosComponent as Ingresos };
