import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, finalize } from 'rxjs';
import { MaterialService } from '../services/material.service';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
} from '../services/carga-masiva.service';
import { LotesService } from '../services/lotes.service';
import { Lote, Insumo } from '../models/insumo.model';
import { CargaMasivaDialogComponent } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';
import { PrimeDataTableComponent } from '../shared/components/prime-data-table/prime-data-table.component';
import {
  TableColumn,
  TableAction,
  TableButtonConfig,
  TableState,
} from '../shared/components/prime-data-table/prime-data-table.component';

@Component({
  selector: 'app-lotes',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTooltipModule,
    PrimeDataTableComponent,
  ],
  templateUrl: './lotes.html',
  styleUrls: ['./lotes.scss'],
})
export class LotesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  dropdownExportAbierto = false;
  lotes: Lote[] = [];
  insumos: Insumo[] = [];

  tableState: TableState = {
    loading: false,
    error: false,
    empty: false,
    filteredEmpty: false
  };

  columns: TableColumn[] = [
    {
      key: 'lote',
      title: 'Código Lote',
      sortable: true,
      filterable: true,
      width: '120px',
      type: 'text'
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
      key: 'ubicacion',
      title: 'Ubicación',
      sortable: true,
      filterable: true,
      width: '150px',
      type: 'text'
    },
    {
      key: 'stock_actual',
      title: 'Stock',
      sortable: true,
      filterable: false,
      width: '120px',
      type: 'number'
    },
    {
      key: 'fecha_expiracion',
      title: 'Vencimiento',
      sortable: true,
      filterable: false,
      width: '140px',
      type: 'date'
    },
    {
      key: 'estado_lote',
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
      color: 'primary'
    },
    {
      action: 'delete',
      tooltip: 'Eliminar',
      icon: 'pi pi-trash',
      color: 'danger'
    }
  ];

  buttons: TableButtonConfig[] = [
    {
      action: 'add',
      label: 'Agregar Lote',
      icon: 'pi pi-plus',
      color: 'primary'
    },
    {
      action: 'bulk',
      label: 'Carga Masiva',
      icon: 'pi pi-upload',
      color: 'secondary'
    }
  ];

  globalFilterFields: string[] = ['lote', 'ubicacion', 'estado_lote'];

  constructor(
    private materialService: MaterialService,
    private lotesService: LotesService,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarInsumos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onActionClick(event: { action: string; item: any }): void {
    const { action, item } = event;
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

  onButtonClick(action: string): void {
    switch (action) {
      case 'add':
        this.agregar();
        break;
      case 'bulk':
        this.cargaMasiva();
        break;
    }
  }

  private updateTableStates(): void {
    this.tableState.empty = this.lotes.length === 0;
  }

  private async cargarDatos() {
    this.tableState.loading = true;
    this.tableState.error = false;
    this.tableState.errorMessage = '';

    try {
      this.cargarDatosMock();
    } catch (error) {
      this.tableState.error = true;
      this.tableState.errorMessage = 'Error al cargar los datos de lotes';
      console.error('Error cargando lotes:', error);
      this.lotes = [];
    } finally {
      this.tableState.loading = false;
      this.updateTableStates();
    }
  }

  recargarDatos(): void {
    this.cargarDatos();
  }

  private cargarDatosMock() {
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
      },
      {
        id_lote: 6,
        lote: 'LT-006',
        id_insumo: 1,
        ubicacion: 'A-01-03',
        stock_inicial: 800,
        stock_actual: 120,
        fecha_expiracion: new Date('2024-02-28'),
        precio_total: 2000,
        estado_lote: 'VENCIDO'
      }
    ];

    console.log('✅ Datos mock cargados:', this.lotes.length, 'lotes');
  }

  private cargarInsumos(): void {
    this.insumos = [
      { id_insumo: 1, nombre: 'Harina de Trigo Premium' },
      { id_insumo: 2, nombre: 'Azúcar Blanca' },
      { id_insumo: 3, nombre: 'Mantequilla Sin Sal' },
      { id_insumo: 4, nombre: 'Levadura Seca' },
      { id_insumo: 5, nombre: 'Chocolate Negro 70%' }
    ];
  }

  getInsumoNombre(id_insumo?: number): string {
    const insumo = this.insumos.find((i) => i.id_insumo === id_insumo);
    return insumo ? insumo.nombre : 'Sin asignar';
  }

  getEstadoColor(estado?: string): string {
    switch (estado?.toLowerCase()) {
      case 'activo':
        return 'success';
      case 'bajo':
        return 'warning';
      case 'agotado':
        return 'danger';
      case 'vencido':
        return 'danger';
      case 'reservado':
        return 'info';
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

  formatearPrecio(precio?: number): string {
    if (precio === null || precio === undefined) return '-';
    return `$${precio.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  verDetalle(lote: Lote): void {
    import('../shared/dialogs/detalle-dialog/detalle-dialog.component').then(
      ({ DetalleDialogComponent }) => {
        const datosDetalle = {
          ...lote,
          id_insumo: this.getInsumoNombre(lote.id_insumo),
          fecha_expiracion: this.formatearFecha(lote.fecha_expiracion),
          precio_total: this.formatearPrecio(lote.precio_total),
          stock_inicial: this.formatearNumero(lote.stock_inicial),
          stock_actual: this.formatearNumero(lote.stock_actual)
        };
        
        const config = {
          entidad: 'Lote',
          entidadArticulo: 'el lote',
          datos: datosDetalle,
          filas: [
            [
              { key: 'lote', label: 'Código Lote', tipo: 'text' as const },
              { key: 'id_insumo', label: 'Insumo', tipo: 'text' as const }
            ],
            [
              { key: 'ubicacion', label: 'Ubicación', tipo: 'text' as const },
              { key: 'estado_lote', label: 'Estado', tipo: 'text' as const }
            ],
            [
              { key: 'stock_inicial', label: 'Stock Inicial', tipo: 'text' as const },
              { key: 'stock_actual', label: 'Stock Actual', tipo: 'text' as const }
            ],
            [
              { key: 'fecha_expiracion', label: 'Fecha Expiración', tipo: 'text' as const },
              { key: 'precio_total', label: 'Precio Total', tipo: 'text' as const }
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

  editar(lote: Lote): void {
    import(
      '../shared/dialogs/formulario-dialog/formulario-dialog.component'
    ).then(({ FormularioDialogComponent }) => {
      const config = {
        titulo: {
          agregar: 'Agregar Lote',
          editar: 'Editar Lote'
        },
        entidad: 'Lote',
        entidadArticulo: 'el lote',
        esEdicion: true,
        datosIniciales: lote,
        filas: [
          [
            {
              key: 'lote',
              label: 'Código Lote',
              tipo: 'text' as const,
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
              key: 'ubicacion',
              label: 'Ubicación',
              tipo: 'text' as const,
              ancho: 'normal' as const
            },
            {
              key: 'estado_lote',
              label: 'Estado',
              tipo: 'select' as const,
              opciones: [
                { value: 'ACTIVO', label: 'Activo' },
                { value: 'BAJO', label: 'Bajo' },
                { value: 'AGOTADO', label: 'Agotado' },
                { value: 'VENCIDO', label: 'Vencido' }
              ],
              ancho: 'normal' as const
            }
          ],
          [
            {
              key: 'stock_inicial',
              label: 'Stock Inicial',
              tipo: 'number' as const,
              obligatorio: true,
              ancho: 'normal' as const
            },
            {
              key: 'stock_actual',
              label: 'Stock Actual',
              tipo: 'number' as const,
              obligatorio: true,
              ancho: 'normal' as const
            }
          ]
        ]
      };
      
      const dialogRef = this.dialog.open(FormularioDialogComponent, {
        width: '700px',
        disableClose: true,
        data: config,
      });

      dialogRef.afterClosed().subscribe((resultado) => {
        if (resultado?.accion === 'guardar') {
          console.log('Actualizando lote:', resultado.datos);
          this.cargarDatos();
        }
      });
    });
  }

  eliminar(lote: Lote): void {
    import('../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component').then(
      ({ ConfirmacionDialogComponent }) => {
        const config = {
          titulo: 'Eliminar Lote',
          subtitulo: 'Esta acción no se puede deshacer',
          mensaje: `¿Está seguro que desea eliminar el lote "${lote.lote}"?`,
          mensajeSecundario: 'Todos los datos relacionados con este lote se perderán permanentemente.',
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
          if (confirmado && lote.id_lote) {
            console.log('Eliminar lote:', lote);
            this.cargarDatos();
          }
        });
      }
    );
  }

  agregar(): void {
    import(
      '../shared/dialogs/formulario-dialog/formulario-dialog.component'
    ).then(({ FormularioDialogComponent }) => {
      const config = {
        titulo: {
          agregar: 'Agregar Lote',
          editar: 'Editar Lote'
        },
        entidad: 'Lote',
        entidadArticulo: 'el lote',
        esEdicion: false,
        filas: [
          [
            {
              key: 'lote',
              label: 'Código Lote',
              tipo: 'text' as const,
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
              key: 'ubicacion',
              label: 'Ubicación',
              tipo: 'text' as const,
              ancho: 'normal' as const
            },
            {
              key: 'estado_lote',
              label: 'Estado',
              tipo: 'select' as const,
              opciones: [
                { value: 'ACTIVO', label: 'Activo' },
                { value: 'BAJO', label: 'Bajo' },
                { value: 'AGOTADO', label: 'Agotado' },
                { value: 'VENCIDO', label: 'Vencido' }
              ],
              ancho: 'normal' as const
            }
          ],
          [
            {
              key: 'stock_inicial',
              label: 'Stock Inicial',
              tipo: 'number' as const,
              obligatorio: true,
              ancho: 'normal' as const
            },
            {
              key: 'stock_actual',
              label: 'Stock Actual',
              tipo: 'number' as const,
              obligatorio: true,
              ancho: 'normal' as const
            }
          ]
        ]
      };
      
      const dialogRef = this.dialog.open(FormularioDialogComponent, {
        width: '700px',
        disableClose: true,
        data: config,
      });

      dialogRef.afterClosed().subscribe((resultado) => {
        if (resultado?.accion === 'guardar') {
          console.log('Creando lote:', resultado.datos);
          this.cargarDatos();
        }
      });
    });
  }

  private configurarExportacion(): ConfiguracionExportacion<Lote> {
    return {
      entidades: this.lotes,
      nombreArchivo: 'lotes',
      nombreEntidad: 'Lotes',
      columnas: [
        { campo: 'id_lote', titulo: 'ID', formato: 'numero' },
        { campo: 'lote', titulo: 'Código Lote', formato: 'texto' },
        { campo: 'id_insumo', titulo: 'ID Insumo', formato: 'numero' },
        { campo: 'ubicacion', titulo: 'Ubicación', formato: 'texto' },
        { campo: 'stock_inicial', titulo: 'Stock Inicial', formato: 'numero' },
        { campo: 'stock_actual', titulo: 'Stock Actual', formato: 'numero' },
        {
          campo: 'fecha_expiracion',
          titulo: 'Fecha Expiración',
          formato: 'fecha',
        },
        { campo: 'precio_total', titulo: 'Precio Total', formato: 'numero' },
        { campo: 'estado_lote', titulo: 'Estado', formato: 'texto' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.lotes.length,
        cantidadFiltrada: this.lotes.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Lote> {
    return {
      tipoEntidad: 'lotes',
      mapeoColumnas: [
        {
          columnaArchivo: 'Código Lote',
          campoEntidad: 'lote',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'ID Insumo',
          campoEntidad: 'id_insumo',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Ubicación',
          campoEntidad: 'ubicacion',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Stock Inicial',
          campoEntidad: 'stock_inicial',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Stock Actual',
          campoEntidad: 'stock_actual',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Fecha Expiración',
          campoEntidad: 'fecha_expiracion',
          obligatorio: false,
          tipoEsperado: 'fecha',
        },
        {
          columnaArchivo: 'Precio Total',
          campoEntidad: 'precio_total',
          obligatorio: false,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Estado',
          campoEntidad: 'estado_lote',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'lote',
          validador: (valor) => valor && valor.length <= 100,
          mensajeError: 'El código del lote debe tener máximo 100 caracteres',
        },
        {
          campo: 'ubicacion',
          validador: (valor) => !valor || valor.length <= 200,
          mensajeError: 'La ubicación debe tener máximo 200 caracteres',
        },
        {
          campo: 'estado_lote',
          validador: (valor) => !valor || valor.length <= 50,
          mensajeError: 'El estado debe tener máximo 50 caracteres',
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