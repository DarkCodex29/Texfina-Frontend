import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, finalize } from 'rxjs';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
} from '../services/carga-masiva.service';
import { CargaMasivaDialogComponent } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';
import { PrimeDataTableComponent } from '../shared/components/prime-data-table/prime-data-table.component';
import {
  TableColumn,
  TableAction,
  TableButtonConfig,
  TableState,
} from '../shared/components/prime-data-table/prime-data-table.component';

export interface Reporte {
  id_reporte: number;
  tipo_reporte: string;
  fecha_generacion: string;
  usuario: string;
  parametros: string;
  estado: 'GENERANDO' | 'COMPLETADO' | 'ERROR';
  tamano_archivo: number;
  ruta_archivo?: string;
  tipo_lote?: 'MUESTRA' | 'PRODUCCION';
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
    MatDialogModule,
    MatTooltipModule,
    PrimeDataTableComponent,
  ],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.scss'],
})
export class ReportesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  dropdownExportAbierto = false;
  reportes: Reporte[] = [];
  reportesOriginal: Reporte[] = [];
  kpis: KPI[] = [];
  tipoLoteFiltro: string = '';

  tableState: TableState = {
    loading: false,
    error: false,
    empty: false,
    filteredEmpty: false
  };

  columns: TableColumn[] = [
    {
      key: 'tipo_reporte',
      title: 'Tipo',
      sortable: true,
      filterable: true,
      width: '180px',
      type: 'badge'
    },
    {
      key: 'fecha_generacion',
      title: 'Fecha',
      sortable: true,
      filterable: true,
      width: '160px',
      type: 'date'
    },
    {
      key: 'usuario',
      title: 'Usuario',
      sortable: true,
      filterable: true,
      width: '140px',
      type: 'user'
    },
    {
      key: 'parametros',
      title: 'Parámetros',
      sortable: false,
      filterable: true,
      width: '200px',
      type: 'description'
    },
    {
      key: 'estado',
      title: 'Estado',
      sortable: true,
      filterable: true,
      width: '120px',
      type: 'badge'
    },
    {
      key: 'tamano_archivo',
      title: 'Tamaño',
      sortable: true,
      filterable: false,
      width: '100px'
    }
  ];

  actions: TableAction[] = [
    {
      action: 'download',
      tooltip: 'Descargar',
      icon: 'download',
      color: 'primary',
      condition: (item: any) => item.estado === 'COMPLETADO'
    },
    {
      action: 'view',
      tooltip: 'Ver Detalle',
      icon: 'visibility',
      color: 'secondary'
    },
    {
      action: 'delete',
      tooltip: 'Eliminar',
      icon: 'delete',
      color: 'danger'
    }
  ];

  buttons: TableButtonConfig[] = [
    {
      action: 'generate',
      label: 'Generar Reporte',
      icon: 'add',
      color: 'primary'
    },
    {
      action: 'bulk',
      label: 'Carga Masiva',
      icon: 'upload_file',
      color: 'secondary'
    }
  ];

  globalFilterFields: string[] = ['tipo_reporte', 'usuario', 'parametros', 'estado'];

  constructor(
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarKPIs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onActionClick(event: { action: string; item: any }): void {
    const { action, item } = event;
    switch (action) {
      case 'download':
        this.descargarReporte(item);
        break;
      case 'view':
        this.verDetalle(item);
        break;
      case 'delete':
        this.eliminar(item);
        break;
    }
  }

  onButtonClick(action: string): void {
    switch (action) {
      case 'generate':
        this.agregar();
        break;
      case 'bulk':
        this.cargaMasiva();
        break;
    }
  }

  private updateTableStates(): void {
    this.tableState.empty = this.reportes.length === 0;
  }

  private async cargarDatos() {
    this.tableState.loading = true;
    this.tableState.error = false;
    this.tableState.errorMessage = '';

    try {
      this.cargarDatosMock();
    } catch (error) {
      this.tableState.error = true;
      this.tableState.errorMessage = 'Error al cargar los datos de reportes';
      console.error('Error cargando reportes:', error);
      this.reportes = [];
    } finally {
      this.tableState.loading = false;
      this.updateTableStates();
      console.log('🏁 Estado final - loading:', this.tableState.loading, 'reportes:', this.reportes.length);
    }
  }

  recargarDatos(): void {
    this.cargarDatos();
  }

  private cargarDatosMock() {
    console.log('🔄 Cargando datos mock de reportes...');
    this.reportesOriginal = [
      {
        id_reporte: 1,
        tipo_reporte: 'Inventario General',
        fecha_generacion: '2024-01-15T10:30:00',
        usuario: 'Admin User',
        parametros: 'QCA, Lote, Clase, Familia, Sub Familia, Proveedor, Stock, Almacén',
        estado: 'COMPLETADO',
        tamano_archivo: 2048576,
        ruta_archivo: '/reportes/inventario_general_20240115.xlsx',
        tipo_lote: 'PRODUCCION',
      },
      {
        id_reporte: 2,
        tipo_reporte: 'Valorización de Inventario',
        fecha_generacion: '2024-01-14T15:45:00',
        usuario: 'Supervisor',
        parametros: 'QCA, Lote, Stock, Precio, Total valorizado, Fecha vencimiento',
        estado: 'COMPLETADO',
        tamano_archivo: 1534000,
        ruta_archivo: '/reportes/valorizacion_inventario_20240114.xlsx',
        tipo_lote: 'PRODUCCION',
      },
      {
        id_reporte: 3,
        tipo_reporte: 'Kardex de QCA',
        fecha_generacion: '2024-01-13T09:15:00',
        usuario: 'Operador 1',
        parametros: 'Fecha, Área, Tipo movimiento, Cantidad, Lote, N° vale, Operador',
        estado: 'COMPLETADO',
        tamano_archivo: 1875000,
        ruta_archivo: '/reportes/kardex_qca_20240113.xlsx',
        tipo_lote: 'MUESTRA',
      },
      {
        id_reporte: 4,
        tipo_reporte: 'Stock Crítico',
        fecha_generacion: '2024-01-12T14:20:00',
        usuario: 'Supervisor',
        parametros: 'QCA, Lote, Stock actual, Consumo promedio, Fecha vencimiento',
        estado: 'COMPLETADO',
        tamano_archivo: 987654,
        ruta_archivo: '/reportes/stock_critico_20240112.xlsx',
        tipo_lote: 'PRODUCCION',
      },
      {
        id_reporte: 5,
        tipo_reporte: 'Consumo de QCA',
        fecha_generacion: '2024-01-11T11:30:00',
        usuario: 'Operador 2',
        parametros: 'N° vale, Fecha, Colorantes, Cantidad pesada, Lote, Área, Responsable',
        estado: 'COMPLETADO',
        tamano_archivo: 1345678,
        ruta_archivo: '/reportes/consumo_qca_20240111.xlsx',
        tipo_lote: 'MUESTRA',
      },
      {
        id_reporte: 6,
        tipo_reporte: 'Comparación Requerida vs Pesado',
        fecha_generacion: '2024-01-10T16:45:00',
        usuario: 'Analista',
        parametros: 'Diferencias receta vs real, Desviaciones por lote y operador',
        estado: 'GENERANDO',
        tamano_archivo: 0,
      },
      {
        id_reporte: 7,
        tipo_reporte: 'Movimientos por Almacén',
        fecha_generacion: '2024-01-09T08:15:00',
        usuario: 'Admin User',
        parametros: 'Entradas/Salidas Principal, Corpac, Tránsito - Transferencias',
        estado: 'COMPLETADO',
        tamano_archivo: 2134567,
        ruta_archivo: '/reportes/movimientos_almacen_20240109.xlsx',
      },
      {
        id_reporte: 8,
        tipo_reporte: 'Trazabilidad Inversa',
        fecha_generacion: '2024-01-08T13:20:00',
        usuario: 'Supervisor',
        parametros: 'Lote colorante → todas las rutas de utilización',
        estado: 'ERROR',
        tamano_archivo: 0,
      }
    ];
    this.reportes = [...this.reportesOriginal];
    console.log('✅ Datos mock cargados:', this.reportes.length, 'reportes');
    console.log('📊 Datos de reportes:', this.reportes);
  }
  
  filtrarPorTipoLote(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.tipoLoteFiltro = selectElement.value;
    
    if (this.tipoLoteFiltro) {
      this.reportes = this.reportesOriginal.filter(
        reporte => reporte.tipo_lote === this.tipoLoteFiltro
      );
    } else {
      this.reportes = [...this.reportesOriginal];
    }
    
    this.updateTableStates();
  }

  cargarKPIs(): void {
    this.kpis = [
      {
        nombre: 'Reportes Generados',
        valor: '245',
        descripcion: 'Total este mes',
        tendencia: 'up',
        porcentaje: 12,
      },
      {
        nombre: 'Tiempo Promedio',
        valor: '3.2 min',
        descripcion: 'Generación promedio',
        tendencia: 'down',
        porcentaje: 8,
      },
      {
        nombre: 'Reportes Exitosos',
        valor: '98.5%',
        descripcion: 'Tasa de éxito',
        tendencia: 'stable',
      },
      {
        nombre: 'Almacenamiento',
        valor: '2.4 GB',
        descripcion: 'Espacio utilizado',
        tendencia: 'up',
        porcentaje: 15,
      },
    ];
  }


  descargarReporte(reporte: Reporte): void {
    if (reporte.estado === 'COMPLETADO' && reporte.ruta_archivo) {
      console.log('Descargando reporte:', reporte.ruta_archivo);
      // Implementar descarga real
    }
  }

  eliminar(reporte: Reporte): void {
    // Usar dialog de confirmación shared
    import('../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component').then(
      ({ ConfirmacionDialogComponent }) => {
        const config = {
          titulo: 'Eliminar Reporte',
          mensaje: `¿Está seguro que desea eliminar el reporte "${reporte.tipo_reporte}"?`,
          confirmar: 'Eliminar',
          cancelar: 'Cancelar'
        };
        
        const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
          width: '500px',
          disableClose: true,
          data: config,
        });
        
        dialogRef.afterClosed().subscribe((confirmado) => {
          if (confirmado && reporte.id_reporte) {
            console.log('Eliminar reporte:', reporte);
            this.cargarDatos();
          }
        });
      }
    );
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO');
  }

  formatearHora(fecha: string): string {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatearParametros(parametros: string): string {
    if (!parametros) return '-';
    return parametros.length > 50
      ? `${parametros.substring(0, 50)}...`
      : parametros;
  }

  formatearTamano(bytes: number): string {
    if (!bytes || bytes === 0) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  getEstadoTexto(estado: string): string {
    const estados: { [key: string]: string } = {
      GENERANDO: 'Generando',
      COMPLETADO: 'Completado',
      ERROR: 'Error',
    };
    return estados[estado] || estado;
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      GENERANDO: 'badge-warning',
      COMPLETADO: 'badge-success',
      ERROR: 'badge-error',
    };
    return clases[estado] || 'badge-neutral';
  }

  getCardClass(tendencia: string): string {
    const clases: { [key: string]: string } = {
      up: 'card-success',
      down: 'card-warning',
      stable: 'card-neutral',
    };
    return clases[tendencia] || '';
  }

  getTrendClass(tendencia: string): string {
    const clases: { [key: string]: string } = {
      up: 'trend-up',
      down: 'trend-down',
      stable: 'trend-stable',
    };
    return clases[tendencia] || '';
  }

  sortData(column: string): void {
    console.log('Ordenando por:', column);
  }

  verDetalle(reporte: Reporte): void {
    import('../shared/dialogs/detalle-dialog/detalle-dialog.component').then(
      ({ DetalleDialogComponent }) => {
        import('../shared/configs/reportes-config').then(
          ({ ReportesConfig }) => {
            const dialogRef = this.dialog.open(DetalleDialogComponent, {
              width: '800px',
              disableClose: true,
              data: ReportesConfig.getConfiguracionDetalle(reporte),
            });
          }
        );
      }
    );
  }

  agregar(): void {
    import(
      '../shared/dialogs/formulario-dialog/formulario-dialog.component'
    ).then(({ FormularioDialogComponent }) => {
      import('../shared/configs/reportes-config').then(({ ReportesConfig }) => {
        const dialogRef = this.dialog.open(FormularioDialogComponent, {
          width: '600px',
          disableClose: true,
          data: ReportesConfig.getConfiguracionFormulario(false),
        });

        dialogRef.afterClosed().subscribe((resultado) => {
          if (resultado?.accion === 'guardar') {
            console.log('Generando reporte con configuración:', resultado.datos);
            this.cargarDatos();
          }
        });
      });
    });
  }

  private configurarExportacion(): ConfiguracionExportacion<Reporte> {
    return {
      entidades: this.reportes,
      nombreArchivo: 'reportes',
      nombreEntidad: 'Reportes',
      columnas: [
        { campo: 'id_reporte', titulo: 'ID', formato: 'numero' },
        { campo: 'tipo_reporte', titulo: 'Tipo Reporte', formato: 'texto' },
        {
          campo: 'fecha_generacion',
          titulo: 'Fecha Generación',
          formato: 'fecha',
        },
        { campo: 'usuario', titulo: 'Usuario', formato: 'texto' },
        { campo: 'parametros', titulo: 'Parámetros', formato: 'texto' },
        { campo: 'estado', titulo: 'Estado', formato: 'texto' },
        { campo: 'tamano_archivo', titulo: 'Tamaño', formato: 'numero' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.reportes.length,
        cantidadFiltrada: this.reportes.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Reporte> {
    return {
      tipoEntidad: 'reportes',
      mapeoColumnas: [
        {
          columnaArchivo: 'Tipo Reporte',
          campoEntidad: 'tipo_reporte',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Usuario',
          campoEntidad: 'usuario',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Parámetros',
          campoEntidad: 'parametros',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'tipo_reporte',
          validador: (valor) => valor && valor.length <= 100,
          mensajeError: 'El tipo de reporte debe tener máximo 100 caracteres',
        },
        {
          campo: 'usuario',
          validador: (valor) => valor && valor.length <= 50,
          mensajeError: 'El usuario debe tener máximo 50 caracteres',
        },
      ],
    };
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

  private descargarPlantillaCargaMasiva(): void {
    const config = this.configurarCargaMasiva();
    this.cargaMasivaService.generarPlantilla(config);
  }

  private procesarArchivoCargaMasiva(archivo: File): void {
    const config = this.configurarCargaMasiva();
    this.cargaMasivaService
      .procesarArchivo(archivo, config)
      .then((resultado) => {
        console.log('Archivo procesado:', resultado);
        if (resultado.exitosa) {
          this.cargarDatos();
        }
      })
      .catch((error) => {
        console.error('Error procesando archivo:', error);
      });
  }

  private obtenerFiltrosActivos(): any {
    return {};
  }

  reintentarCarga(): void {
    this.cargarDatos();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-export')) {
      this.dropdownExportAbierto = false;
    }
  }
}
