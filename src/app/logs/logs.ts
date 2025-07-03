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

interface LogEvento {
  id: number;
  id_usuario: number;
  usuario?: string;
  accion: string;
  descripcion: string;
  ip_origen: string;
  modulo: string;
  tabla_afectada: string;
  timestamp: string;
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
    'id',
    'timestamp',
    'usuario',
    'accion',
    'modulo',
    'ip_origen',
    'acciones',
  ];

  dataSource = new MatTableDataSource<LogEvento>([]);
  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosColumnaHabilitados = false;
  dropdownExportAbierto = false;

  logs: LogEvento[] = [];
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
      id: [''],
      timestamp: [''],
      usuario: [''],
      accion: [''],
      modulo: [''],
      ip_origen: [''],
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
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    setTimeout(() => {
      try {
        this.logs = [
          {
            id: 1,
            id_usuario: 1,
            usuario: 'admin@texfina.com',
            accion: 'LOGIN_SUCCESS',
            descripcion: 'Usuario autenticado exitosamente',
            ip_origen: '192.168.1.100',
            modulo: 'AUTENTICACIÓN',
            tabla_afectada: 'USUARIO',
            timestamp: '2024-01-20T10:30:25',
          },
          {
            id: 2,
            id_usuario: 2,
            usuario: 'operador@texfina.com',
            accion: 'CREATE_ALMACEN',
            descripcion: 'Almacén Principal creado exitosamente',
            ip_origen: '192.168.1.101',
            modulo: 'ALMACENES',
            tabla_afectada: 'ALMACEN',
            timestamp: '2024-01-20T11:45:10',
          },
          {
            id: 3,
            id_usuario: 1,
            usuario: 'admin@texfina.com',
            accion: 'UPDATE_STOCK',
            descripcion: 'Stock actualizado: Material MT-001 (+50 unidades)',
            ip_origen: '192.168.1.100',
            modulo: 'MATERIALES',
            tabla_afectada: 'STOCK',
            timestamp: '2024-01-20T14:20:33',
          },
          {
            id: 4,
            id_usuario: 3,
            usuario: 'supervisor@texfina.com',
            accion: 'DELETE_PROVIDER',
            descripcion: 'Proveedor ACME Corp eliminado del sistema',
            ip_origen: '192.168.1.102',
            modulo: 'PROVEEDORES',
            tabla_afectada: 'PROVEEDOR',
            timestamp: '2024-01-20T15:15:42',
          },
          {
            id: 5,
            id_usuario: 2,
            usuario: 'operador@texfina.com',
            accion: 'GENERATE_REPORT',
            descripcion: 'Reporte mensual de inventario generado',
            ip_origen: '192.168.1.101',
            modulo: 'REPORTES',
            tabla_afectada: 'REPORTE',
            timestamp: '2024-01-20T16:30:15',
          },
          {
            id: 6,
            id_usuario: 4,
            usuario: 'jefe.almacen@texfina.com',
            accion: 'CREATE_LOTE',
            descripcion: 'Nuevo lote L-2024-001 registrado',
            ip_origen: '192.168.1.103',
            modulo: 'LOTES',
            tabla_afectada: 'LOTE',
            timestamp: '2024-01-20T17:45:20',
          },
          {
            id: 7,
            id_usuario: 1,
            usuario: 'admin@texfina.com',
            accion: 'UPDATE_USER',
            descripcion: 'Permisos de usuario operador actualizados',
            ip_origen: '192.168.1.100',
            modulo: 'USUARIOS',
            tabla_afectada: 'USUARIO',
            timestamp: '2024-01-20T18:00:05',
          },
          {
            id: 8,
            id_usuario: 2,
            usuario: 'operador@texfina.com',
            accion: 'CONSUMO_MATERIAL',
            descripcion: 'Consumo registrado: 25kg Material MT-002',
            ip_origen: '192.168.1.101',
            modulo: 'CONSUMOS',
            tabla_afectada: 'CONSUMO',
            timestamp: '2024-01-20T19:12:40',
          },
          {
            id: 9,
            id_usuario: 5,
            usuario: 'calidad@texfina.com',
            accion: 'APPROVE_INGRESO',
            descripcion: 'Ingreso aprobado: Orden compra OC-2024-015',
            ip_origen: '192.168.1.104',
            modulo: 'INGRESOS',
            tabla_afectada: 'INGRESO',
            timestamp: '2024-01-20T20:30:18',
          },
          {
            id: 10,
            id_usuario: 3,
            usuario: 'supervisor@texfina.com',
            accion: 'BACKUP_DATABASE',
            descripcion: 'Respaldo automático de base de datos completado',
            ip_origen: '127.0.0.1',
            modulo: 'SISTEMA',
            tabla_afectada: 'SISTEMA',
            timestamp: '2024-01-20T22:00:00',
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
    const busqueda = this.filtroGeneralForm.get('busquedaGeneral')?.value || '';

    if (!busqueda) {
      this.dataSource.data = this.logs;
      return;
    }

    const filtrados = this.logs.filter(
      (log) =>
        log.accion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        log.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        log.modulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        log.ip_origen?.toLowerCase().includes(busqueda.toLowerCase()) ||
        log.usuario?.toLowerCase().includes(busqueda.toLowerCase())
    );

    this.dataSource.data = filtrados;
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.patchValue({ busquedaGeneral: '' });
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
  }

  eliminar(log: LogEvento): void {
    const confirmacion = confirm(
      `¿Está seguro que desea eliminar el log #${this.formatearCodigo(log.id)}?`
    );
    if (confirmacion) {
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
    import(
      '../shared/dialogs/formulario-dialog/formulario-dialog.component'
    ).then(({ FormularioDialogComponent }) => {
      import('../shared/configs/logs-config').then(({ LogsConfig }) => {
        const dialogRef = this.dialog.open(FormularioDialogComponent, {
          width: '600px',
          disableClose: true,
          data: {
            configuracion: LogsConfig.getConfiguracionFormulario(false),
          },
        });

        dialogRef.afterClosed().subscribe((resultado) => {
          if (resultado) {
            console.log('Creando log manual:', resultado);
            this.cargarDatos();
          }
        });
      });
    });
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

  verDetalle(log: LogEvento): void {
    import('../shared/dialogs/detalle-dialog/detalle-dialog.component').then(
      ({ DetalleDialogComponent }) => {
        import('../shared/configs/logs-config').then(({ LogsConfig }) => {
          const dialogRef = this.dialog.open(DetalleDialogComponent, {
            width: '800px',
            disableClose: true,
            data: {
              configuracion: LogsConfig.getConfiguracionDetalle(log),
            },
          });
        });
      }
    );
  }

  formatearCodigo(id?: number): string {
    if (!id) return '000001';
    return id.toString().padStart(6, '0');
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleDateString('es-ES');
    } catch {
      return '-';
    }
  }

  formatearHora(fecha: string): string {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  }

  private configurarExportacion(): ConfiguracionExportacion<LogEvento> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'logs_sistema',
      nombreEntidad: 'Logs del Sistema',
      columnas: [
        { campo: 'id', titulo: 'ID', formato: 'numero' },
        { campo: 'timestamp', titulo: 'Fecha/Hora', formato: 'fecha' },
        { campo: 'usuario', titulo: 'Usuario', formato: 'texto' },
        { campo: 'accion', titulo: 'Acción', formato: 'texto' },
        { campo: 'modulo', titulo: 'Módulo', formato: 'texto' },
        { campo: 'descripcion', titulo: 'Descripción', formato: 'texto' },
        { campo: 'ip_origen', titulo: 'IP Origen', formato: 'texto' },
        { campo: 'tabla_afectada', titulo: 'Tabla Afectada', formato: 'texto' },
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

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<LogEvento> {
    return {
      tipoEntidad: 'logs_sistema',
      mapeoColumnas: [
        {
          columnaArchivo: 'ID Usuario',
          campoEntidad: 'id_usuario',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Acción',
          campoEntidad: 'accion',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Descripción',
          campoEntidad: 'descripcion',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'IP Origen',
          campoEntidad: 'ip_origen',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Módulo',
          campoEntidad: 'modulo',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Tabla Afectada',
          campoEntidad: 'tabla_afectada',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'accion',
          validador: (valor) => valor && valor.length <= 100,
          mensajeError: 'La acción debe tener máximo 100 caracteres',
        },
        {
          campo: 'descripcion',
          validador: (valor) => valor && valor.length <= 500,
          mensajeError: 'La descripción debe tener máximo 500 caracteres',
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
        console.error('Error al procesar archivo:', error);
      });
  }

  private obtenerFiltrosActivos(): any {
    const filtroGeneral = this.filtroGeneralForm.get('busquedaGeneral')?.value;
    const filtrosColumna = this.filtrosColumnaForm.value;

    return {
      busquedaGeneral: filtroGeneral || null,
      filtrosColumna: Object.keys(filtrosColumna).reduce((acc, key) => {
        if (filtrosColumna[key]) {
          acc[key] = filtrosColumna[key];
        }
        return acc;
      }, {} as any),
    };
  }
}
