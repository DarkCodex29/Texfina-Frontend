import { Component, OnInit } from '@angular/core';
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
import { AuditoriaConfig } from '../shared/configs/auditoria-config';

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
    PrimeDataTableComponent,
  ],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
})
export class AuditoriaComponent implements OnInit {
  tableColumns: TableColumn[] = AuditoriaConfig.getTableColumns();
  tableActions: TableAction[] = AuditoriaConfig.getTableActions();
  tableButtons: TableButtonConfig[] = AuditoriaConfig.getTableButtons();
  
  tableState: TableState = {
    loading: false,
    error: false,
    empty: false,
    filteredEmpty: false
  };

  auditorias: Auditoria[] = [];
  dropdownExportAbierto = false;

  constructor(
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.tableState = { ...this.tableState, loading: true, error: false };

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
        
        this.tableState = { 
          ...this.tableState, 
          loading: false, 
          empty: this.auditorias.length === 0,
          filteredEmpty: false
        };
      } catch (error) {
        this.tableState = { ...this.tableState, loading: false, error: true };
      }
    }, 1000);
  }

  reintentarCarga(): void {
    this.cargarDatos();
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

  private agregar(): void {
    import(
      '../shared/dialogs/formulario-dialog/formulario-dialog.component'
    ).then(({ FormularioDialogComponent }) => {
      const config = AuditoriaConfig.getConfiguracionFormulario(false);
      const dialogRef = this.dialog.open(FormularioDialogComponent, {
        width: '600px',
        disableClose: true,
        data: config,
      });

      dialogRef.afterClosed().subscribe((resultado) => {
        if (resultado?.accion === 'guardar') {
          console.log('Generando registro de auditoría:', resultado.datos);
          this.cargarDatos();
        }
      });
    });
  }

  private verDetalle(auditoria: Auditoria): void {
    import('../shared/dialogs/detalle-dialog/detalle-dialog.component').then(
      ({ DetalleDialogComponent }) => {
        const config = AuditoriaConfig.getConfiguracionDetalle(auditoria);
        const dialogRef = this.dialog.open(DetalleDialogComponent, {
          width: '800px',
          disableClose: true,
          data: config,
        });
      }
    );
  }

  private compararCambios(auditoria: Auditoria): void {
    import('../shared/dialogs/detalle-dialog/detalle-dialog.component').then(
      ({ DetalleDialogComponent }) => {
        let datosAnteriores: any = {};
        let datosNuevos: any = {};
        
        try {
          datosAnteriores = auditoria.datos_anteriores ? JSON.parse(auditoria.datos_anteriores) : {};
          datosNuevos = auditoria.datos_nuevos ? JSON.parse(auditoria.datos_nuevos) : {};
        } catch (e) {
          console.error('Error al parsear datos:', e);
        }

        // Crear las filas de comparación
        const filas: any[] = [
          [
            { key: 'accion', label: 'Acción', tipo: 'text' },
            { key: 'usuario', label: 'Usuario', tipo: 'text' }
          ],
          [
            { key: 'fecha_hora', label: 'Fecha/Hora', tipo: 'date' },
            { key: 'ip_address', label: 'IP Address', tipo: 'text' }
          ]
        ];

        // Agregar campos modificados
        const camposModificados = auditoria.campos_modificados?.split(',').map(c => c.trim()) || [];
        
        camposModificados.forEach(campo => {
          filas.push([
            {
              key: campo + '_anterior',
              label: `${this.formatearNombreCampo(campo)} (Anterior)`,
              tipo: 'text'
            },
            {
              key: campo + '_nuevo',
              label: `${this.formatearNombreCampo(campo)} (Nuevo)`,
              tipo: 'text'
            }
          ]);
        });

        // Preparar los datos combinados
        const datosCombinados: any = {
          accion: auditoria.accion,
          usuario: auditoria.usuario,
          fecha_hora: auditoria.fecha_hora,
          ip_address: auditoria.ip_address
        };

        // Agregar los valores anteriores y nuevos
        camposModificados.forEach(campo => {
          datosCombinados[campo + '_anterior'] = datosAnteriores[campo] || 'Sin valor';
          datosCombinados[campo + '_nuevo'] = datosNuevos[campo] || 'Sin valor';
        });

        const config = {
          entidad: 'Comparación de Cambios',
          entidadArticulo: `${auditoria.tipo_entidad} - ${auditoria.id_entidad}`,
          filas: filas,
          datos: datosCombinados
        };

        this.dialog.open(DetalleDialogComponent, {
          width: '800px',
          disableClose: true,
          data: config
        });
      }
    );
  }
  
  private formatearNombreCampo(campo: string): string {
    return campo
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private eliminar(auditoria: Auditoria): void {
    import('../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component').then(
      ({ ConfirmacionDialogComponent }) => {
        const config = AuditoriaConfig.eliminarAuditoria(auditoria);
        const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
          width: '400px',
          disableClose: true,
          data: config,
        });

        dialogRef.afterClosed().subscribe((confirmed) => {
          if (confirmed) {
            console.log('Eliminar auditoría:', auditoria);
            this.cargarDatos();
          }
        });
      }
    );
  }

  private configurarExportacion(): ConfiguracionExportacion<Auditoria> {
    return {
      entidades: this.auditorias,
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
      filtrosActivos: {},
      metadatos: {
        cantidadTotal: this.auditorias.length,
        cantidadFiltrada: this.auditorias.length,
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


  handleAction(event: {action: string, item: any}) {
    switch (event.action) {
      case 'view':
        this.verDetalle(event.item);
        break;
      case 'compare':
        this.compararCambios(event.item);
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
