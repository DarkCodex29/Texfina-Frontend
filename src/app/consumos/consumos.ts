import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  Subject,
  of,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  finalize,
  delay,
} from 'rxjs';

import { Consumo, Insumo, Lote } from '../models/insumo.model';
import { MaterialService } from '../services/material.service';

@Component({
  selector: 'app-consumos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './consumos.html',
  styleUrls: ['./consumos.scss'],
})
export class ConsumosComponent implements OnInit, AfterViewInit, OnDestroy {
  // ============================================================================
  // PROPIEDADES DE DATOS
  // ============================================================================
  consumos: Consumo[] = [];
  insumos: Insumo[] = [];
  lotes: Lote[] = [];
  dataSource = new MatTableDataSource<Consumo>([]);

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
    'area',
    'cantidad',
    'lote',
    'estado',
    'acciones',
  ];

  get isEmpty(): boolean {
    return !this.isLoading && !this.hasError && this.consumos.length === 0;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      this.dataSource.data.length === 0 &&
      this.consumos.length > 0
    );
  }

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService
  ) {
    this.filtroGeneralForm = this.fb.group({
      busquedaGeneral: [''],
    });

    this.filtrosColumnaForm = this.fb.group({
      fecha: [''],
      insumo: [''],
      area: [''],
      cantidad: [''],
      lote: [''],
      estado: [''],
    });
  }

  ngOnInit() {
    this.cargarDatos();
    this.configurarFiltroGeneralEnTiempoReal();
    this.configurarFiltrosColumnaEnTiempoReal();
  }

  ngAfterViewInit() {
    // Configuración adicional después de la vista
  }

  ngOnDestroy() {
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
  private cargarDatos() {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log('🔄 Iniciando carga de consumos - isLoading:', this.isLoading);

    Promise.all([
      of([]).toPromise(), // TODO: Implementar getConsumos() en MaterialService
      this.materialService.getMateriales().toPromise(),
      this.materialService.getLotes().toPromise(),
    ])
      .then(([consumosData, insumosData, lotesData]) => {
        // Delay artificial para demostrar el skeleton
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve([consumosData, insumosData, lotesData]);
          }, 1500);
        });
      })
      .then(([consumosData, insumosData, lotesData]: any) => {
        console.log('📋 Consumos cargados:', (consumosData || []).length);
        this.consumos = consumosData || [];
        this.insumos = insumosData || [];
        this.lotes = lotesData || [];
        this.dataSource.data = [...this.consumos];
      })
      .catch((error) => {
        console.error('❌ Error al cargar consumos:', error);
        this.hasError = true;
        this.errorMessage = 'Error al cargar los datos de consumos';
        this.consumos = [];
        this.insumos = [];
        this.lotes = [];
        this.dataSource.data = [];
      })
      .finally(() => {
        this.isLoading = false;
        console.log('✅ Carga completada - isLoading:', this.isLoading);
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
      this.dataSource.data = [...this.consumos];
      return;
    }

    const consumosFiltrados = this.consumos.filter((consumo) => {
      const fecha = this.formatearFecha(consumo.fecha).toLowerCase();
      const insumoNombre = this.getInsumoNombre(consumo.id_insumo).toLowerCase();
      const insumoCodigoFox = this.getInsumoCodigoFox(consumo.id_insumo).toLowerCase();
      const area = (consumo.area || '').toLowerCase();
      const cantidad = this.formatearCantidad(consumo.cantidad);
      const loteNombre = this.getLoteNombre(consumo.id_lote).toLowerCase();
      const estado = this.getEstadoConsumo(consumo).toLowerCase();

      return (
        fecha.includes(busqueda) ||
        insumoNombre.includes(busqueda) ||
        insumoCodigoFox.includes(busqueda) ||
        area.includes(busqueda) ||
        cantidad.includes(busqueda) ||
        loteNombre.includes(busqueda) ||
        estado.includes(busqueda)
      );
    });

    this.dataSource.data = consumosFiltrados;
  }

  aplicarFiltrosColumna(): void {
    const filtros = this.filtrosColumnaForm.value;
    let consumosFiltrados = [...this.consumos];

    // Filtro por Fecha
    if (filtros.fecha && filtros.fecha.toString().trim()) {
      const fechaFiltro = filtros.fecha.toString();
      consumosFiltrados = consumosFiltrados.filter((consumo) => {
        const fechaConsumo = this.formatearFecha(consumo.fecha);
        return fechaConsumo.includes(fechaFiltro);
      });
    }

    // Filtro por Insumo
    if (filtros.insumo && filtros.insumo.trim()) {
      consumosFiltrados = consumosFiltrados.filter((consumo) => {
        const insumoNombre = this.getInsumoNombre(consumo.id_insumo).toLowerCase();
        const insumoCodigoFox = this.getInsumoCodigoFox(consumo.id_insumo).toLowerCase();
        return (
          insumoNombre.includes(filtros.insumo.toLowerCase()) ||
          insumoCodigoFox.includes(filtros.insumo.toLowerCase())
        );
      });
    }

    // Filtro por Área
    if (filtros.area && filtros.area.trim()) {
      consumosFiltrados = consumosFiltrados.filter((consumo) =>
        (consumo.area || '').toLowerCase().includes(filtros.area.toLowerCase())
      );
    }

    // Filtro por Cantidad
    if (filtros.cantidad && filtros.cantidad.toString().trim()) {
      const cantidadFiltro = parseFloat(filtros.cantidad);
      if (!isNaN(cantidadFiltro)) {
        consumosFiltrados = consumosFiltrados.filter((consumo) => {
          const cantidad = consumo.cantidad || 0;
          return (
            cantidad >= cantidadFiltro - 0.01 &&
            cantidad <= cantidadFiltro + 0.01
          );
        });
      }
    }

    // Filtro por Lote
    if (filtros.lote && filtros.lote.trim()) {
      consumosFiltrados = consumosFiltrados.filter((consumo) =>
        this.getLoteNombre(consumo.id_lote)
          .toLowerCase()
          .includes(filtros.lote.toLowerCase())
      );
    }

    // Filtro por Estado
    if (filtros.estado && filtros.estado.trim()) {
      consumosFiltrados = consumosFiltrados.filter((consumo) =>
        this.getEstadoConsumo(consumo)
          .toLowerCase()
          .includes(filtros.estado.toLowerCase())
      );
    }

    this.dataSource.data = consumosFiltrados;
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.reset();
    this.dataSource.data = [...this.consumos];
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
    this.dataSource.data = [...this.consumos];
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

  // ============================================================================
  // MÉTODOS DE TABLA
  // ============================================================================
  sortData(column: string) {
    console.log('Ordenar por:', column);
    // TODO: Implementar ordenamiento
  }

  // ============================================================================
  // MÉTODOS DE ACCIONES
  // ============================================================================
  verDetalle(consumo: Consumo) {
    console.log('👁️ Ver detalle de consumo:', consumo);
    // TODO: Implementar modal de detalle
  }

  editarConsumo(consumo: Consumo) {
    console.log('✏️ Editar consumo:', consumo);
    // TODO: Implementar modal de edición
  }

  abrirRegistroConsumo() {
    console.log('➕ Abrir registro de consumo');
    // TODO: Implementar modal de registro
  }

  abrirConsumoMasivo() {
    console.log('📤 Abrir consumo masivo');
    // TODO: Implementar modal de carga masiva
  }

  // ============================================================================
  // MÉTODOS UTILITARIOS
  // ============================================================================
  getInsumoNombre(idInsumo?: number): string {
    if (!idInsumo) return 'Sin insumo';
    const insumo = this.insumos.find((i) => i.id_insumo === idInsumo);
    return insumo?.nombre || 'Insumo no encontrado';
  }

  getInsumoCodigoFox(idInsumo?: number): string {
    if (!idInsumo) return '';
    const insumo = this.insumos.find((i) => i.id_insumo === idInsumo);
    return insumo?.id_fox || '';
  }

  getUnidadPorInsumo(idInsumo?: number): string {
    if (!idInsumo) return '';
    const insumo = this.insumos.find((i) => i.id_insumo === idInsumo);
    return insumo?.unidad?.nombre || '';
  }

  getLoteNombre(idLote?: number): string {
    if (!idLote) return 'Sin lote';
    const lote = this.lotes.find((l) => l.id_lote === idLote);
    return lote?.lote || 'Lote no encontrado';
  }

  getEstadoConsumo(consumo: Consumo): string {
    return consumo.estado || 'PENDIENTE';
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatearCantidad(cantidad?: number): string {
    if (cantidad === null || cantidad === undefined) return '0';
    return cantidad.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
