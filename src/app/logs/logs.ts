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
import { PrimeDataTableComponent, TableColumn, TableAction, TableState } from '../shared/components/prime-data-table/prime-data-table.component';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
} from '../services/carga-masiva.service';
import { CargaMasivaDialogComponent } from '../materiales/carga-masiva-dialog/carga-masiva-dialog.component';
import { DetalleDialogComponent } from '../shared/dialogs/detalle-dialog/detalle-dialog.component';
import { ConfirmacionDialogComponent } from '../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component';

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
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
    PrimeDataTableComponent,
  ],
  templateUrl: './logs.html',
  styleUrl: './logs.scss',
})
export class LogsComponent implements OnInit {
  // Configuración del DataTable
  tableColumns: TableColumn[] = [
    {
      key: 'id',
      title: 'ID',
      type: 'badge',
      sortable: true,
      filterable: true,
      width: '90px',
      icon: 'pi pi-hashtag'
    },
    {
      key: 'timestamp',
      title: 'Fecha/Hora',
      type: 'date',
      sortable: true,
      filterable: true,
      width: '160px',
      icon: 'pi pi-calendar-clock'
    },
    {
      key: 'usuario',
      title: 'Usuario',
      type: 'user',
      sortable: true,
      filterable: true,
      width: '220px',
      icon: 'pi pi-user'
    },
    {
      key: 'accion',
      title: 'Acción',
      type: 'action',
      sortable: true,
      filterable: true,
      width: '180px',
      icon: 'pi pi-bolt'
    },
    {
      key: 'modulo',
      title: 'Módulo',
      type: 'module',
      sortable: true,
      filterable: true,
      width: '140px',
      icon: 'pi pi-building'
    },
    {
      key: 'ip_origen',
      title: 'IP Origen',
      type: 'ip',
      sortable: true,
      filterable: true,
      width: '130px',
      icon: 'pi pi-server'
    },
    {
      key: 'descripcion',
      title: 'Descripción',
      type: 'description',
      sortable: false,
      filterable: true,
      width: '300px',
      icon: 'pi pi-info-circle'
    }
  ];

  tableActions: TableAction[] = [
    {
      icon: 'pi pi-eye',
      tooltip: 'Ver detalle del log',
      action: 'view',
      color: 'primary'
    },
    {
      icon: 'pi pi-file-export',
      tooltip: 'Exportar log',
      action: 'export',
      color: 'secondary'
    },
    {
      icon: 'pi pi-trash',
      tooltip: 'Eliminar log',
      action: 'delete',
      color: 'danger'
    }
  ];

  tableState: TableState = {
    loading: false,
    error: false,
    empty: false,
    filteredEmpty: false
  };

  // Propiedades existentes
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
    this.tableState = { ...this.tableState, loading: true, error: false };
    this.cargando = true;
    this.error = null;
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
    this.dataSource.data = [...this.logs];
    this.tableState = { 
      ...this.tableState, 
      loading: false, 
      empty: this.logs.length === 0,
      filteredEmpty: false
    };
    this.cargando = false;
  }

  aplicarFiltroGeneral(): void {
    const valor =
      this.filtroGeneralForm.get('busquedaGeneral')?.value?.toLowerCase() || '';
    this.dataSource.data = this.logs.filter((log) => {
      return (
        log.usuario?.toLowerCase().includes(valor) ||
        log.accion?.toLowerCase().includes(valor) ||
        log.descripcion?.toLowerCase().includes(valor) ||
        log.modulo?.toLowerCase().includes(valor) ||
        log.ip_origen?.toLowerCase().includes(valor)
      );
    });
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.reset({ busquedaGeneral: '' });
    this.aplicarFiltroGeneral();
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset({
      id: '',
      timestamp: '',
      usuario: '',
      accion: '',
      modulo: '',
      ip_origen: '',
    });
    this.dataSource.data = [...this.logs];
  }

  eliminar(log: LogEvento): void {
    // Conectar con modal de confirmación existente
    this.dialog.open(ConfirmacionDialogComponent, {
      width: '400px',
      data: {
        titulo: 'Confirmar Eliminación',
        mensaje: `¿Estás seguro de que deseas eliminar el log #${log.id}?`,
        textoBotonConfirmar: 'Eliminar',
        textoBotonCancelar: 'Cancelar'
      }
    }).afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.logs = this.logs.filter((l) => l.id !== log.id);
        this.dataSource.data = [...this.logs];
        // Actualizar estado de la tabla
        this.tableState = {
          ...this.tableState,
          empty: this.logs.length === 0
        };
      }
    });
  }

  sortData(sort: Sort | string): void {
    if (typeof sort === 'string') {
      this.dataSource.data = [...this.dataSource.data].sort((a, b) => {
        const aValue = a[sort];
        const bValue = b[sort];
        if (aValue === undefined || bValue === undefined) return 0;
        if (aValue < bValue) return -1;
        if (aValue > bValue) return 1;
        return 0;
      });
    }
  }

  reintentarCarga(): void {
    this.cargarDatos();
  }

  agregar(): void {
    // Aquí iría la lógica para agregar un nuevo log
  }

  cargaMasiva(): void {
    this.dialog.open(CargaMasivaDialogComponent, {
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

  verDetalle(log: LogEvento): void {
    // Conectar con modal de detalle existente
    this.dialog.open(DetalleDialogComponent, {
      width: '800px',
      data: {
        entidad: log,
        titulo: 'Detalle del Log',
        campos: [
          { label: 'ID', valor: log.id },
          { label: 'Usuario', valor: log.usuario },
          { label: 'Acción', valor: log.accion },
          { label: 'Descripción', valor: log.descripcion },
          { label: 'Módulo', valor: log.modulo },
          { label: 'IP Origen', valor: log.ip_origen },
          { label: 'Tabla Afectada', valor: log.tabla_afectada },
          { label: 'Fecha/Hora', valor: log.timestamp }
        ]
      }
    });
  }


  formatearCodigo(id?: number): string {
    if (!id) return '00001';
    return id.toString().padStart(5, '0');
  }

  formatearTexto(texto?: string): string {
    if (typeof texto === 'string' && texto.trim().length > 0) {
      return texto;
    }
    return '—';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  formatearHora(fecha: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  private configurarExportacion(): ConfiguracionExportacion<LogEvento> {
    return {
      entidades: this.dataSource.data,
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

  private descargarPlantillaCargaMasiva(): void {}

  private procesarArchivoCargaMasiva(archivo: File): void {}

  private obtenerFiltrosActivos(): any {
    return {};
  }

  exportarLogIndividual(log: LogEvento): void {
    console.log('Exportar log individual:', log);
    // Aquí iría la lógica para exportar un log específico
  }

  // Métodos para el DataTable
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

  handleSort(event: {column: string, direction: 'asc' | 'desc'}) {
    console.log('Ordenar:', event);
    this.sortData(event.column);
  }

  handleFilters(filters: any) {
    console.log('Filtros aplicados:', filters);
    // Los filtros ya se aplican automáticamente en el DataTable
    this.tableState = {
      ...this.tableState,
      filteredEmpty: this.dataSource.data.length === 0 && this.logs.length > 0
    };
  }
}
