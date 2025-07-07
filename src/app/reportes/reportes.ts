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
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
} from '../services/carga-masiva.service';
import { CargaMasivaDialogComponent } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';

export interface Reporte {
  id_reporte: number;
  tipo_reporte: string;
  fecha_generacion: string;
  usuario: string;
  parametros: string;
  estado: 'GENERANDO' | 'COMPLETADO' | 'ERROR';
  tamano_archivo: number;
  ruta_archivo?: string;
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

  isLoading = false;
  hasError = false;
  errorMessage = '';
  dropdownExportAbierto = false;

  reportes: Reporte[] = [];
  dataSource = new MatTableDataSource<Reporte>([]);
  displayedColumns: string[] = [
    'tipo',
    'fecha',
    'usuario',
    'parametros',
    'estado',
    'tamano',
    'acciones',
  ];

  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosColumnaHabilitados = false;
  kpis: KPI[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {
    this.filtroGeneralForm = this.fb.group({
      busquedaGeneral: [''],
    });

    this.filtrosColumnaForm = this.fb.group({
      tipo: [''],
      fecha: [''],
      usuario: [''],
      parametros: [''],
      estado: [''],
      tamano: [''],
    });
  }

  ngOnInit(): void {
    this.configurarFiltros();
    this.cargarDatos();
    this.cargarKPIs();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isEmpty(): boolean {
    return !this.isLoading && !this.hasError && this.reportes.length === 0;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      !this.hasError &&
      this.reportes.length > 0 &&
      this.dataSource.filteredData.length === 0
    );
  }

  private configurarFiltros() {
    this.filtroGeneralForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltroGeneral();
      });
  }

  private async cargarDatos() {
    this.isLoading = true;
    this.hasError = false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.cargarDatosMock();
    } catch (error) {
      this.hasError = true;
      this.errorMessage = 'Error al cargar los datos de reportes';
      console.error('Error cargando reportes:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private cargarDatosMock() {
    this.reportes = [
      {
        id_reporte: 1,
        tipo_reporte: 'Inventario General',
        fecha_generacion: '2024-01-15T10:30:00',
        usuario: 'Admin User',
        parametros: 'Todos los almacenes, todas las clases',
        estado: 'COMPLETADO',
        tamano_archivo: 2048576,
        ruta_archivo: '/reportes/inventario_20240115.xlsx',
      },
      {
        id_reporte: 2,
        tipo_reporte: 'Movimientos Diarios',
        fecha_generacion: '2024-01-14T15:45:00',
        usuario: 'Operador 1',
        parametros: 'Fecha: 2024-01-14, Almacén Principal',
        estado: 'COMPLETADO',
        tamano_archivo: 1024000,
        ruta_archivo: '/reportes/movimientos_20240114.pdf',
      },
      {
        id_reporte: 3,
        tipo_reporte: 'Stock Crítico',
        fecha_generacion: '2024-01-13T09:15:00',
        usuario: 'Supervisor',
        parametros: 'Items con stock menor al mínimo',
        estado: 'ERROR',
        tamano_archivo: 0,
      },
      {
        id_reporte: 4,
        tipo_reporte: 'Análisis de Rotación',
        fecha_generacion: '2024-01-12T14:20:00',
        usuario: 'Analista',
        parametros: 'Período: Último trimestre',
        estado: 'GENERANDO',
        tamano_archivo: 0,
      },
    ];

    this.dataSource.data = [...this.reportes];
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

  aplicarFiltroGeneral(): void {
    const filtro =
      this.filtroGeneralForm.get('busquedaGeneral')?.value?.toLowerCase() || '';

    if (!filtro.trim()) {
      this.dataSource.data = [...this.reportes];
      return;
    }

    this.dataSource.data = this.reportes.filter(
      (reporte) =>
        reporte.tipo_reporte.toLowerCase().includes(filtro) ||
        reporte.usuario.toLowerCase().includes(filtro) ||
        reporte.parametros.toLowerCase().includes(filtro) ||
        this.getEstadoTexto(reporte.estado).toLowerCase().includes(filtro) ||
        this.formatearFecha(reporte.fecha_generacion)
          .toLowerCase()
          .includes(filtro)
    );
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.get('busquedaGeneral')?.setValue('');
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
  }

  descargar(reporte: Reporte): void {
    if (reporte.estado === 'COMPLETADO' && reporte.ruta_archivo) {
      console.log('Descargando reporte:', reporte.ruta_archivo);
      this.snackBar.open('Descargando reporte...', 'Cerrar', {
        duration: 3000,
      });
    }
  }

  eliminar(reporte: Reporte): void {
    const confirmacion = confirm(
      `¿Está seguro que desea eliminar el reporte "${reporte.tipo_reporte}"?`
    );
    if (confirmacion && reporte.id_reporte) {
      console.log('Eliminar reporte:', reporte);
      this.snackBar.open('Reporte eliminado correctamente', 'Cerrar', {
        duration: 3000,
      });
      this.cargarDatos();
    }
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
              data: {
                configuracion: ReportesConfig.getConfiguracionDetalle(reporte),
              },
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
          data: {
            configuracion: ReportesConfig.getConfiguracionFormulario(false),
          },
        });

        dialogRef.afterClosed().subscribe((resultado) => {
          if (resultado) {
            console.log('Generando reporte con configuración:', resultado);
            this.snackBar.open('Reporte programado para generación', 'Cerrar', {
              duration: 3000,
            });
            this.cargarDatos();
          }
        });
      });
    });
  }

  private configurarExportacion(): ConfiguracionExportacion<Reporte> {
    return {
      entidades: this.dataSource.data,
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
        cantidadFiltrada: this.dataSource.data.length,
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
    return {
      busquedaGeneral:
        this.filtroGeneralForm.get('busquedaGeneral')?.value || '',
    };
  }

  reintentarCarga(): void {
    this.cargarDatos();
  }
}
