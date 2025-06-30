import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
} from '../services/carga-masiva.service';

interface LogSistema {
  id_log: number;
  nivel: 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG';
  modulo: string;
  mensaje: string;
  usuario: string;
  fecha: Date;
  detalles?: string;
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
  ],
  templateUrl: './logs.html',
  styleUrl: './logs.scss',
})
export class LogsComponent implements OnInit {
  displayedColumns: string[] = [
    'id_log',
    'nivel',
    'modulo',
    'mensaje',
    'usuario',
    'fecha',
    'acciones',
  ];

  dataSource = new MatTableDataSource<LogSistema>([]);
  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosColumnaHabilitados = false;
  dropdownExportAbierto = false;

  logs: LogSistema[] = [];
  cargando = false;
  error: string | null = null;

  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private exportacionService = inject(ExportacionService);
  private cargaMasivaService = inject(CargaMasivaService);

  get hasError(): boolean {
    return !!this.error;
  }

  get isEmpty(): boolean {
    return !this.cargando && !this.error && this.logs.length === 0;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.cargando &&
      !this.error &&
      this.logs.length > 0 &&
      this.dataSource.data.length === 0
    );
  }

  get errorMessage(): string {
    return this.error || '';
  }

  constructor() {
    this.filtroGeneralForm = this.fb.group({
      busquedaGeneral: [''],
    });

    this.filtrosColumnaForm = this.fb.group({
      idLog: [''],
      nivel: [''],
      modulo: [''],
      mensaje: [''],
      usuario: [''],
      fechaDesde: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.configurarFiltros();
  }

  private configurarFiltros(): void {
    this.filtroGeneralForm
      .get('busquedaGeneral')
      ?.valueChanges.subscribe(() => {
        this.aplicarFiltroGeneral();
      });

    this.filtrosColumnaForm.valueChanges.subscribe(() => {
      this.aplicarFiltrosColumna();
    });
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    setTimeout(() => {
      try {
        this.logs = [
          {
            id_log: 1,
            nivel: 'ERROR',
            modulo: 'Autenticación',
            mensaje:
              'Intento de acceso fallido para usuario: operador@texfina.com',
            usuario: 'sistema',
            fecha: new Date('2024-01-15T10:30:00'),
            detalles: 'IP: 192.168.1.100, User-Agent: Mozilla/5.0',
          },
          {
            id_log: 2,
            nivel: 'INFO',
            modulo: 'Almacenes',
            mensaje: 'Nuevo almacén creado exitosamente',
            usuario: 'admin@texfina.com',
            fecha: new Date('2024-01-15T11:45:00'),
            detalles: 'Almacén ID: 5, Nombre: Almacén Principal',
          },
          {
            id_log: 3,
            nivel: 'WARNING',
            modulo: 'Stock',
            mensaje: 'Stock bajo detectado en material',
            usuario: 'sistema',
            fecha: new Date('2024-01-15T14:20:00'),
            detalles: 'Material ID: 25, Stock actual: 5, Mínimo: 10',
          },
          {
            id_log: 4,
            nivel: 'DEBUG',
            modulo: 'Base de Datos',
            mensaje: 'Consulta de optimización ejecutada',
            usuario: 'sistema',
            fecha: new Date('2024-01-16T09:15:00'),
            detalles: 'Duración: 1.2s, Registros procesados: 1500',
          },
          {
            id_log: 5,
            nivel: 'ERROR',
            modulo: 'Reportes',
            mensaje: 'Error al generar reporte mensual',
            usuario: 'supervisor@texfina.com',
            fecha: new Date('2024-01-16T16:30:00'),
            detalles: 'Error: TimeoutException, Periodo: Enero 2024',
          },
        ];

        this.dataSource.data = [...this.logs];
        this.cargando = false;
      } catch (error) {
        this.error = 'Error al cargar los logs del sistema';
        this.cargando = false;
      }
    }, 1000);
  }

  aplicarFiltroGeneral(): void {
    const filtro =
      this.filtroGeneralForm.get('busquedaGeneral')?.value?.toLowerCase() || '';

    if (!filtro.trim()) {
      this.dataSource.data = [...this.logs];
      return;
    }

    this.dataSource.data = this.logs.filter(
      (log) =>
        log.id_log.toString().includes(filtro) ||
        log.nivel.toLowerCase().includes(filtro) ||
        log.modulo.toLowerCase().includes(filtro) ||
        log.mensaje.toLowerCase().includes(filtro) ||
        log.usuario.toLowerCase().includes(filtro)
    );
  }

  aplicarFiltrosColumna(): void {
    const filtros = this.filtrosColumnaForm.value;
    let datosFiltrados = [...this.logs];

    if (filtros.idLog) {
      datosFiltrados = datosFiltrados.filter((log) =>
        log.id_log.toString().includes(filtros.idLog)
      );
    }

    if (filtros.nivel) {
      datosFiltrados = datosFiltrados.filter(
        (log) => log.nivel === filtros.nivel
      );
    }

    if (filtros.modulo) {
      datosFiltrados = datosFiltrados.filter((log) =>
        log.modulo.toLowerCase().includes(filtros.modulo.toLowerCase())
      );
    }

    if (filtros.mensaje) {
      datosFiltrados = datosFiltrados.filter((log) =>
        log.mensaje.toLowerCase().includes(filtros.mensaje.toLowerCase())
      );
    }

    if (filtros.usuario) {
      datosFiltrados = datosFiltrados.filter((log) =>
        log.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())
      );
    }

    this.dataSource.data = datosFiltrados;
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.get('busquedaGeneral')?.setValue('');
    this.dataSource.data = [...this.logs];
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
    this.aplicarFiltroGeneral();
  }

  sortData(sort: Sort | string): void {
    const sortField = typeof sort === 'string' ? sort : sort.active;
    const sortDirection = typeof sort === 'string' ? 'asc' : sort.direction;

    if (!sortDirection) {
      this.dataSource.data = [...this.logs];
      return;
    }

    this.dataSource.data = this.dataSource.data.sort((a, b) => {
      const isAsc = sortDirection === 'asc';

      switch (sortField) {
        case 'id_log':
          return this.compare(a.id_log, b.id_log, isAsc);
        case 'nivel':
          return this.compare(a.nivel, b.nivel, isAsc);
        case 'modulo':
          return this.compare(a.modulo, b.modulo, isAsc);
        case 'mensaje':
          return this.compare(a.mensaje, b.mensaje, isAsc);
        case 'usuario':
          return this.compare(a.usuario, b.usuario, isAsc);
        case 'fecha':
          return this.compare(a.fecha, b.fecha, isAsc);
        default:
          return 0;
      }
    });
  }

  private compare(a: any, b: any, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  reintentarCarga(): void {
    this.cargarDatos();
  }

  cargaMasiva(): void {
    console.log(
      'Funcionalidad de carga masiva - configuración:',
      this.configurarCargaMasiva()
    );
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

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  verDetalle(log: LogSistema): void {
    console.log('Ver detalle de log:', log);
  }

  formatearCodigo(id?: number): string {
    if (!id) return '00001';
    return id.toString().padStart(5, '0');
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  formatearNivel(nivel: string): string {
    const niveles: { [key: string]: string } = {
      ERROR: 'Error',
      WARNING: 'Advertencia',
      INFO: 'Información',
      DEBUG: 'Debug',
    };
    return niveles[nivel] || nivel;
  }

  obtenerClaseNivel(nivel: string): string {
    const clases: { [key: string]: string } = {
      ERROR: 'badge-danger',
      WARNING: 'badge-warning',
      INFO: 'badge-info',
      DEBUG: 'badge-neutral',
    };
    return clases[nivel] || 'badge-neutral';
  }

  formatearMensaje(mensaje: string): string {
    if (!mensaje) return '-';
    return mensaje.length > 50 ? mensaje.substring(0, 50) + '...' : mensaje;
  }

  formatearFecha(fecha: Date): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private configurarExportacion(): ConfiguracionExportacion<LogSistema> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'logs-sistema',
      nombreEntidad: 'Logs del Sistema',
      columnas: [
        { campo: 'id_log', titulo: 'ID', formato: 'numero' },
        { campo: 'nivel', titulo: 'Nivel', formato: 'texto' },
        { campo: 'modulo', titulo: 'Módulo', formato: 'texto' },
        { campo: 'mensaje', titulo: 'Mensaje', formato: 'texto' },
        { campo: 'usuario', titulo: 'Usuario', formato: 'texto' },
        { campo: 'fecha', titulo: 'Fecha', formato: 'fecha' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.logs.length,
        cantidadFiltrada: this.dataSource.data.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<LogSistema> {
    return {
      tipoEntidad: 'logs',
      mapeoColumnas: [
        {
          columnaArchivo: 'Nivel',
          campoEntidad: 'nivel',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Módulo',
          campoEntidad: 'modulo',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Mensaje',
          campoEntidad: 'mensaje',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Usuario',
          campoEntidad: 'usuario',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'mensaje',
          validador: (valor) => valor && valor.length <= 500,
          mensajeError: 'El mensaje debe tener máximo 500 caracteres',
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
}
