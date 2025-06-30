import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
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
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
  ResultadoCargaMasiva,
} from '../services/carga-masiva.service';
import { LotesService } from '../services/lotes.service';
import { Lote, Insumo } from '../models/insumo.model';
import { EditarLoteDialogComponent } from './editar-lote-dialog/editar-lote-dialog';
import { DetalleLoteDialogComponent } from './detalle-lote-dialog/detalle-lote-dialog';
import { CargaMasivaDialogComponent } from '../materiales/carga-masiva-dialog/carga-masiva-dialog.component';

@Component({
  selector: 'app-lotes',
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
    MatSortModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDatepickerModule,
  ],
  templateUrl: './lotes.html',
  styleUrls: ['./lotes.scss'],
})
export class LotesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;

  // ============================================================================
  // PROPIEDADES DE DATOS
  // ============================================================================
  lotes: Lote[] = [];
  dataSource = new MatTableDataSource<Lote>([]);
  insumos: Insumo[] = [];

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
  isLoadingInsumos = false;
  hasError = false;
  errorMessage = '';

  // ============================================================================
  // CONFIGURACIÓN DE TABLA
  // ============================================================================
  displayedColumns: string[] = [
    'lote',
    'id_insumo',
    'ubicacion',
    'stock_actual',
    'fecha_expiracion',
    'estado_lote',
    'acciones',
  ];

  get lotesFiltrados(): Lote[] {
    return this.dataSource.data;
  }

  get isEmpty(): boolean {
    return !this.isLoading && this.lotes.length === 0 && !this.hasError;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      this.dataSource.data.length === 0 &&
      this.lotes.length > 0
    );
  }

  constructor(
    private materialService: MaterialService,
    private lotesService: LotesService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {
    this.filtroGeneralForm = this.fb.group({
      busquedaGeneral: [''],
    });

    this.filtrosColumnaForm = this.fb.group({
      lote: [''],
      insumo: [''],
      ubicacion: [''],
      stockActual: [''],
      estadoLote: [''],
      fechaExpiracion: [''],
    });
  }

  ngOnInit(): void {
    this.cargarLotes();
    this.cargarInsumos();
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
  cargarLotes(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log('🔄 Iniciando carga de lotes - isLoading:', this.isLoading);

    this.materialService
      .getLotes()
      .pipe(
        delay(1500),
        finalize(() => {
          this.isLoading = false;
          console.log('✅ Carga completada - isLoading:', this.isLoading);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (lotes) => {
          console.log('📦 Lotes cargados:', lotes.length);
          this.lotes = lotes;
          this.dataSource.data = [...lotes];
        },
        error: (error) => {
          console.error('❌ Error al cargar lotes:', error);
          this.hasError = true;
          this.errorMessage =
            'Error al cargar los lotes. Por favor, intenta nuevamente.';
          this.lotes = [];
          this.dataSource.data = [];
        },
      });
  }

  cargarInsumos(): void {
    this.isLoadingInsumos = true;

    this.materialService
      .getMateriales()
      .pipe(
        delay(1000),
        finalize(() => {
          this.isLoadingInsumos = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (insumos) => {
          this.insumos = insumos;
        },
        error: (error) => {
          console.error('Error al cargar insumos:', error);
          this.insumos = [];
        },
      });
  }

  reintentarCarga(): void {
    this.cargarLotes();
    this.cargarInsumos();
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
      this.dataSource.data = [...this.lotes];
      return;
    }

    const lotesFiltrados = this.lotes.filter((lote) => {
      const codigo = lote.lote?.toLowerCase() || '';
      const insumoNombre = this.getInsumoNombre(lote.id_insumo).toLowerCase();
      const ubicacion = lote.ubicacion?.toLowerCase() || '';
      const estado = lote.estado_lote?.toLowerCase() || '';

      return (
        codigo.includes(busqueda) ||
        insumoNombre.includes(busqueda) ||
        ubicacion.includes(busqueda) ||
        estado.includes(busqueda)
      );
    });

    this.dataSource.data = lotesFiltrados;
  }

  aplicarFiltrosColumna(): void {
    const filtros = this.filtrosColumnaForm.value;
    let lotesFiltrados = [...this.lotes];

    // Filtro por Código de Lote
    if (filtros.lote && filtros.lote.trim()) {
      lotesFiltrados = lotesFiltrados.filter((lote) =>
        lote.lote?.toLowerCase().includes(filtros.lote.toLowerCase())
      );
    }

    // Filtro por Insumo
    if (filtros.insumo && filtros.insumo.trim()) {
      lotesFiltrados = lotesFiltrados.filter((lote) => {
        const insumoNombre = this.getInsumoNombre(lote.id_insumo);
        return insumoNombre
          .toLowerCase()
          .includes(filtros.insumo.toLowerCase());
      });
    }

    // Filtro por Ubicación
    if (filtros.ubicacion && filtros.ubicacion.trim()) {
      lotesFiltrados = lotesFiltrados.filter((lote) =>
        lote.ubicacion?.toLowerCase().includes(filtros.ubicacion.toLowerCase())
      );
    }

    // Filtro por Stock Actual
    if (filtros.stockActual && filtros.stockActual.toString().trim()) {
      const stockFiltro = parseFloat(filtros.stockActual);
      if (!isNaN(stockFiltro)) {
        lotesFiltrados = lotesFiltrados.filter((lote) => {
          const stock = lote.stock_actual || 0;
          return stock >= stockFiltro - 0.01 && stock <= stockFiltro + 0.01;
        });
      }
    }

    // Filtro por Estado del Lote
    if (filtros.estadoLote && filtros.estadoLote.trim()) {
      lotesFiltrados = lotesFiltrados.filter((lote) =>
        lote.estado_lote
          ?.toLowerCase()
          .includes(filtros.estadoLote.toLowerCase())
      );
    }

    // Filtro por Fecha de Expiración (búsqueda por año)
    if (filtros.fechaExpiracion && filtros.fechaExpiracion.toString().trim()) {
      const fechaFiltro = filtros.fechaExpiracion.toString();
      lotesFiltrados = lotesFiltrados.filter((lote) => {
        if (!lote.fecha_expiracion) return false;
        const fechaLote = new Date(lote.fecha_expiracion)
          .getFullYear()
          .toString();
        return fechaLote.includes(fechaFiltro);
      });
    }

    this.dataSource.data = lotesFiltrados;
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.reset();
    this.dataSource.data = [...this.lotes];
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
    this.dataSource.data = [...this.lotes];
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
  abrirNuevoLote(): void {
    const dialogRef = this.dialog.open(EditarLoteDialogComponent, {
      width: '700px',
      disableClose: true,
      data: { esNuevo: true, insumos: this.insumos },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarLotes();
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
        this.cargarLotes();
      }
    });
  }

  // ============================================================================
  // MÉTODOS UTILITARIOS
  // ============================================================================
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

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  isLoteAgotado(lote: Lote): boolean {
    return (
      lote.estado_lote?.toLowerCase() === 'agotado' ||
      (lote.stock_actual || 0) <= 0
    );
  }

  isStockBajo(lote: Lote): boolean {
    const stockActual = lote.stock_actual || 0;
    const stockInicial = lote.stock_inicial || 0;
    const porcentaje =
      stockInicial > 0 ? (stockActual / stockInicial) * 100 : 0;
    return porcentaje > 0 && porcentaje <= 20;
  }

  // ============================================================================
  // MÉTODOS OBLIGATORIOS REGLA DE ORO
  // ============================================================================

  agregar(): void {
    const dialogRef = this.dialog.open(EditarLoteDialogComponent, {
      width: '700px',
      disableClose: true,
      data: { esNuevo: true, insumos: this.insumos, titulo: 'Agregar Lote' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarLotes();
      }
    });
  }

  editar(lote: Lote): void {
    const dialogRef = this.dialog.open(EditarLoteDialogComponent, {
      width: '700px',
      disableClose: true,
      data: {
        lote,
        esNuevo: false,
        insumos: this.insumos,
        titulo: 'Editar Lote',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarLotes();
      }
    });
  }

  eliminar(lote: Lote): void {
    const confirmacion = confirm(
      `¿Está seguro que desea eliminar el lote ${lote.lote}?`
    );
    if (confirmacion && lote.id_lote) {
      this.lotesService.eliminarLote(lote.id_lote).subscribe(() => {
        this.cargarLotes();
      });
    }
  }

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

  cargaMasiva(): void {
    const dialogRef = this.dialog.open(CargaMasivaDialogComponent, {
      width: '600px',
      disableClose: true,
      data: {
        configuracion: this.configurarCargaMasiva(),
        onDescargarPlantilla: () => this.descargarPlantillaCargaMasiva(),
        onProcesarArchivo: (archivo: File) =>
          this.procesarArchivoCargaMasiva(archivo),
      },
    });
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  private configurarExportacion(): ConfiguracionExportacion<Lote> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'lotes',
      nombreEntidad: 'Lotes',
      columnas: [
        { campo: 'id_lote', titulo: 'ID', formato: 'numero' },
        { campo: 'lote', titulo: 'Código Lote', formato: 'texto' },
        { campo: 'id_insumo', titulo: 'ID Insumo', formato: 'numero' },
        { campo: 'ubicacion', titulo: 'Ubicación', formato: 'texto' },
        { campo: 'stock_inicial', titulo: 'Stock Inicial', formato: 'numero' },
        { campo: 'stock_actual', titulo: 'Stock Actual', formato: 'numero' },
        {
          campo: 'fecha_expiracion',
          titulo: 'Fecha Expiración',
          formato: 'fecha',
        },
        { campo: 'precio_total', titulo: 'Precio Total', formato: 'numero' },
        { campo: 'estado_lote', titulo: 'Estado', formato: 'texto' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.lotes.length,
        cantidadFiltrada: this.dataSource.data.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Lote> {
    return {
      tipoEntidad: 'lotes',
      mapeoColumnas: [
        {
          columnaArchivo: 'Código Lote',
          campoEntidad: 'lote',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'ID Insumo',
          campoEntidad: 'id_insumo',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Ubicación',
          campoEntidad: 'ubicacion',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Stock Inicial',
          campoEntidad: 'stock_inicial',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Stock Actual',
          campoEntidad: 'stock_actual',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Fecha Expiración',
          campoEntidad: 'fecha_expiracion',
          obligatorio: false,
          tipoEsperado: 'fecha',
        },
        {
          columnaArchivo: 'Precio Total',
          campoEntidad: 'precio_total',
          obligatorio: false,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Estado',
          campoEntidad: 'estado_lote',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'lote',
          validador: (valor) => valor && valor.length <= 100,
          mensajeError: 'El código del lote debe tener máximo 100 caracteres',
        },
        {
          campo: 'ubicacion',
          validador: (valor) => !valor || valor.length <= 200,
          mensajeError: 'La ubicación debe tener máximo 200 caracteres',
        },
        {
          campo: 'estado_lote',
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
      busquedaGeneral: filtroGeneral || '',
      ...filtrosColumna,
    };
  }

  private descargarPlantillaCargaMasiva(): void {
    this.cargaMasivaService.generarPlantilla(this.configurarCargaMasiva());
  }

  private procesarArchivoCargaMasiva(archivo: File): void {
    this.cargaMasivaService
      .procesarArchivo(archivo, this.configurarCargaMasiva())
      .then((resultado: ResultadoCargaMasiva<Lote>) => {
        console.log('Carga masiva completada:', resultado);
        this.cargarLotes();
      })
      .catch((error: any) => {
        console.error('Error en carga masiva:', error);
      });
  }
}

export { LotesComponent as Lotes };
