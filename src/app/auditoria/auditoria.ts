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
import { CargaMasivaDialogComponent } from '../materiales/carga-masiva-dialog/carga-masiva-dialog.component';

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
    'id_auditoria',
    'entidad',
    'accion',
    'usuario',
    'fecha',
    'campos',
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
  cargando = false;

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
      id: [''],
      entidad: [''],
      accion: [''],
      usuario: [''],
      fecha: [''],
      campos: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.configurarFiltros();
  }

  private cargarDatos(): void {
    this.cargando = true;
    this.hasError = false;

    setTimeout(() => {
      try {
        this.auditorias = [
          {
            id_auditoria: 1,
            tipo_entidad: 'Material',
            id_entidad: 'MAT-001',
            accion: 'CREATE',
            usuario: 'admin@texfina.com',
            fecha_hora: new Date('2024-01-20T10:30:25'),
            campos_modificados: 'nombre, codigo, precio_unitario, id_clase',
            ip_address: '192.168.1.100',
            datos_anteriores: '{}',
            datos_nuevos:
              '{"nombre":"Tela Cotton Premium","codigo":"MAT-001","precio_unitario":45.50,"id_clase":"TEX-001"}',
          },
          {
            id_auditoria: 2,
            tipo_entidad: 'Almacén',
            id_entidad: 'ALM-003',
            accion: 'UPDATE',
            usuario: 'supervisor@texfina.com',
            fecha_hora: new Date('2024-01-20T14:45:12'),
            campos_modificados: 'nombre, ubicacion',
            ip_address: '192.168.1.105',
            datos_anteriores: '{"nombre":"Bodega A","ubicacion":"Sector 1"}',
            datos_nuevos:
              '{"nombre":"Almacén Principal","ubicacion":"Sector Central"}',
          },
          {
            id_auditoria: 3,
            tipo_entidad: 'Usuario',
            id_entidad: 'USR-012',
            accion: 'DELETE',
            usuario: 'admin@texfina.com',
            fecha_hora: new Date('2024-01-20T16:15:40'),
            campos_modificados: 'activo, fecha_eliminacion',
            ip_address: '192.168.1.100',
            datos_anteriores: '{"email":"temp@texfina.com","activo":true}',
            datos_nuevos:
              '{"activo":false,"fecha_eliminacion":"2024-01-20T16:15:40"}',
          },
          {
            id_auditoria: 4,
            tipo_entidad: 'Proveedor',
            id_entidad: 'PRV-007',
            accion: 'UPDATE',
            usuario: 'compras@texfina.com',
            fecha_hora: new Date('2024-01-20T18:20:15'),
            campos_modificados: 'contacto, direccion',
            ip_address: '192.168.1.110',
            datos_anteriores:
              '{"contacto":"Juan Pérez","direccion":"Calle Antigua 123"}',
            datos_nuevos:
              '{"contacto":"María González","direccion":"Avenida Nueva 456"}',
          },
          {
            id_auditoria: 5,
            tipo_entidad: 'Ingreso',
            id_entidad: 'ING-089',
            accion: 'CREATE',
            usuario: 'operario@texfina.com',
            fecha_hora: new Date('2024-01-20T19:30:55'),
            campos_modificados:
              'id_insumo, cantidad, precio_unitario_historico, numero_remision',
            ip_address: '192.168.1.115',
            datos_anteriores: '{}',
            datos_nuevos:
              '{"id_insumo":15,"cantidad":500,"precio_unitario_historico":44.75,"numero_remision":"REM-2024-089"}',
          },
          {
            id_auditoria: 6,
            tipo_entidad: 'Sistema',
            id_entidad: 'SYS-001',
            accion: 'LOGIN',
            usuario: 'admin@texfina.com',
            fecha_hora: new Date('2024-01-21T08:00:00'),
            campos_modificados: 'last_login, ip_ultimo_acceso',
            ip_address: '192.168.1.100',
            datos_anteriores:
              '{"last_login":"2024-01-20T18:00:00","ip_ultimo_acceso":"192.168.1.100"}',
            datos_nuevos:
              '{"last_login":"2024-01-21T08:00:00","ip_ultimo_acceso":"192.168.1.100"}',
          },
          {
            id_auditoria: 7,
            tipo_entidad: 'Consumo',
            id_entidad: 'CON-045',
            accion: 'UPDATE',
            usuario: 'produccion@texfina.com',
            fecha_hora: new Date('2024-01-21T13:45:30'),
            campos_modificados: 'cantidad, estado',
            ip_address: '192.168.1.120',
            datos_anteriores: '{"cantidad":100,"estado":"PENDIENTE"}',
            datos_nuevos: '{"cantidad":125,"estado":"COMPLETADO"}',
          },
          {
            id_auditoria: 8,
            tipo_entidad: 'Lote',
            id_entidad: 'LOT-234',
            accion: 'CREATE',
            usuario: 'jefe.almacen@texfina.com',
            fecha_hora: new Date('2024-01-21T15:30:18'),
            campos_modificados:
              'lote, stock_inicial, fecha_expiracion, precio_total',
            ip_address: '192.168.1.103',
            datos_anteriores: '{}',
            datos_nuevos:
              '{"lote":"L-2024-002","stock_inicial":1000,"fecha_expiracion":"2025-01-21","precio_total":22750.00}',
          },
          {
            id_auditoria: 9,
            tipo_entidad: 'Receta',
            id_entidad: 'REC-015',
            accion: 'UPDATE',
            usuario: 'chef.produccion@texfina.com',
            fecha_hora: new Date('2024-01-21T17:20:45'),
            campos_modificados: 'nombre, proporcion_ingredientes',
            ip_address: '192.168.1.125',
            datos_anteriores:
              '{"nombre":"Mezcla Estándar","proporcion_ingredientes":"50:30:20"}',
            datos_nuevos:
              '{"nombre":"Mezcla Premium","proporcion_ingredientes":"55:25:20"}',
          },
          {
            id_auditoria: 10,
            tipo_entidad: 'Stock',
            id_entidad: 'STK-078',
            accion: 'UPDATE',
            usuario: 'sistema',
            fecha_hora: new Date('2024-01-21T20:00:00'),
            campos_modificados: 'cantidad, fecha_ultima_actualizacion',
            ip_address: '127.0.0.1',
            datos_anteriores:
              '{"cantidad":250,"fecha_ultima_actualizacion":"2024-01-20T20:00:00"}',
            datos_nuevos:
              '{"cantidad":175,"fecha_ultima_actualizacion":"2024-01-21T20:00:00"}',
          },
        ];
        // Mapear alias para binding correcto
        this.auditorias = this.auditorias.map((a) => ({
          ...a,
          entidad: a.tipo_entidad,
          fecha: a.fecha_hora,
          campos: a.campos_modificados,
        }));
        this.dataSource.data = [...this.auditorias];
        this.cargando = false;
      } catch (error) {
        this.hasError = true;
        this.errorMessage = 'Error al cargar los registros de auditoría';
        this.cargando = false;
      }
    }, 1000);
  }

  private configurarFiltros(): void {
    this.filtroGeneralForm
      .get('busquedaGeneral')
      ?.valueChanges.subscribe((valor) => {
        this.aplicarFiltroGeneral(valor || '');
      });
  }

  private aplicarFiltroGeneral(valor: string): void {
    if (!valor.trim()) {
      this.dataSource.data = [...this.auditorias];
      return;
    }

    const filtro = valor.toLowerCase();
    this.dataSource.data = this.auditorias.filter(
      (auditoria) =>
        auditoria.tipo_entidad.toLowerCase().includes(filtro) ||
        auditoria.id_entidad.toLowerCase().includes(filtro) ||
        auditoria.accion.toLowerCase().includes(filtro) ||
        auditoria.usuario.toLowerCase().includes(filtro) ||
        auditoria.campos_modificados.toLowerCase().includes(filtro)
    );
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.patchValue({ busquedaGeneral: '' });
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
  }

  get isEmpty(): boolean {
    return !this.cargando && !this.hasError && this.auditorias.length === 0;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.cargando &&
      !this.hasError &&
      this.auditorias.length > 0 &&
      this.dataSource.data.length === 0
    );
  }

  sortData(column: string): void {
    console.log('Ordenar por:', column);
  }

  reintentarCarga(): void {
    this.cargarDatos();
  }

  formatearCodigo(id?: number): string {
    if (!id) return '000001';
    return id.toString().padStart(6, '0');
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  formatearAccion(accion: string): string {
    const acciones: { [key: string]: string } = {
      CREATE: 'Crear',
      INSERT: 'Insertar',
      UPDATE: 'Actualizar',
      DELETE: 'Eliminar',
      LOGIN: 'Acceso',
      LOGOUT: 'Salida',
    };
    return acciones[accion] || accion;
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleDateString('es-ES');
    } catch {
      return '-';
    }
  }

  formatearHora(fecha?: Date): string {
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

  formatearCampos(campos?: string): string {
    if (!campos) return '-';
    return campos.length > 30 ? `${campos.substring(0, 30)}...` : campos;
  }

  getAccionBadgeClass(accion: string): string {
    const clases: { [key: string]: string } = {
      CREATE: 'badge-create',
      INSERT: 'badge-insert',
      UPDATE: 'badge-update',
      DELETE: 'badge-delete',
      LOGIN: 'badge-login',
      LOGOUT: 'badge-logout',
    };
    return clases[accion] || 'badge-neutral';
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

  agregar(): void {
    import(
      '../shared/dialogs/formulario-dialog/formulario-dialog.component'
    ).then(({ FormularioDialogComponent }) => {
      import('../shared/configs/auditoria-config').then(
        ({ AuditoriaConfig }) => {
          const dialogRef = this.dialog.open(FormularioDialogComponent, {
            width: '600px',
            disableClose: true,
            data: {
              configuracion: AuditoriaConfig.getConfiguracionFormulario(false),
            },
          });

          dialogRef.afterClosed().subscribe((resultado) => {
            if (resultado) {
              console.log('Generando registro de auditoría:', resultado);
              this.cargarDatos();
            }
          });
        }
      );
    });
  }

  verDetalle(auditoria: Auditoria): void {
    import('../shared/dialogs/detalle-dialog/detalle-dialog.component').then(
      ({ DetalleDialogComponent }) => {
        import('../shared/configs/auditoria-config').then(
          ({ AuditoriaConfig }) => {
            const dialogRef = this.dialog.open(DetalleDialogComponent, {
              width: '800px',
              disableClose: true,
              data: {
                configuracion:
                  AuditoriaConfig.getConfiguracionDetalle(auditoria),
              },
            });
          }
        );
      }
    );
  }

  compararCambios(auditoria: Auditoria): void {
    console.log('Comparar cambios para:', auditoria);
    alert(
      `Comparando cambios para ${auditoria.tipo_entidad} ${auditoria.id_entidad}:\n\nAntes: ${auditoria.datos_anteriores}\n\nDespués: ${auditoria.datos_nuevos}`
    );
  }

  eliminar(auditoria: Auditoria): void {
    const confirmacion = confirm(
      `¿Está seguro que desea eliminar el registro de auditoría #${this.formatearCodigo(
        auditoria.id_auditoria
      )}?`
    );
    if (confirmacion) {
      console.log('Eliminar auditoría:', auditoria);
      this.cargarDatos();
    }
  }

  private configurarExportacion(): ConfiguracionExportacion<Auditoria> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'auditoria_sistema',
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
        { campo: 'ip_address', titulo: 'IP Address', formato: 'texto' },
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
      tipoEntidad: 'auditoria_sistema',
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
          campo: 'accion',
          validador: (valor) =>
            ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'].includes(valor),
          mensajeError:
            'La acción debe ser: CREATE, UPDATE, DELETE, LOGIN o LOGOUT',
        },
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
