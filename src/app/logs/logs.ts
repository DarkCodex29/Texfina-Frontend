import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { PrimeDataTableComponent, TableColumn, TableAction, TableState, TableButtonConfig } from '../shared/components/prime-data-table/prime-data-table.component';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
} from '../services/carga-masiva.service';
import { CargaMasivaDialogComponent } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';
import { LogsConfig } from '../shared/configs/logs-config';

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
  [key: string]: string | number | undefined;
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    PrimeDataTableComponent,
  ],
  templateUrl: './logs.html',
  styleUrl: './logs.scss',
})
export class LogsComponent implements OnInit {
  tableColumns: TableColumn[] = LogsConfig.getTableColumns();
  tableActions: TableAction[] = LogsConfig.getTableActions();
  tableButtons: TableButtonConfig[] = LogsConfig.getTableButtons();
  
  tableState: TableState = {
    loading: false,
    error: false,
    empty: false,
    filteredEmpty: false
  };

  logs: LogEvento[] = [];
  dropdownExportAbierto = false;

  private dialog = inject(MatDialog);
  private exportacionService = inject(ExportacionService);
  private cargaMasivaService = inject(CargaMasivaService);

  constructor() {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.tableState = { ...this.tableState, loading: true, error: false };
    
    setTimeout(() => {
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
        accion: 'LOGOUT',
        descripcion: 'Usuario cerró sesión',
        ip_origen: '192.168.1.100',
        modulo: 'AUTENTICACIÓN',
        tabla_afectada: 'USUARIO',
        timestamp: '2024-01-20T18:00:00',
      },
    ];
      
      this.tableState = { 
        ...this.tableState, 
        loading: false, 
        empty: this.logs.length === 0,
        filteredEmpty: false
      };
    }, 1000);
  }

  reintentarCarga(): void {
    this.cargarDatos();
  }

  private eliminar(log: LogEvento): void {
    import('../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component').then(
      ({ ConfirmacionDialogComponent }) => {
        const config = LogsConfig.eliminarLog(log);
        const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
          width: '400px',
          disableClose: true,
          data: config,
        });

        dialogRef.afterClosed().subscribe((confirmed) => {
          if (confirmed) {
            this.logs = this.logs.filter((l) => l.id !== log.id);
            this.tableState = {
              ...this.tableState,
              empty: this.logs.length === 0
            };
          }
        });
      }
    );
  }

  private agregar(): void {
    import(
      '../shared/dialogs/formulario-dialog/formulario-dialog.component'
    ).then(({ FormularioDialogComponent }) => {
      const config = LogsConfig.getConfiguracionFormulario(false);
      const dialogRef = this.dialog.open(FormularioDialogComponent, {
        width: '600px',
        disableClose: true,
        data: config,
      });

      dialogRef.afterClosed().subscribe((resultado) => {
        if (resultado?.accion === 'guardar') {
          console.log('Agregando nuevo log:', resultado.datos);
          this.cargarDatos();
        }
      });
    });
  }

  private cargaMasiva(): void {
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
    const config = this.configurarExportacion();
    this.exportacionService.exportarExcel(config);
    this.dropdownExportAbierto = false;
  }

  exportarPDF(): void {
    const config = this.configurarExportacion();
    this.exportacionService.exportarPDF(config);
    this.dropdownExportAbierto = false;
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  private verDetalle(log: LogEvento): void {
    import('../shared/dialogs/detalle-dialog/detalle-dialog.component').then(
      ({ DetalleDialogComponent }) => {
        const config = LogsConfig.getConfiguracionDetalle(log);
        const dialogRef = this.dialog.open(DetalleDialogComponent, {
          width: '800px',
          disableClose: true,
          data: config,
        });
      }
    );
  }


  private exportarLogIndividual(log: LogEvento): void {
    import('../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component').then(
      ({ ConfirmacionDialogComponent }) => {
        const config = {
          titulo: 'Exportar Log Individual',
          subtitulo: `Log #${log.id} - ${new Date(log.timestamp).toLocaleDateString('es-ES')}`,
          mensaje: `Seleccione el formato de exportación para este log:

Información del log:
• Usuario: ${log.usuario}
• Acción: ${log.accion}
• Módulo: ${log.modulo}
• IP: ${log.ip_origen}
• Descripción: ${log.descripcion.substring(0, 50)}${log.descripcion.length > 50 ? '...' : ''}`,
          mensajeSecundario: 'Excel: Para análisis en hojas de cálculo\nPDF: Para documentación y archivo',
          tipo: 'info' as const,
          textoBotonConfirmar: 'Exportar Excel',
          textoBotonCancelar: 'Exportar PDF'
        };
        
        const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
          width: '500px',
          disableClose: true,
          data: config,
        });

        dialogRef.afterClosed().subscribe((resultado) => {
          if (resultado === true) {
            this.exportarLogExcel(log);
          } else if (resultado === false) {
            this.exportarLogPDF(log);
          }
          // Si es null o undefined, se canceló
        });
      }
    );
  }

  private exportarLogExcel(log: LogEvento): void {
    const config: ConfiguracionExportacion<LogEvento> = {
      entidades: [log],
      nombreArchivo: `log_${log.id}_${new Date(log.timestamp).toISOString().split('T')[0]}`,
      nombreEntidad: 'Log Individual',
      columnas: [
        { campo: 'id', titulo: 'ID', formato: 'numero' },
        { campo: 'timestamp', titulo: 'Fecha/Hora', formato: 'fecha' },
        { campo: 'usuario', titulo: 'Usuario', formato: 'texto' },
        { campo: 'accion', titulo: 'Acción', formato: 'texto' },
        { campo: 'modulo', titulo: 'Módulo', formato: 'texto' },
        { campo: 'ip_origen', titulo: 'IP Origen', formato: 'texto' },
        { campo: 'descripcion', titulo: 'Descripción', formato: 'texto' },
        { campo: 'tabla_afectada', titulo: 'Tabla Afectada', formato: 'texto' },
      ],
      filtrosActivos: {},
      metadatos: {
        cantidadTotal: 1,
        cantidadFiltrada: 1,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
    
    this.exportacionService.exportarExcel(config);
    console.log('✅ Log exportado a Excel:', log);
  }

  private exportarLogPDF(log: LogEvento): void {
    const config: ConfiguracionExportacion<LogEvento> = {
      entidades: [log],
      nombreArchivo: `log_${log.id}_${new Date(log.timestamp).toISOString().split('T')[0]}`,
      nombreEntidad: 'Log Individual',
      columnas: [
        { campo: 'id', titulo: 'ID', formato: 'numero' },
        { campo: 'timestamp', titulo: 'Fecha/Hora', formato: 'fecha' },
        { campo: 'usuario', titulo: 'Usuario', formato: 'texto' },
        { campo: 'accion', titulo: 'Acción', formato: 'texto' },
        { campo: 'modulo', titulo: 'Módulo', formato: 'texto' },
        { campo: 'ip_origen', titulo: 'IP Origen', formato: 'texto' },
        { campo: 'descripcion', titulo: 'Descripción', formato: 'texto' },
        { campo: 'tabla_afectada', titulo: 'Tabla Afectada', formato: 'texto' },
      ],
      filtrosActivos: {},
      metadatos: {
        cantidadTotal: 1,
        cantidadFiltrada: 1,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
    
    this.exportacionService.exportarPDF(config);
    console.log('✅ Log exportado a PDF:', log);
  }

  private configurarExportacion(): ConfiguracionExportacion<LogEvento> {
    return {
      entidades: this.logs,
      nombreArchivo: 'logs',
      nombreEntidad: 'Logs',
      columnas: [
        { campo: 'id', titulo: 'ID', formato: 'numero' },
        { campo: 'timestamp', titulo: 'Fecha/Hora', formato: 'fecha' },
        { campo: 'usuario', titulo: 'Usuario', formato: 'texto' },
        { campo: 'accion', titulo: 'Acción', formato: 'texto' },
        { campo: 'modulo', titulo: 'Módulo', formato: 'texto' },
        { campo: 'ip_origen', titulo: 'IP Origen', formato: 'texto' },
      ],
      filtrosActivos: {},
      metadatos: {
        cantidadTotal: this.logs.length,
        cantidadFiltrada: this.logs.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<LogEvento> {
    return {
      tipoEntidad: 'logs',
      mapeoColumnas: [
        {
          columnaArchivo: 'ID',
          campoEntidad: 'id',
          obligatorio: true,
          tipoEsperado: 'numero',
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
          columnaArchivo: 'Módulo',
          campoEntidad: 'modulo',
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
          columnaArchivo: 'Fecha/Hora',
          campoEntidad: 'timestamp',
          obligatorio: true,
          tipoEsperado: 'fecha',
        },
      ],
      validaciones: [
        {
          campo: 'usuario',
          validador: (valor) => valor && valor.length <= 100,
          mensajeError: 'El usuario debe tener máximo 100 caracteres',
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

  handleAction(event: {action: string, item: any}) {
    switch (event.action) {
      case 'view':
        this.verDetalle(event.item);
        break;
      case 'export':
        this.exportarLogIndividual(event.item);
        break;
      case 'delete':
        this.eliminar(event.item);
        break;
    }
  }

  handleButtonClick(action: string) {
    switch (action) {
      case 'add':
        this.agregar();
        break;
      case 'bulk-upload':
        this.cargaMasiva();
        break;
    }
  }

  handleSort(event: {column: string, direction: 'asc' | 'desc'}) {
    console.log('Ordenar:', event);
  }

  handleFilters(filters: any) {
    console.log('Filtros aplicados:', filters);
    this.tableState = {
      ...this.tableState,
      filteredEmpty: false
    };
  }
}
