import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

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
  // Gestión de estado
  isLoading = false;
  hasError = false;
  errorMessage = '';
  filtrosExpanded = false;

  // Datos
  consumos: Consumo[] = [];
  insumos: Insumo[] = [];
  lotes: Lote[] = [];
  dataSource = new MatTableDataSource<Consumo>([]);
  displayedColumns: string[] = [
    'fecha',
    'insumo',
    'area',
    'cantidad',
    'lote',
    'estado',
    'acciones',
  ];

  // Filtros
  filtrosForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService
  ) {
    this.filtrosForm = this.fb.group({
      insumo: [''],
      area: [''],
      lote: [''],
      estado: [''],
    });
  }

  ngOnInit() {
    this.configurarFiltros();
    this.cargarDatos();
  }

  ngAfterViewInit() {
    // Configuración adicional después de la vista
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Computed properties
  get isEmpty(): boolean {
    return !this.isLoading && !this.hasError && this.consumos.length === 0;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      !this.hasError &&
      this.consumos.length > 0 &&
      this.dataSource.filteredData.length === 0
    );
  }

  // Configuración de filtros
  private configurarFiltros() {
    this.filtrosForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltros();
      });
  }

  // Cargar datos
  private async cargarDatos() {
    this.isLoading = true;
    this.hasError = false;

    try {
      // Cargar datos en paralelo
      const [consumosData, insumosData, lotesData] = await Promise.all([
        // TODO: Implementar getConsumos() en MaterialService
        of([]).toPromise(), // Placeholder para consumos
        this.materialService.getMateriales().toPromise(),
        this.materialService.getLotes().toPromise(),
      ]);

      this.consumos = consumosData || [];
      this.insumos = insumosData || [];
      this.lotes = lotesData || [];

      this.dataSource.data = this.consumos;
    } catch (error) {
      this.hasError = true;
      this.errorMessage = 'Error al cargar los datos de consumos';
      console.error('Error cargando consumos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Filtros
  toggleFiltros() {
    this.filtrosExpanded = !this.filtrosExpanded;
  }

  aplicarFiltros() {
    const filtros = this.filtrosForm.value;

    this.dataSource.filterPredicate = (consumo: Consumo) => {
      const insumoNombre =
        this.getInsumoNombre(consumo.id_insumo)?.toLowerCase() || '';
      const insumoCodigoFox =
        this.getInsumoCodigoFox(consumo.id_insumo)?.toLowerCase() || '';
      const area = (consumo.area || '').toLowerCase();
      const loteNombre =
        this.getLoteNombre(consumo.id_lote)?.toLowerCase() || '';
      const estado = (consumo.estado || '').toLowerCase();

      return (
        (!filtros.insumo ||
          insumoNombre.includes(filtros.insumo.toLowerCase()) ||
          insumoCodigoFox.includes(filtros.insumo.toLowerCase())) &&
        (!filtros.area || area.includes(filtros.area.toLowerCase())) &&
        (!filtros.lote || loteNombre.includes(filtros.lote.toLowerCase())) &&
        (!filtros.estado || estado.includes(filtros.estado.toLowerCase()))
      );
    };

    this.dataSource.filter = Date.now().toString(); // Trigger filter
  }

  limpiarFiltros() {
    this.filtrosForm.reset();
    this.dataSource.filter = '';
  }

  // Utilidades para obtener datos relacionados
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

  // Formateo de datos
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

  // Acciones de la tabla
  sortData(column: string) {
    // Implementar ordenamiento
    console.log('Ordenar por:', column);
  }

  verDetalle(consumo: Consumo) {
    console.log('Ver detalle de consumo:', consumo);
    // Implementar navegación o modal de detalle
  }

  editarConsumo(consumo: Consumo) {
    console.log('Editar consumo:', consumo);
    // Implementar navegación o modal de edición
  }

  // Acciones principales
  abrirRegistroConsumo() {
    console.log('Abrir registro de consumo');
    // Implementar navegación o modal de registro
  }

  abrirConsumoMasivo() {
    console.log('Abrir consumo masivo');
    // Implementar navegación o modal de carga masiva
  }

  reintentarCarga() {
    this.cargarDatos();
  }
}
