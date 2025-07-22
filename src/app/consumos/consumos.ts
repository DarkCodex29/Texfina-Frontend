import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, finalize, delay } from 'rxjs';

import { Consumo } from '../models/consumo.model';
import { Insumo, Lote } from '../models/insumo.model';
import { MaterialService } from '../services/material.service';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
} from '../services/carga-masiva.service';
import { CargaMasivaDialogComponent } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';
import { PrimeDataTableComponent } from '../shared/components/prime-data-table/prime-data-table.component';
import {
  TableColumn,
  TableAction,
  TableButtonConfig,
  TableState,
} from '../shared/components/prime-data-table/prime-data-table.component';
import {
  ConsumosConfig,
  CONSUMOS_CONFIG,
} from '../shared/configs/consumos-config';

@Component({
  selector: 'app-consumos',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTooltipModule,
    PrimeDataTableComponent,
  ],
  templateUrl: './consumos.html',
  styleUrls: ['./consumos.scss'],
})
export class ConsumosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  dropdownExportAbierto = false;
  consumos: Consumo[] = [];
  insumos: Insumo[] = [];
  lotes: Lote[] = [];

  tableState: TableState = {
    loading: false,
    error: false,
    empty: false,
    filteredEmpty: false
  };

  columns: TableColumn[] = [
    {
      key: 'fecha',
      title: 'Fecha',
      sortable: true,
      filterable: false,
      width: '120px',
      type: 'date'
    },
    {
      key: 'id_insumo',
      title: 'Insumo',
      sortable: true,
      filterable: true,
      width: '200px',
      type: 'text'
    },
    {
      key: 'area_consumo',
      title: 'Área',
      sortable: true,
      filterable: true,
      width: '150px',
      type: 'text'
    },
    {
      key: 'cantidad',
      title: 'Cantidad',
      sortable: true,
      filterable: false,
      width: '120px',
      type: 'number'
    },
    {
      key: 'id_lote',
      title: 'Lote',
      sortable: true,
      filterable: true,
      width: '120px',
      type: 'text'
    },
    {
      key: 'motivo_consumo',
      title: 'Motivo',
      sortable: true,
      filterable: true,
      width: '150px',
      type: 'text'
    },
    {
      key: 'estado',
      title: 'Estado',
      sortable: true,
      filterable: true,
      width: '120px',
      type: 'badge'
    }
  ];

  actions: TableAction[] = [
    {
      action: 'view',
      tooltip: 'Ver Detalle',
      icon: 'pi pi-eye',
      color: 'secondary'
    },
    {
      action: 'edit',
      tooltip: 'Editar',
      icon: 'pi pi-pencil',
      color: 'primary',
      condition: (item: Consumo) => item.estado !== 'CONFIRMADO'
    },
    {
      action: 'delete',
      tooltip: 'Eliminar',
      icon: 'pi pi-trash',
      color: 'danger',
      condition: (item: Consumo) => item.estado !== 'CONFIRMADO'
    }
  ];

  buttons: TableButtonConfig[] = [
    {
      action: 'pesar',
      label: 'Iniciar Pesado',
      icon: 'pi pi-chart-bar',
      color: 'success'
    },
    {
      action: 'bulk',
      label: 'Carga Masiva',
      icon: 'pi pi-upload',
      color: 'secondary'
    }
  ];

  globalFilterFields: string[] = ['area_consumo', 'motivo_consumo', 'estado'];

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarInsumos();
    this.cargarLotes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private updateTableStates(): void {
    this.tableState.empty = this.consumos.length === 0;
  }

  private async cargarDatos() {
    this.tableState.loading = true;
    this.tableState.error = false;
    this.tableState.errorMessage = '';

    try {
      this.cargarDatosMock();
    } catch (error) {
      this.tableState.error = true;
      this.tableState.errorMessage = 'Error al cargar los datos de consumos';
      console.error('Error cargando consumos:', error);
      this.consumos = [];
    } finally {
      this.tableState.loading = false;
      this.updateTableStates();
    }
  }

  recargarDatos(): void {
    this.cargarDatos();
  }

  private cargarDatosMock() {
    this.consumos = [
      {
        id_consumo: 1,
        fecha: new Date('2024-01-15'),
        id_insumo: 1,
        cantidad: 25.5,
        id_unidad: 'KG',
        id_lote: 1,
        area_consumo: 'Producción',
        motivo_consumo: 'Producción diaria',
        usuario_registro: 'Juan Pérez',
        observaciones: 'Consumo normal',
        estado: 'CONFIRMADO'
      },
      {
        id_consumo: 2,
        fecha: new Date('2024-01-20'),
        id_insumo: 2,
        cantidad: 12.0,
        id_unidad: 'KG',
        id_lote: 2,
        area_consumo: 'Panadería',
        motivo_consumo: 'Producción especial',
        usuario_registro: 'María García',
        observaciones: 'Para pedido especial',
        estado: 'PENDIENTE'
      },
      {
        id_consumo: 3,
        fecha: new Date('2024-01-25'),
        id_insumo: 3,
        cantidad: 5.0,
        id_unidad: 'KG',
        id_lote: 3,
        area_consumo: 'Repostería',
        motivo_consumo: 'Pruebas',
        usuario_registro: 'Carlos López',
        observaciones: 'Pruebas de calidad',
        estado: 'ANULADO'
      },
      {
        id_consumo: 4,
        fecha: new Date('2024-02-01'),
        id_insumo: 4,
        cantidad: 250,
        id_unidad: 'G',
        id_lote: 4,
        area_consumo: 'Producción',
        motivo_consumo: 'Producción diaria',
        usuario_registro: 'Ana Martínez',
        observaciones: 'Uso normal',
        estado: 'CONFIRMADO'
      },
      {
        id_consumo: 5,
        fecha: new Date('2024-02-05'),
        id_insumo: 5,
        cantidad: 100,
        id_unidad: 'G',
        id_lote: 5,
        area_consumo: 'Chocolatería',
        motivo_consumo: 'Productos premium',
        usuario_registro: 'Luis Rodríguez',
        observaciones: 'Para línea premium',
        estado: 'PENDIENTE'
      }
    ];

    console.log('✅ Datos mock cargados:', this.consumos.length, 'consumos');
  }

  private cargarInsumos(): void {
    this.insumos = [
      { id_insumo: 1, nombre: 'Harina de Trigo Premium', id_fox: 'H001' },
      { id_insumo: 2, nombre: 'Azúcar Blanca', id_fox: 'A001' },
      { id_insumo: 3, nombre: 'Mantequilla Sin Sal', id_fox: 'M001' },
      { id_insumo: 4, nombre: 'Levadura Seca', id_fox: 'L001' },
      { id_insumo: 5, nombre: 'Chocolate Negro 70%', id_fox: 'C001' }
    ];
  }

  private cargarLotes(): void {
    this.lotes = [
      {
        id_lote: 1,
        lote: 'LT-001',
        id_insumo: 1,
        ubicacion: 'A-01-01',
        stock_inicial: 1000,
        stock_actual: 850,
        fecha_expiracion: new Date('2024-06-15'),
        precio_total: 2500,
        estado_lote: 'ACTIVO'
      },
      {
        id_lote: 2,
        lote: 'LT-002',
        id_insumo: 2,
        ubicacion: 'A-01-02',
        stock_inicial: 500,
        stock_actual: 75,
        fecha_expiracion: new Date('2024-03-20'),
        precio_total: 900,
        estado_lote: 'BAJO'
      },
      {
        id_lote: 3,
        lote: 'LT-003',
        id_insumo: 3,
        ubicacion: 'B-02-01',
        stock_inicial: 200,
        stock_actual: 0,
        fecha_expiracion: new Date('2024-01-10'),
        precio_total: 1700,
        estado_lote: 'AGOTADO'
      },
      {
        id_lote: 4,
        lote: 'LT-004',
        id_insumo: 4,
        ubicacion: 'A-03-01',
        stock_inicial: 300,
        stock_actual: 280,
        fecha_expiracion: new Date('2025-12-31'),
        precio_total: 150,
        estado_lote: 'ACTIVO'
      },
      {
        id_lote: 5,
        lote: 'LT-005',
        id_insumo: 5,
        ubicacion: 'C-01-01',
        stock_inicial: 100,
        stock_actual: 95,
        fecha_expiracion: new Date('2024-08-15'),
        precio_total: 1200,
        estado_lote: 'ACTIVO'
      }
    ];
  }

  getInsumoNombre(id_insumo?: number): string {
    const insumo = this.insumos.find((i) => i.id_insumo === id_insumo);
    return insumo ? insumo.nombre : 'Sin asignar';
  }

  getInsumoCodigoFox(id_insumo?: number): string {
    const insumo = this.insumos.find((i) => i.id_insumo === id_insumo);
    return insumo?.id_fox || '-';
  }

  getLoteNombre(id_lote?: number): string {
    const lote = this.lotes.find((l) => l.id_lote === id_lote);
    return lote ? lote.lote! : `L-${id_lote}`;
  }

  getEstadoConsumo(consumo: Consumo): string {
    return consumo.estado || 'PENDIENTE';
  }

  getEstadoColor(estado?: string): string {
    switch (estado?.toLowerCase()) {
      case 'confirmado':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'anulado':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  formatearFecha(fecha?: Date | string): string {
    if (!fecha) return '-';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleDateString('es-ES');
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  formatearNumero(valor?: number): string {
    if (valor === null || valor === undefined) return '-';
    return valor.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  formatearCantidad(cantidad?: number): string {
    return cantidad?.toLocaleString('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }) || '0';
  }

  verDetalle(consumo: Consumo): void {
    import('../shared/dialogs/detalle-dialog/detalle-dialog.component').then(
      ({ DetalleDialogComponent }) => {
        const datosDetalle = {
          ...consumo,
          id_insumo: this.getInsumoNombre(consumo.id_insumo),
          id_lote: this.getLoteNombre(consumo.id_lote),
          fecha: this.formatearFecha(consumo.fecha),
          cantidad: this.formatearNumero(consumo.cantidad)
        };
        
        const config = {
          entidad: 'Consumo',
          entidadArticulo: 'el consumo',
          datos: datosDetalle,
          filas: [
            [
              { key: 'fecha', label: 'Fecha', tipo: 'text' as const },
              { key: 'id_insumo', label: 'Insumo', tipo: 'text' as const }
            ],
            [
              { key: 'cantidad_consumida', label: 'Cantidad', tipo: 'text' as const },
              { key: 'id_unidad', label: 'Unidad', tipo: 'text' as const }
            ],
            [
              { key: 'area_consumo', label: 'Área', tipo: 'text' as const },
              { key: 'id_lote', label: 'Lote', tipo: 'text' as const }
            ],
            [
              { key: 'motivo_consumo', label: 'Motivo', tipo: 'text' as const },
              { key: 'estado', label: 'Estado', tipo: 'text' as const }
            ],
            [
              { key: 'usuario_registro', label: 'Usuario', tipo: 'text' as const },
              { key: 'observaciones', label: 'Observaciones', tipo: 'text' as const }
            ]
          ]
        };
        
        const dialogRef = this.dialog.open(DetalleDialogComponent, {
          width: '800px',
          disableClose: true,
          data: config,
        });
      }
    );
  }

  editar(consumo: Consumo): void {
    import(
      '../shared/dialogs/formulario-dialog/formulario-dialog.component'
    ).then(({ FormularioDialogComponent }) => {
      const config = {
        titulo: {
          agregar: 'Agregar Consumo',
          editar: 'Editar Consumo'
        },
        entidad: 'Consumo',
        entidadArticulo: 'el consumo',
        esEdicion: true,
        datosIniciales: consumo,
        filas: [
          [
            {
              key: 'fecha',
              label: 'Fecha',
              tipo: 'date' as const,
              obligatorio: true,
              ancho: 'normal' as const
            },
            {
              key: 'id_insumo',
              label: 'Insumo',
              tipo: 'select' as const,
              obligatorio: true,
              opciones: this.insumos.map(i => ({ value: i.id_insumo!, label: i.nombre })),
              ancho: 'normal' as const
            }
          ],
          [
            {
              key: 'cantidad_consumida',
              label: 'Cantidad',
              tipo: 'number' as const,
              obligatorio: true,
              ancho: 'normal' as const,
              conPesado: true
            },
            {
              key: 'id_unidad',
              label: 'Unidad',
              tipo: 'text' as const,
              ancho: 'normal' as const
            }
          ],
          [
            {
              key: 'area_consumo',
              label: 'Área de Consumo',
              tipo: 'text' as const,
              obligatorio: true,
              ancho: 'normal' as const
            },
            {
              key: 'id_lote',
              label: 'Lote',
              tipo: 'select' as const,
              opciones: this.lotes.map(l => ({ value: l.id_lote!, label: l.lote! })),
              ancho: 'normal' as const
            }
          ],
          [
            {
              key: 'motivo_consumo',
              label: 'Motivo',
              tipo: 'text' as const,
              obligatorio: true,
              ancho: 'normal' as const
            },
            {
              key: 'estado',
              label: 'Estado',
              tipo: 'select' as const,
              obligatorio: true,
              opciones: [
                { value: 'PENDIENTE', label: 'Pendiente' },
                { value: 'CONFIRMADO', label: 'Confirmado' },
                { value: 'ANULADO', label: 'Anulado' }
              ],
              ancho: 'normal' as const
            }
          ],
          [
            {
              key: 'observaciones',
              label: 'Observaciones',
              tipo: 'textarea' as const,
              ancho: 'completo' as const
            }
          ]
        ]
      };
      
      const dialogRef = this.dialog.open(FormularioDialogComponent, {
        width: '800px',
        disableClose: true,
        data: config,
      });

      dialogRef.afterClosed().subscribe((resultado) => {
        if (resultado?.accion === 'guardar') {
          console.log('Actualizando consumo:', resultado.datos);
          this.cargarDatos();
        }
      });
    });
  }

  eliminar(consumo: Consumo): void {
    import('../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component').then(
      ({ ConfirmacionDialogComponent }) => {
        const config = {
          titulo: 'Eliminar Consumo',
          subtitulo: 'Esta acción no se puede deshacer',
          mensaje: `¿Está seguro que desea eliminar el consumo de "${this.getInsumoNombre(consumo.id_insumo)}"?`,
          mensajeSecundario: 'Todos los datos relacionados con este consumo se perderán permanentemente.',
          tipo: 'danger' as const,
          textoBotonConfirmar: 'Eliminar',
          textoBotonCancelar: 'Cancelar'
        };
        
        const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
          width: '500px',
          disableClose: true,
          data: config,
        });
        
        dialogRef.afterClosed().subscribe((confirmado) => {
          if (confirmado && consumo.id_consumo) {
            console.log('Eliminar consumo:', consumo);
            this.cargarDatos();
          }
        });
      }
    );
  }


  private configurarExportacion(): ConfiguracionExportacion<Consumo> {
    return {
      entidades: this.consumos,
      nombreArchivo: 'consumos',
      nombreEntidad: 'Consumos',
      columnas: [
        { campo: 'id_consumo', titulo: 'ID', formato: 'numero' },
        { campo: 'fecha', titulo: 'Fecha', formato: 'fecha' },
        { campo: 'id_insumo', titulo: 'ID Insumo', formato: 'numero' },
        { campo: 'cantidad_consumida', titulo: 'Cantidad', formato: 'numero' },
        { campo: 'id_unidad', titulo: 'Unidad', formato: 'texto' },
        { campo: 'id_lote', titulo: 'ID Lote', formato: 'numero' },
        { campo: 'area_consumo', titulo: 'Área', formato: 'texto' },
        { campo: 'motivo_consumo', titulo: 'Motivo', formato: 'texto' },
        { campo: 'usuario_registro', titulo: 'Usuario', formato: 'texto' },
        { campo: 'observaciones', titulo: 'Observaciones', formato: 'texto' },
        { campo: 'estado', titulo: 'Estado', formato: 'texto' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.consumos.length,
        cantidadFiltrada: this.consumos.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Consumo> {
    return {
      tipoEntidad: 'consumos',
      mapeoColumnas: [
        {
          columnaArchivo: 'Fecha',
          campoEntidad: 'fecha',
          obligatorio: true,
          tipoEsperado: 'fecha',
        },
        {
          columnaArchivo: 'ID Insumo',
          campoEntidad: 'id_insumo',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Cantidad',
          campoEntidad: 'cantidad_consumida',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Área',
          campoEntidad: 'area_consumo',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Motivo',
          campoEntidad: 'motivo_consumo',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Estado',
          campoEntidad: 'estado',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'area_consumo',
          validador: (valor) => valor && valor.length <= 100,
          mensajeError: 'El área debe tener máximo 100 caracteres',
        },
        {
          campo: 'motivo_consumo',
          validador: (valor) => valor && valor.length <= 200,
          mensajeError: 'El motivo debe tener máximo 200 caracteres',
        },
        {
          campo: 'estado',
          validador: (valor) => !valor || ['PENDIENTE', 'CONFIRMADO', 'ANULADO'].includes(valor),
          mensajeError: 'El estado debe ser PENDIENTE, CONFIRMADO o ANULADO',
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

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarDatos();
      }
    });
  }

  onActionClick(event: any): void {
    const action = typeof event === 'string' ? event : event.action;
    const item = typeof event === 'string' ? null : (event.data || event.item);
    
    switch (action) {
      case 'view':
        this.verDetalle(item);
        break;
      case 'edit':
        this.editar(item);
        break;
      case 'delete':
        this.eliminar(item);
        break;
    }
  }

  onButtonClick(event: any): void {
    const action = typeof event === 'string' ? event : event.action;
    
    switch (action) {
      case 'pesar':
        this.iniciarPesado();
        break;
      case 'bulk':
        this.cargaMasiva();
        break;
    }
  }

  iniciarPesado(): void {
    // TODO: Implementar diálogo de pesado con integración de balanza y escaneo QR
    import('../shared/dialogs/formulario-dialog/formulario-dialog.component').then(
      ({ FormularioDialogComponent }) => {
        const config = {
          titulo: {
            agregar: 'Iniciar Pesado de Insumo',
            editar: 'Editar Pesado'
          },
          entidad: 'Pesado',
          entidadArticulo: 'el pesado',
          esEdicion: false,
          datosIniciales: {},
          filas: [
            [
              {
                key: 'qca_codigo',
                label: 'Código QCA',
                tipo: 'text' as const,
                placeholder: 'Escanear código QR...',
                obligatorio: true,
                conScanner: true,
                ancho: 'completo' as const
              }
            ],
            [
              {
                key: 'id_insumo',
                label: 'Insumo',
                tipo: 'select' as const,
                placeholder: 'Seleccionar insumo',
                obligatorio: true,
                opciones: this.insumos.map(insumo => ({
                  value: insumo.id_insumo,
                  label: insumo.nombre
                })),
                ancho: 'normal' as const
              },
              {
                key: 'id_lote',
                label: 'Lote',
                tipo: 'select' as const,
                placeholder: 'Seleccionar lote',
                obligatorio: true,
                opciones: this.lotes.map(lote => ({
                  value: lote.id_lote,
                  label: lote.lote
                })),
                ancho: 'normal' as const
              }
            ],
            [
              {
                key: 'cantidad_solicitada',
                label: 'Cantidad Solicitada',
                tipo: 'number' as const,
                placeholder: '0.00',
                obligatorio: true,
                step: 0.01,
                min: 0.01,
                ancho: 'normal' as const
              },
              {
                key: 'cantidad_pesada',
                label: 'Cantidad Pesada (kg)',
                tipo: 'number' as const,
                placeholder: 'Usar balanza...',
                obligatorio: true,
                conPesado: true,
                step: 0.001,
                min: 0.001,
                ancho: 'normal' as const
              }
            ],
            [
              {
                key: 'area_consumo',
                label: 'Área de Consumo',
                tipo: 'select' as const,
                placeholder: 'Seleccionar área',
                obligatorio: true,
                opciones: [
                  { value: 'Teñido Línea A', label: 'Teñido Línea A' },
                  { value: 'Teñido Línea B', label: 'Teñido Línea B' },
                  { value: 'Teñido Línea C', label: 'Teñido Línea C' },
                  { value: 'Acabados', label: 'Acabados' },
                  { value: 'Control de Calidad', label: 'Control de Calidad' }
                ],
                ancho: 'normal' as const
              },
              {
                key: 'operador',
                label: 'Operador',
                tipo: 'text' as const,
                placeholder: 'Nombre del operador',
                obligatorio: true,
                ancho: 'normal' as const
              }
            ],
            [
              {
                key: 'observaciones',
                label: 'Observaciones',
                tipo: 'textarea' as const,
                placeholder: 'Observaciones del pesado...',
                obligatorio: false,
                ancho: 'completo' as const
              }
            ]
          ]
        };

        const dialogRef = this.dialog.open(FormularioDialogComponent, {
          width: '900px',
          disableClose: true,
          data: config,
        });

        dialogRef.afterClosed().subscribe((resultado) => {
          if (resultado && resultado.accion === 'guardar') {
            console.log('Pesado registrado:', resultado.datos);
            // TODO: Integrar con API para guardar el pesado
            this.cargarDatos();
          }
        });
      }
    );
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-export')) {
      this.dropdownExportAbierto = false;
    }
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
      .catch((error: any) => {
        console.error('Error procesando archivo:', error);
      });
  }

  private obtenerFiltrosActivos(): any {
    return {};
  }
}