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
import { MatDialog } from '@angular/material/dialog';
import {
  Subject,
  of,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  finalize,
  delay,
} from 'rxjs';

import { Consumo } from '../models/consumo.model';
import { Insumo, Lote } from '../models/insumo.model';
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
import { CargaMasivaDialogComponent } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';
import {
  FormularioDialogComponent,
  ConfiguracionFormulario,
} from '../shared/dialogs/formulario-dialog/formulario-dialog.component';
import {
  DetalleDialogComponent,
  ConfiguracionDetalle,
} from '../shared/dialogs/detalle-dialog/detalle-dialog.component';
import { ConfirmacionDialogComponent } from '../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component';
import {
  ConsumosConfig,
  CONSUMOS_CONFIG,
} from '../shared/configs/consumos-config';

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
    private materialService: MaterialService,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
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

    console.log('�� Iniciando carga de consumos - isLoading:', this.isLoading);

    Promise.all([
      this.materialService.getConsumos().toPromise(),
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
      const insumoNombre = this.getInsumoNombre(
        consumo.id_insumo
      ).toLowerCase();
      const insumoCodigoFox = this.getInsumoCodigoFox(
        consumo.id_insumo
      ).toLowerCase();
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
        const insumoNombre = this.getInsumoNombre(
          consumo.id_insumo
        ).toLowerCase();
        const insumoCodigoFox = this.getInsumoCodigoFox(
          consumo.id_insumo
        ).toLowerCase();
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
  verDetalle(consumo: Consumo): void {
    const configuracion: ConfiguracionDetalle = {
      entidad: 'Consumo',
      entidadArticulo: 'el consumo',
      datos: consumo,
      filas: [
        [
          {
            key: 'id_consumo',
            label: 'Código',
            tipo: 'text',
            formateo: (valor) => ConsumosConfig.formatearCodigo(valor),
            ancho: 'normal',
          },
          {
            key: 'fecha',
            label: 'Fecha',
            tipo: 'text',
            formateo: (valor) => ConsumosConfig.formatearFecha(valor),
            ancho: 'normal',
          },
        ],
        [
          {
            key: 'id_insumo',
            label: 'Insumo',
            tipo: 'text',
            formateo: (valor) =>
              ConsumosConfig.formatearTexto(this.getInsumoNombre(valor)),
            ancho: 'completo',
          },
        ],
        [
          {
            key: 'area',
            label: 'Área',
            tipo: 'text',
            formateo: (valor) => ConsumosConfig.formatearTexto(valor),
            ancho: 'normal',
          },
          {
            key: 'cantidad',
            label: 'Cantidad',
            tipo: 'number',
            formateo: (valor) => ConsumosConfig.formatearCantidad(valor),
            ancho: 'normal',
          },
        ],
        [
          {
            key: 'id_lote',
            label: 'Lote',
            tipo: 'text',
            formateo: (valor) =>
              ConsumosConfig.formatearTexto(this.getLoteNombre(valor)),
            ancho: 'normal',
          },
          {
            key: 'estado',
            label: 'Estado',
            tipo: 'text',
            formateo: (valor) => ConsumosConfig.formatearEstado(valor).texto,
            ancho: 'normal',
          },
        ],
      ],
    };

    this.dialog.open(DetalleDialogComponent, {
      width: '800px',
      disableClose: true,
      data: configuracion,
    });
  }

  editar(consumo: Consumo): void {
    const configuracion: ConfiguracionFormulario = {
      titulo: {
        agregar: 'Agregar Consumo',
        editar: 'Editar Consumo',
      },
      entidad: 'Consumo',
      entidadArticulo: 'el consumo',
      esEdicion: true,
      datosIniciales: consumo,
      filas: [
        [
          {
            key: 'id_insumo',
            label: 'Insumo',
            tipo: 'select',
            opciones: this.insumos.map((i) => ({
              value: i.id_insumo!,
              label: i.nombre,
            })),
            obligatorio: true,
            ancho: 'completo',
          },
        ],
        [
          {
            key: 'fecha',
            label: 'Fecha',
            tipo: 'text',
            placeholder: 'dd/mm/aaaa',
            obligatorio: true,
            ancho: 'normal',
          },
          {
            key: 'area',
            label: 'Área',
            tipo: 'text',
            placeholder: 'Área de consumo',
            obligatorio: true,
            maxLength: 100,
            ancho: 'normal',
          },
        ],
        [
          {
            key: 'cantidad',
            label: 'Cantidad',
            tipo: 'number',
            placeholder: 'Cantidad consumida',
            obligatorio: true,
            min: 0.01,
            ancho: 'normal',
          },
          {
            key: 'id_lote',
            label: 'Lote',
            tipo: 'select',
            opciones: this.lotes.map((l) => ({
              value: l.id_lote!,
              label: l.lote || '',
            })),
            ancho: 'normal',
          },
        ],
        [
          {
            key: 'estado',
            label: 'Estado',
            tipo: 'select',
            opciones: Object.entries(CONSUMOS_CONFIG.ESTADOS).map(
              ([key, value]: [string, any]) => ({
                value: key,
                label: value.texto,
              })
            ),
            obligatorio: true,
            ancho: 'completo',
          },
        ],
      ],
    };

    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '800px',
      disableClose: true,
      data: configuracion,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado && resultado.datos) {
        this.materialService.actualizarConsumo(resultado.datos).subscribe({
          next: () => {
            this.cargarDatos();
          },
          error: (error: any) => {
            console.error('Error al editar consumo:', error);
          },
        });
      }
    });
  }

  eliminar(consumo: Consumo): void {
    const configuracion = ConsumosConfig.eliminarConsumo(consumo);

    const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
      width: '500px',
      disableClose: true,
      data: configuracion,
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado && consumo.id_consumo) {
        this.materialService.eliminarConsumo(consumo.id_consumo).subscribe({
          next: () => {
            this.cargarDatos();
          },
          error: (error: any) => {
            console.error('Error al eliminar consumo:', error);
          },
        });
      }
    });
  }

  editarConsumo(consumo: Consumo): void {
    this.editar(consumo);
  }

  agregar(): void {
    const configuracion: ConfiguracionFormulario = {
      titulo: {
        agregar: 'Agregar Consumo',
        editar: 'Editar Consumo',
      },
      entidad: 'Consumo',
      entidadArticulo: 'el consumo',
      esEdicion: false,
      filas: [
        [
          {
            key: 'id_insumo',
            label: 'Insumo',
            tipo: 'select',
            opciones: this.insumos.map((i) => ({
              value: i.id_insumo!,
              label: i.nombre,
            })),
            obligatorio: true,
            ancho: 'completo',
          },
        ],
        [
          {
            key: 'fecha',
            label: 'Fecha',
            tipo: 'text',
            placeholder: 'dd/mm/aaaa',
            obligatorio: true,
            ancho: 'normal',
          },
          {
            key: 'area',
            label: 'Área',
            tipo: 'text',
            placeholder: 'Área de consumo',
            obligatorio: true,
            maxLength: 100,
            ancho: 'normal',
          },
        ],
        [
          {
            key: 'cantidad',
            label: 'Cantidad',
            tipo: 'number',
            placeholder: 'Cantidad consumida',
            obligatorio: true,
            min: 0.01,
            ancho: 'normal',
          },
          {
            key: 'id_lote',
            label: 'Lote',
            tipo: 'select',
            opciones: this.lotes.map((l) => ({
              value: l.id_lote!,
              label: l.lote || '',
            })),
            ancho: 'normal',
          },
        ],
        [
          {
            key: 'estado',
            label: 'Estado',
            tipo: 'select',
            opciones: Object.entries(CONSUMOS_CONFIG.ESTADOS).map(
              ([key, value]: [string, any]) => ({
                value: key,
                label: value.texto,
              })
            ),
            obligatorio: true,
            ancho: 'completo',
          },
        ],
      ],
    };

    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '800px',
      disableClose: true,
      data: configuracion,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado && resultado.datos) {
        this.materialService.crearConsumo(resultado.datos).subscribe({
          next: () => {
            this.cargarDatos();
          },
          error: (error: any) => {
            console.error('Error al crear consumo:', error);
          },
        });
      }
    });
  }

  abrirRegistroConsumo(): void {
    this.agregar();
  }

  abrirConsumoMasivo() {
    this.cargaMasiva();
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
    if (!cantidad) return '-';
    return `${cantidad.toFixed(2)}`;
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

  private configurarExportacion(): ConfiguracionExportacion<Consumo> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'consumos',
      nombreEntidad: 'Consumos',
      columnas: [
        { campo: 'id_consumo', titulo: 'ID', formato: 'numero' },
        { campo: 'fecha', titulo: 'Fecha', formato: 'fecha' },
        { campo: 'id_insumo', titulo: 'Insumo', formato: 'texto' },
        { campo: 'area', titulo: 'Área', formato: 'texto' },
        { campo: 'cantidad', titulo: 'Cantidad', formato: 'numero' },
        { campo: 'id_lote', titulo: 'Lote', formato: 'texto' },
        { campo: 'estado', titulo: 'Estado', formato: 'texto' },
        { campo: 'created_at', titulo: 'Fecha Creación', formato: 'fecha' },
        {
          campo: 'updated_at',
          titulo: 'Última Actualización',
          formato: 'fecha',
        },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.consumos.length,
        cantidadFiltrada: this.dataSource.data.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Consumo> {
    return {
      tipoEntidad: 'consumos',
      mapeoColumnas: [
        {
          columnaArchivo: 'Fecha',
          campoEntidad: 'fecha',
          obligatorio: true,
          tipoEsperado: 'fecha',
        },
        {
          columnaArchivo: 'Insumo',
          campoEntidad: 'id_insumo',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Área',
          campoEntidad: 'area',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Cantidad',
          campoEntidad: 'cantidad',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Lote',
          campoEntidad: 'id_lote',
          obligatorio: false,
          tipoEsperado: 'numero',
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
          campo: 'area',
          validador: (valor) => valor && valor.length <= 100,
          mensajeError: 'El área debe tener máximo 100 caracteres',
        },
        {
          campo: 'cantidad',
          validador: (valor) => valor && valor > 0,
          mensajeError: 'La cantidad debe ser mayor a 0',
        },
      ],
    };
  }

  private obtenerFiltrosActivos(): any {
    const filtros: any = {};
    const filtroGeneral = this.filtroGeneralForm.get('busquedaGeneral')?.value;
    if (filtroGeneral) {
      filtros.busquedaGeneral = filtroGeneral;
    }

    const filtrosColumna = this.filtrosColumnaForm.value;
    Object.keys(filtrosColumna).forEach((key) => {
      if (filtrosColumna[key]) {
        filtros[key] = filtrosColumna[key];
      }
    });

    return filtros;
  }

  private descargarPlantillaCargaMasiva(): void {
    this.cargaMasivaService.generarPlantilla(this.configurarCargaMasiva());
  }

  private async procesarArchivoCargaMasiva(archivo: File): Promise<void> {
    try {
      const resultado = await this.cargaMasivaService.procesarArchivo(
        archivo,
        this.configurarCargaMasiva()
      );
      console.log('Carga masiva completada:', resultado);
      this.cargarDatos();
    } catch (error) {
      console.error('Error en carga masiva:', error);
    }
  }
}
