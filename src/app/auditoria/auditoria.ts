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

interface RegistroAuditoria {
  id_auditoria: number;
  usuario: string;
  accion: 'CREATE' | 'UPDATE' | 'DELETE';
  tabla: string;
  registro_id: string;
  fecha: Date;
  detalles?: string;
}

@Component({
  selector: 'app-auditoria',
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
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
})
export class AuditoriaComponent implements OnInit {
  displayedColumns: string[] = [
    'id_auditoria',
    'usuario',
    'accion',
    'tabla',
    'registro_id',
    'fecha',
    'acciones',
  ];

  dataSource = new MatTableDataSource<RegistroAuditoria>([]);
  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosColumnaHabilitados = false;
  dropdownExportAbierto = false;

  registros: RegistroAuditoria[] = [];
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
    return !this.cargando && !this.error && this.registros.length === 0;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.cargando &&
      !this.error &&
      this.registros.length > 0 &&
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
      idAuditoria: [''],
      usuario: [''],
      accion: [''],
      tabla: [''],
      registroId: [''],
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
        this.registros = [
          {
            id_auditoria: 1,
            usuario: 'admin@texfina.com',
            accion: 'CREATE',
            tabla: 'almacenes',
            registro_id: '1',
            fecha: new Date('2024-01-15T10:30:00'),
            detalles: 'Creación de nuevo almacén principal',
          },
          {
            id_auditoria: 2,
            usuario: 'operador@texfina.com',
            accion: 'UPDATE',
            tabla: 'materiales',
            registro_id: '25',
            fecha: new Date('2024-01-15T11:45:00'),
            detalles: 'Actualización de stock de material',
          },
          {
            id_auditoria: 3,
            usuario: 'supervisor@texfina.com',
            accion: 'DELETE',
            tabla: 'usuarios',
            registro_id: '12',
            fecha: new Date('2024-01-15T14:20:00'),
            detalles: 'Eliminación de usuario inactivo',
          },
          {
            id_auditoria: 4,
            usuario: 'admin@texfina.com',
            accion: 'CREATE',
            tabla: 'proveedores',
            registro_id: '8',
            fecha: new Date('2024-01-16T09:15:00'),
            detalles: 'Registro de nuevo proveedor',
          },
          {
            id_auditoria: 5,
            usuario: 'operador@texfina.com',
            accion: 'UPDATE',
            tabla: 'lotes',
            registro_id: '45',
            fecha: new Date('2024-01-16T16:30:00'),
            detalles: 'Actualización de fecha de vencimiento',
          },
        ];

        this.dataSource.data = [...this.registros];
        this.cargando = false;
      } catch (error) {
        this.error = 'Error al cargar los registros de auditoría';
        this.cargando = false;
      }
    }, 1000);
  }

  aplicarFiltroGeneral(): void {
    const filtro =
      this.filtroGeneralForm.get('busquedaGeneral')?.value?.toLowerCase() || '';

    if (!filtro.trim()) {
      this.dataSource.data = [...this.registros];
      return;
    }

    this.dataSource.data = this.registros.filter(
      (registro) =>
        registro.id_auditoria.toString().includes(filtro) ||
        registro.usuario.toLowerCase().includes(filtro) ||
        registro.accion.toLowerCase().includes(filtro) ||
        registro.tabla.toLowerCase().includes(filtro) ||
        registro.registro_id.toLowerCase().includes(filtro)
    );
  }

  aplicarFiltrosColumna(): void {
    const filtros = this.filtrosColumnaForm.value;
    let datosFiltrados = [...this.registros];

    if (filtros.idAuditoria) {
      datosFiltrados = datosFiltrados.filter((registro) =>
        registro.id_auditoria.toString().includes(filtros.idAuditoria)
      );
    }

    if (filtros.usuario) {
      datosFiltrados = datosFiltrados.filter((registro) =>
        registro.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())
      );
    }

    if (filtros.accion) {
      datosFiltrados = datosFiltrados.filter(
        (registro) => registro.accion === filtros.accion
      );
    }

    if (filtros.tabla) {
      datosFiltrados = datosFiltrados.filter((registro) =>
        registro.tabla.toLowerCase().includes(filtros.tabla.toLowerCase())
      );
    }

    if (filtros.registroId) {
      datosFiltrados = datosFiltrados.filter((registro) =>
        registro.registro_id.includes(filtros.registroId)
      );
    }

    this.dataSource.data = datosFiltrados;
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.get('busquedaGeneral')?.setValue('');
    this.dataSource.data = [...this.registros];
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
    this.aplicarFiltroGeneral();
  }

  sortData(sort: Sort | string): void {
    const sortField = typeof sort === 'string' ? sort : sort.active;
    const sortDirection = typeof sort === 'string' ? 'asc' : sort.direction;

    if (!sortDirection) {
      this.dataSource.data = [...this.registros];
      return;
    }

    this.dataSource.data = this.dataSource.data.sort((a, b) => {
      const isAsc = sortDirection === 'asc';

      switch (sortField) {
        case 'id_auditoria':
          return this.compare(a.id_auditoria, b.id_auditoria, isAsc);
        case 'usuario':
          return this.compare(a.usuario, b.usuario, isAsc);
        case 'accion':
          return this.compare(a.accion, b.accion, isAsc);
        case 'tabla':
          return this.compare(a.tabla, b.tabla, isAsc);
        case 'registro_id':
          return this.compare(a.registro_id, b.registro_id, isAsc);
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

  verDetalle(registro: RegistroAuditoria): void {
    console.log('Ver detalle de registro de auditoría:', registro);
  }

  formatearCodigo(id?: number): string {
    if (!id) return '00001';
    return id.toString().padStart(5, '0');
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  formatearAccion(accion: string): string {
    const acciones: { [key: string]: string } = {
      CREATE: 'Crear',
      UPDATE: 'Actualizar',
      DELETE: 'Eliminar',
    };
    return acciones[accion] || accion;
  }

  obtenerClaseAccion(accion: string): string {
    const clases: { [key: string]: string } = {
      CREATE: 'badge-success',
      UPDATE: 'badge-warning',
      DELETE: 'badge-danger',
    };
    return clases[accion] || 'badge-neutral';
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

  private configurarExportacion(): ConfiguracionExportacion<RegistroAuditoria> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'auditoria',
      nombreEntidad: 'Registros de Auditoría',
      columnas: [
        { campo: 'id_auditoria', titulo: 'ID', formato: 'numero' },
        { campo: 'usuario', titulo: 'Usuario', formato: 'texto' },
        { campo: 'accion', titulo: 'Acción', formato: 'texto' },
        { campo: 'tabla', titulo: 'Tabla', formato: 'texto' },
        { campo: 'registro_id', titulo: 'Registro ID', formato: 'texto' },
        { campo: 'fecha', titulo: 'Fecha', formato: 'fecha' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.registros.length,
        cantidadFiltrada: this.dataSource.data.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<RegistroAuditoria> {
    return {
      tipoEntidad: 'auditoria',
      mapeoColumnas: [
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
          columnaArchivo: 'Tabla',
          campoEntidad: 'tabla',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Registro ID',
          campoEntidad: 'registro_id',
          obligatorio: true,
          tipoEsperado: 'texto',
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

  private obtenerFiltrosActivos(): any {
    const filtroGeneral = this.filtroGeneralForm.get('busquedaGeneral')?.value;
    const filtrosColumna = this.filtrosColumnaForm.value;

    return {
      busquedaGeneral: filtroGeneral || '',
      ...filtrosColumna,
    };
  }
}
