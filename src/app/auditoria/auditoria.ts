import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
} from '../services/carga-masiva.service';

interface Auditoria {
  id_auditoria?: number;
  tipo_entidad: string;
  id_entidad: string;
  accion: string;
  usuario: string;
  fecha_hora: Date;
  campos_modificados: string;
  ip_address: string;
  datos_anteriores?: string;
  datos_nuevos?: string;
}

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatTooltipModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
})
export class AuditoriaComponent implements OnInit {
  displayedColumns: string[] = [
    'entidad',
    'accion',
    'usuario',
    'fecha',
    'campos',
    'ip',
    'acciones',
  ];
  dataSource = new MatTableDataSource<Auditoria>();
  auditorias: Auditoria[] = [];
  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosColumnaHabilitados = true;
  dropdownExportAbierto = false;
  hasError = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {
    this.filtroGeneralForm = this.fb.group({
      busquedaGeneral: [''],
    });

    this.filtrosColumnaForm = this.fb.group({
      entidad: [''],
      accion: [''],
      usuario: [''],
      fecha: [''],
      campos: [''],
      ip: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.configurarFiltros();
  }

  private cargarDatos(): void {
    this.auditorias = [
      {
        id_auditoria: 1,
        tipo_entidad: 'Materiales',
        id_entidad: 'MAT001',
        accion: 'CREATE',
        usuario: 'admin@texfina.com',
        fecha_hora: new Date('2024-01-15T10:30:00'),
        campos_modificados: 'nombre, precio, categoria, stock_minimo',
        ip_address: '192.168.1.100',
        datos_anteriores: '{}',
        datos_nuevos:
          '{"nombre":"Tela Cotton","precio":25.50,"categoria":"Textiles","stock_minimo":10}',
      },
      {
        id_auditoria: 2,
        tipo_entidad: 'Almacenes',
        id_entidad: 'ALM003',
        accion: 'UPDATE',
        usuario: 'supervisor@texfina.com',
        fecha_hora: new Date('2024-01-15T14:45:00'),
        campos_modificados: 'ubicacion, capacidad_maxima',
        ip_address: '192.168.1.105',
        datos_anteriores: '{"ubicacion":"Bodega A","capacidad_maxima":1000}',
        datos_nuevos:
          '{"ubicacion":"Bodega Principal","capacidad_maxima":1500}',
      },
      {
        id_auditoria: 3,
        tipo_entidad: 'Usuarios',
        id_entidad: 'USR012',
        accion: 'DELETE',
        usuario: 'admin@texfina.com',
        fecha_hora: new Date('2024-01-16T09:15:00'),
        campos_modificados: 'estado, fecha_eliminacion',
        ip_address: '192.168.1.100',
        datos_anteriores: '{"email":"temp@texfina.com","estado":"ACTIVO"}',
        datos_nuevos:
          '{"estado":"ELIMINADO","fecha_eliminacion":"2024-01-16T09:15:00"}',
      },
      {
        id_auditoria: 4,
        tipo_entidad: 'Proveedores',
        id_entidad: 'PRV007',
        accion: 'UPDATE',
        usuario: 'compras@texfina.com',
        fecha_hora: new Date('2024-01-16T11:20:00'),
        campos_modificados: 'telefono, direccion',
        ip_address: '192.168.1.110',
        datos_anteriores:
          '{"telefono":"555-1234","direccion":"Calle Antigua 123"}',
        datos_nuevos: '{"telefono":"555-9876","direccion":"Avenida Nueva 456"}',
      },
      {
        id_auditoria: 5,
        tipo_entidad: 'Ingresos',
        id_entidad: 'ING089',
        accion: 'CREATE',
        usuario: 'operario@texfina.com',
        fecha_hora: new Date('2024-01-16T16:30:00'),
        campos_modificados:
          'material_id, cantidad, precio_unitario, proveedor_id',
        ip_address: '192.168.1.115',
        datos_anteriores: '{}',
        datos_nuevos:
          '{"material_id":"MAT001","cantidad":500,"precio_unitario":24.75,"proveedor_id":"PRV007"}',
      },
      {
        id_auditoria: 6,
        tipo_entidad: 'Sistema',
        id_entidad: 'SYS001',
        accion: 'LOGIN',
        usuario: 'admin@texfina.com',
        fecha_hora: new Date('2024-01-17T08:00:00'),
        campos_modificados: 'ultimo_acceso, ip_ultimo_acceso',
        ip_address: '192.168.1.100',
        datos_anteriores:
          '{"ultimo_acceso":"2024-01-16T18:00:00","ip_ultimo_acceso":"192.168.1.100"}',
        datos_nuevos:
          '{"ultimo_acceso":"2024-01-17T08:00:00","ip_ultimo_acceso":"192.168.1.100"}',
      },
      {
        id_auditoria: 7,
        tipo_entidad: 'Consumos',
        id_entidad: 'CON045',
        accion: 'UPDATE',
        usuario: 'produccion@texfina.com',
        fecha_hora: new Date('2024-01-17T13:45:00'),
        campos_modificados: 'cantidad_consumida, observaciones',
        ip_address: '192.168.1.120',
        datos_anteriores:
          '{"cantidad_consumida":100,"observaciones":"Consumo normal"}',
        datos_nuevos:
          '{"cantidad_consumida":125,"observaciones":"Consumo aumentado por producción extra"}',
      },
      {
        id_auditoria: 8,
        tipo_entidad: 'Sistema',
        id_entidad: 'SYS002',
        accion: 'LOGOUT',
        usuario: 'supervisor@texfina.com',
        fecha_hora: new Date('2024-01-17T17:30:00'),
        campos_modificados: 'sesion_finalizada, duracion_sesion',
        ip_address: '192.168.1.105',
        datos_anteriores:
          '{"sesion_activa":true,"inicio_sesion":"2024-01-17T08:30:00"}',
        datos_nuevos: '{"sesion_activa":false,"duracion_sesion":"9h 0m"}',
      },
    ];

    this.dataSource.data = this.auditorias;
  }

  private configurarFiltros(): void {
    this.filtroGeneralForm
      .get('busquedaGeneral')
      ?.valueChanges.subscribe((valor) => {
        this.aplicarFiltroGeneral(valor);
      });

    this.filtrosColumnaForm.valueChanges.subscribe(() => {
      this.aplicarFiltrosColumna();
    });
  }

  private aplicarFiltroGeneral(valor: string): void {
    if (!valor || valor.trim() === '') {
      this.dataSource.data = this.auditorias;
      return;
    }

    const filtro = valor.toLowerCase().trim();
    this.dataSource.data = this.auditorias.filter(
      (auditoria) =>
        auditoria.tipo_entidad.toLowerCase().includes(filtro) ||
        auditoria.id_entidad.toLowerCase().includes(filtro) ||
        auditoria.accion.toLowerCase().includes(filtro) ||
        auditoria.usuario.toLowerCase().includes(filtro) ||
        auditoria.campos_modificados.toLowerCase().includes(filtro) ||
        auditoria.ip_address.toLowerCase().includes(filtro)
    );
  }

  private aplicarFiltrosColumna(): void {
    const filtros = this.filtrosColumnaForm.value;
    let datosFiltrados = this.auditorias;

    Object.keys(filtros).forEach((key) => {
      const valor = filtros[key];
      if (valor && valor.trim() !== '') {
        const filtroLower = valor.toLowerCase().trim();
        datosFiltrados = datosFiltrados.filter((auditoria) => {
          switch (key) {
            case 'entidad':
              return (
                auditoria.tipo_entidad.toLowerCase().includes(filtroLower) ||
                auditoria.id_entidad.toLowerCase().includes(filtroLower)
              );
            case 'accion':
              return auditoria.accion.toLowerCase().includes(filtroLower);
            case 'usuario':
              return auditoria.usuario.toLowerCase().includes(filtroLower);
            case 'fecha':
              return this.formatearFecha(auditoria.fecha_hora).includes(
                filtroLower
              );
            case 'campos':
              return auditoria.campos_modificados
                .toLowerCase()
                .includes(filtroLower);
            case 'ip':
              return auditoria.ip_address.toLowerCase().includes(filtroLower);
            default:
              return true;
          }
        });
      }
    });

    this.dataSource.data = datosFiltrados;
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.patchValue({ busquedaGeneral: '' });
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
  }

  get isEmpty(): boolean {
    return this.auditorias.length === 0;
  }

  get isFilteredEmpty(): boolean {
    return this.auditorias.length > 0 && this.dataSource.data.length === 0;
  }

  sortData(column: string): void {
    const data = this.dataSource.data.slice();
    const isAsc = this.dataSource.sort?.direction === 'asc';

    this.dataSource.data = data.sort((a, b) => {
      switch (column) {
        case 'entidad':
          return this.compare(a.tipo_entidad, b.tipo_entidad, isAsc);
        case 'accion':
          return this.compare(a.accion, b.accion, isAsc);
        case 'usuario':
          return this.compare(a.usuario, b.usuario, isAsc);
        case 'fecha':
          return this.compare(
            a.fecha_hora.getTime(),
            b.fecha_hora.getTime(),
            isAsc
          );
        case 'campos':
          return this.compare(
            a.campos_modificados,
            b.campos_modificados,
            isAsc
          );
        case 'ip':
          return this.compare(a.ip_address, b.ip_address, isAsc);
        default:
          return 0;
      }
    });
  }

  private compare(
    a: string | number,
    b: string | number,
    isAsc: boolean
  ): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  reintentarCarga(): void {
    this.hasError = false;
    this.cargarDatos();
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '-';
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  formatearHora(fecha?: Date): string {
    if (!fecha) return '-';
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  formatearCampos(campos?: string): string {
    if (!campos || campos.trim() === '') return '-';

    const camposArray = campos.split(',').map((c) => c.trim());
    if (camposArray.length <= 3) {
      return campos;
    }

    return `${camposArray.slice(0, 3).join(', ')} (+${
      camposArray.length - 3
    } más)`;
  }

  getAccionBadgeClass(accion: string): string {
    switch (accion.toUpperCase()) {
      case 'CREATE':
        return 'badge-create';
      case 'UPDATE':
        return 'badge-update';
      case 'DELETE':
        return 'badge-delete';
      case 'LOGIN':
        return 'badge-login';
      case 'LOGOUT':
        return 'badge-logout';
      default:
        return 'badge-texfina badge-neutral';
    }
  }

  private obtenerFiltrosActivos(): any {
    const filtroGeneral = this.filtroGeneralForm.get('busquedaGeneral')?.value;
    const filtrosColumna = this.filtrosColumnaForm.value;

    return {
      busquedaGeneral: filtroGeneral || '',
      filtrosColumna: Object.keys(filtrosColumna)
        .filter(
          (key) => filtrosColumna[key] && filtrosColumna[key].trim() !== ''
        )
        .reduce((obj, key) => {
          obj[key] = filtrosColumna[key];
          return obj;
        }, {} as any),
    };
  }

  private configurarExportacion(): ConfiguracionExportacion<Auditoria> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'auditoria-sistema',
      nombreEntidad: 'Auditoría del Sistema',
      columnas: [
        { campo: 'id_auditoria', titulo: 'ID', formato: 'numero' },
        { campo: 'tipo_entidad', titulo: 'Tipo Entidad', formato: 'texto' },
        { campo: 'id_entidad', titulo: 'ID Entidad', formato: 'texto' },
        { campo: 'accion', titulo: 'Acción', formato: 'texto' },
        { campo: 'usuario', titulo: 'Usuario', formato: 'texto' },
        { campo: 'fecha_hora', titulo: 'Fecha/Hora', formato: 'fecha' },
        {
          campo: 'campos_modificados',
          titulo: 'Campos Modificados',
          formato: 'texto',
        },
        { campo: 'ip_address', titulo: 'Dirección IP', formato: 'texto' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.auditorias.length,
        cantidadFiltrada: this.dataSource.data.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Auditoria> {
    return {
      tipoEntidad: 'auditoria',
      mapeoColumnas: [
        {
          columnaArchivo: 'Tipo Entidad',
          campoEntidad: 'tipo_entidad',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'ID Entidad',
          campoEntidad: 'id_entidad',
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
          columnaArchivo: 'Usuario',
          campoEntidad: 'usuario',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Campos Modificados',
          campoEntidad: 'campos_modificados',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'IP Address',
          campoEntidad: 'ip_address',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'tipo_entidad',
          validador: (valor) => valor && valor.length <= 100,
          mensajeError: 'El tipo de entidad debe tener máximo 100 caracteres',
        },
        {
          campo: 'accion',
          validador: (valor) =>
            ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'].includes(
              valor?.toUpperCase()
            ),
          mensajeError:
            'La acción debe ser: CREATE, UPDATE, DELETE, LOGIN o LOGOUT',
        },
      ],
    };
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

  cargaMasiva(): void {
    console.log('Abriendo diálogo de carga masiva para auditoría');
  }

  agregar(): void {
    console.log('Generando nueva auditoría automática del sistema');
    const nuevaAuditoria: Auditoria = {
      id_auditoria: this.auditorias.length + 1,
      tipo_entidad: 'Sistema',
      id_entidad: `SYS${String(this.auditorias.length + 1).padStart(3, '0')}`,
      accion: 'CREATE',
      usuario: 'sistema@texfina.com',
      fecha_hora: new Date(),
      campos_modificados: 'auditoria_generada, tipo_evento',
      ip_address: '127.0.0.1',
      datos_anteriores: '{}',
      datos_nuevos:
        '{"evento":"Auditoría generada manualmente","timestamp":"' +
        new Date().toISOString() +
        '"}',
    };

    this.auditorias.unshift(nuevaAuditoria);
    this.dataSource.data = this.auditorias;
  }

  verDetalle(auditoria: Auditoria): void {
    console.log('Ver detalle de auditoría:', auditoria);
  }

  compararCambios(auditoria: Auditoria): void {
    console.log('Comparar cambios de auditoría:', auditoria);
    console.log('Datos anteriores:', auditoria.datos_anteriores);
    console.log('Datos nuevos:', auditoria.datos_nuevos);
  }

  eliminar(auditoria: Auditoria): void {
    const confirmacion = confirm(
      `¿Está seguro que desea eliminar el registro de auditoría ${auditoria.id_auditoria}?`
    );
    if (confirmacion && auditoria.id_auditoria) {
      this.auditorias = this.auditorias.filter(
        (a) => a.id_auditoria !== auditoria.id_auditoria
      );
      this.dataSource.data = this.auditorias;
    }
  }
}
