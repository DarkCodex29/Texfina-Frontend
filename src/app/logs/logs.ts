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
import { CargaMasivaDialogComponent } from '../materiales/carga-masiva-dialog/carga-masiva-dialog.component';

interface LogSistema {
  id_log: number;
  nivel: 'ERROR' | 'WARNING' | 'INFO' | 'DEBUG';
  fecha_hora: string;
  usuario: string;
  accion: string;
  mensaje: string;
  ip_address: string;
  detalles?: string;
}

interface Estadistica {
  nombre: string;
  valor: string;
  descripcion: string;
  tipo: 'error' | 'warning' | 'info' | 'success';
  porcentaje?: number;
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
    'nivel',
    'fecha',
    'usuario',
    'accion',
    'mensaje',
    'ip',
    'acciones',
  ];

  dataSource = new MatTableDataSource<LogSistema>([]);
  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosColumnaHabilitados = false;
  dropdownExportAbierto = false;

  logs: LogSistema[] = [];
  estadisticas: Estadistica[] = [];
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
      nivel: [''],
      fecha: [''],
      usuario: [''],
      accion: [''],
      mensaje: [''],
      ip: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarEstadisticas();
    this.configurarFiltros();
  }

  private configurarFiltros(): void {
    this.filtroGeneralForm
      .get('busquedaGeneral')
      ?.valueChanges.subscribe(() => {
        this.aplicarFiltroGeneral();
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
            fecha_hora: '2024-01-15T10:30:00',
            usuario: 'operador@texfina.com',
            accion: 'LOGIN_FAILED',
            mensaje: 'Intento de acceso fallido - credenciales incorrectas',
            ip_address: '192.168.1.100',
            detalles: 'User-Agent: Mozilla/5.0',
          },
          {
            id_log: 2,
            nivel: 'INFO',
            fecha_hora: '2024-01-15T11:45:00',
            usuario: 'admin@texfina.com',
            accion: 'CREATE_ALMACEN',
            mensaje: 'Nuevo almacén creado exitosamente',
            ip_address: '192.168.1.101',
            detalles: 'Almacén ID: 5, Nombre: Almacén Principal',
          },
          {
            id_log: 3,
            nivel: 'WARNING',
            fecha_hora: '2024-01-15T14:20:00',
            usuario: 'sistema',
            accion: 'STOCK_LOW',
            mensaje: 'Stock bajo detectado en material MT001',
            ip_address: '127.0.0.1',
            detalles: 'Stock actual: 5, Mínimo: 20',
          },
          {
            id_log: 4,
            nivel: 'DEBUG',
            fecha_hora: '2024-01-16T09:15:00',
            usuario: 'sistema',
            accion: 'DB_OPTIMIZATION',
            mensaje: 'Consulta de optimización ejecutada',
            ip_address: '127.0.0.1',
            detalles: 'Duración: 1.2s, Registros: 1500',
          },
          {
            id_log: 5,
            nivel: 'ERROR',
            fecha_hora: '2024-01-16T16:30:00',
            usuario: 'supervisor@texfina.com',
            accion: 'GENERATE_REPORT',
            mensaje: 'Error al generar reporte mensual',
            ip_address: '192.168.1.102',
            detalles: 'TimeoutException - Periodo: Enero 2024',
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

  cargarEstadisticas(): void {
    this.estadisticas = [
      {
        nombre: 'Eventos Hoy',
        valor: '156',
        descripcion: 'Total de eventos registrados',
        tipo: 'info',
        porcentaje: 8,
      },
      {
        nombre: 'Errores',
        valor: '12',
        descripcion: 'Errores en las últimas 24h',
        tipo: 'error',
        porcentaje: 15,
      },
      {
        nombre: 'Advertencias',
        valor: '34',
        descripcion: 'Advertencias activas',
        tipo: 'warning',
        porcentaje: 5,
      },
      {
        nombre: 'Sistema Saludable',
        valor: '92%',
        descripcion: 'Uptime del sistema',
        tipo: 'success',
      },
    ];
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
        log.nivel.toLowerCase().includes(filtro) ||
        log.usuario.toLowerCase().includes(filtro) ||
        log.accion.toLowerCase().includes(filtro) ||
        log.mensaje.toLowerCase().includes(filtro) ||
        log.ip_address.toLowerCase().includes(filtro) ||
        this.formatearFecha(log.fecha_hora).toLowerCase().includes(filtro)
    );
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.get('busquedaGeneral')?.setValue('');
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
  }

  eliminar(log: LogSistema): void {
    const confirmacion = confirm(
      `¿Está seguro que desea eliminar este log del ${log.fecha_hora}?`
    );
    if (confirmacion && log.id_log) {
      console.log('Eliminar log:', log);
      this.cargarDatos();
    }
  }

  sortData(sort: Sort | string): void {
    console.log('Ordenar por:', sort);
  }

  reintentarCarga(): void {
    this.cargarDatos();
  }

  agregar(): void {
    console.log('Limpiar logs del sistema');
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
    console.log('Ver detalle del log:', log);
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

  formatearMensaje(mensaje: string): string {
    if (!mensaje) return '-';
    return mensaje.length > 60 ? `${mensaje.substring(0, 60)}...` : mensaje;
  }

  getNivelTexto(nivel: string): string {
    const niveles: { [key: string]: string } = {
      ERROR: 'Error',
      WARNING: 'Advertencia',
      INFO: 'Información',
      DEBUG: 'Debug',
    };
    return niveles[nivel] || nivel;
  }

  getNivelBadgeClass(nivel: string): string {
    const clases: { [key: string]: string } = {
      ERROR: 'badge-error',
      WARNING: 'badge-warning',
      INFO: 'badge-info',
      DEBUG: 'badge-neutral',
    };
    return clases[nivel] || 'badge-neutral';
  }

  getCardClass(tipo: string): string {
    const clases: { [key: string]: string } = {
      error: 'card-error',
      warning: 'card-warning',
      info: 'card-info',
      success: 'card-success',
    };
    return clases[tipo] || '';
  }

  getTrendClass(tipo: string): string {
    const clases: { [key: string]: string } = {
      error: 'trend-down',
      warning: 'trend-stable',
      info: 'trend-up',
      success: 'trend-up',
    };
    return clases[tipo] || '';
  }

  private configurarExportacion(): ConfiguracionExportacion<LogSistema> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'logs_sistema',
      nombreEntidad: 'Logs del Sistema',
      columnas: [
        { campo: 'id_log', titulo: 'ID', formato: 'numero' },
        { campo: 'nivel', titulo: 'Nivel', formato: 'texto' },
        { campo: 'fecha_hora', titulo: 'Fecha/Hora', formato: 'fecha' },
        { campo: 'usuario', titulo: 'Usuario', formato: 'texto' },
        { campo: 'accion', titulo: 'Acción', formato: 'texto' },
        { campo: 'mensaje', titulo: 'Mensaje', formato: 'texto' },
        { campo: 'ip_address', titulo: 'IP', formato: 'texto' },
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
          columnaArchivo: 'Usuario',
          campoEntidad: 'usuario',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Acción',
          campoEntidad: 'accion',
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
          columnaArchivo: 'IP',
          campoEntidad: 'ip_address',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'nivel',
          validador: (valor) =>
            ['ERROR', 'WARNING', 'INFO', 'DEBUG'].includes(valor),
          mensajeError: 'El nivel debe ser: ERROR, WARNING, INFO o DEBUG',
        },
        {
          campo: 'usuario',
          validador: (valor) => valor && valor.length <= 100,
          mensajeError: 'El usuario debe tener máximo 100 caracteres',
        },
        {
          campo: 'mensaje',
          validador: (valor) => valor && valor.length <= 500,
          mensajeError: 'El mensaje debe tener máximo 500 caracteres',
        },
      ],
    };
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
}
