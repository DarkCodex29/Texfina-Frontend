import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, finalize, delay } from 'rxjs';

import { MaterialService } from '../services/material.service';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
} from '../services/carga-masiva.service';
import { Ingreso, Insumo, Unidad, Lote } from '../models/insumo.model';
import { CargaMasivaDialogComponent } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';
import { PrimeDataTableComponent } from '../shared/components/prime-data-table/prime-data-table.component';
import {
  TableColumn,
  TableAction,
  TableButtonConfig,
  TableState,
} from '../shared/components/prime-data-table/prime-data-table.component';
import {
  INGRESOS_CONFIG,
  IngresosConfig,
} from '../shared/configs/ingresos-config';

@Component({
  selector: 'app-ingresos',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTooltipModule,
    PrimeDataTableComponent,
  ],
  templateUrl: './ingresos.html',
  styleUrls: ['./ingresos.scss'],
})
export class IngresosComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  
  dropdownExportAbierto = false;
  ingresos: Ingreso[] = [];
  insumos: Insumo[] = [];
  unidades: Unidad[] = [];
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
      key: 'precio_total_formula',
      title: 'Precio Total',
      sortable: true,
      filterable: false,
      width: '140px',
      type: 'currency'
    },
    {
      key: 'numero_remision',
      title: 'N° Remisión',
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
      condition: (item: Ingreso) => item.estado !== 'PROCESADO'
    }
  ];

  buttons: TableButtonConfig[] = [
    {
      action: 'add',
      label: 'Agregar Ingreso',
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

  globalFilterFields: string[] = ['numero_remision', 'orden_compra', 'estado'];

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarInsumos();
    this.cargarUnidades();
    this.cargarLotes();
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
    this.tableState.empty = this.ingresos.length === 0;
  }

  private async cargarDatos() {
    this.tableState.loading = true;
    this.tableState.error = false;
    this.tableState.errorMessage = '';

    try {
      this.cargarDatosMock();
    } catch (error) {
      this.tableState.error = true;
      this.tableState.errorMessage = 'Error al cargar los datos de ingresos';
      console.error('Error cargando ingresos:', error);
      this.ingresos = [];
    } finally {
      this.tableState.loading = false;
      this.updateTableStates();
    }
  }

  recargarDatos(): void {
    this.cargarDatos();
  }

  private cargarDatosMock() {
    this.ingresos = [
      {
        id_ingreso: 1,
        fecha: new Date('2024-01-15'),
        id_insumo: 1,
        presentacion: 'Saco 50kg',
        id_unidad: 'KG',
        cantidad: 50,
        id_lote: 1,
        precio_unitario_historico: 2.50,
        precio_total_formula: 125.00,
        numero_remision: 'R-001-2024',
        orden_compra: 'OC-001-2024',
        estado: 'PROCESADO'
      },
      {
        id_ingreso: 2,
        fecha: new Date('2024-01-20'),
        id_insumo: 2,
        presentacion: 'Saco 25kg',
        id_unidad: 'KG',
        cantidad: 25,
        id_lote: 2,
        precio_unitario_historico: 1.80,
        precio_total_formula: 45.00,
        numero_remision: 'R-002-2024',
        orden_compra: 'OC-002-2024',
        estado: 'PENDIENTE'
      },
      {
        id_ingreso: 3,
        fecha: new Date('2024-01-25'),
        id_insumo: 3,
        presentacion: 'Bloque 1kg',
        id_unidad: 'KG',
        cantidad: 10,
        id_lote: 3,
        precio_unitario_historico: 8.50,
        precio_total_formula: 85.00,
        numero_remision: 'R-003-2024',
        orden_compra: 'OC-003-2024',
        estado: 'PROCESADO'
      },
      {
        id_ingreso: 4,
        fecha: new Date('2024-02-01'),
        id_insumo: 4,
        presentacion: 'Sobre 500g',
        id_unidad: 'G',
        cantidad: 500,
        id_lote: 4,
        precio_unitario_historico: 0.30,
        precio_total_formula: 150.00,
        numero_remision: 'R-004-2024',
        orden_compra: 'OC-004-2024',
        estado: 'ANULADO'
      },
      {
        id_ingreso: 5,
        fecha: new Date('2024-02-05'),
        id_insumo: 5,
        presentacion: 'Tableta 200g',
        id_unidad: 'G',
        cantidad: 200,
        id_lote: 5,
        precio_unitario_historico: 15.00,
        precio_total_formula: 3000.00,
        numero_remision: 'R-005-2024',
        orden_compra: 'OC-005-2024',
        estado: 'PENDIENTE'
      }
    ];

    console.log('✅ Datos mock cargados:', this.ingresos.length, 'ingresos');
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

  private cargarUnidades(): void {
    this.unidades = [
      { id_unidad: 'KG', nombre: 'Kilogramos' },
      { id_unidad: 'G', nombre: 'Gramos' },
      { id_unidad: 'L', nombre: 'Litros' },
      { id_unidad: 'ML', nombre: 'Mililitros' },
      { id_unidad: 'UND', nombre: 'Unidades' }
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

  getUnidadNombre(id_unidad?: string): string {
    const unidad = this.unidades.find((u) => u.id_unidad === id_unidad);
    return unidad ? unidad.nombre : id_unidad || '-';
  }

  getLoteNombre(id_lote?: number): string {
    const lote = this.lotes.find((l) => l.id_lote === id_lote);
    return lote ? lote.lote! : `L-${id_lote}`;
  }

  getEstadoIngreso(ingreso: Ingreso): string {
    return ingreso.estado || 'PENDIENTE';
  }

  getEstadoColor(estado?: string): string {
    switch (estado?.toLowerCase()) {
      case 'procesado':
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

  formatearPrecio(precio?: number): string {
    if (precio === null || precio === undefined) return '-';
    return `S/ ${precio.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }


  private configurarExportacion(): ConfiguracionExportacion<Ingreso> {
    return {
      entidades: this.ingresos,
      nombreArchivo: 'ingresos',
      nombreEntidad: 'Ingresos',
      columnas: [
        { campo: 'id_ingreso', titulo: 'ID', formato: 'numero' },
        { campo: 'fecha', titulo: 'Fecha', formato: 'fecha' },
        { campo: 'id_insumo', titulo: 'ID Insumo', formato: 'numero' },
        { campo: 'presentacion', titulo: 'Presentación', formato: 'texto' },
        { campo: 'id_unidad', titulo: 'Unidad', formato: 'texto' },
        { campo: 'cantidad', titulo: 'Cantidad', formato: 'numero' },
        { campo: 'id_lote', titulo: 'ID Lote', formato: 'numero' },
        {
          campo: 'precio_total_formula',
          titulo: 'Precio Total',
          formato: 'numero',
        },
        { campo: 'numero_remision', titulo: 'N° Remisión', formato: 'texto' },
        { campo: 'orden_compra', titulo: 'Orden Compra', formato: 'texto' },
        { campo: 'estado', titulo: 'Estado', formato: 'texto' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.ingresos.length,
        cantidadFiltrada: this.ingresos.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Ingreso> {
    return {
      tipoEntidad: 'ingresos',
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
          columnaArchivo: 'Presentación',
          campoEntidad: 'presentacion',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Cantidad',
          campoEntidad: 'cantidad',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'N° Remisión',
          campoEntidad: 'numero_remision',
          obligatorio: false,
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
          campo: 'presentacion',
          validador: (valor) =>
            !valor ||
            valor.length <=
              INGRESOS_CONFIG.VALIDACIONES.PRESENTACION_MAX_LENGTH,
          mensajeError: `La presentación debe tener máximo ${INGRESOS_CONFIG.VALIDACIONES.PRESENTACION_MAX_LENGTH} caracteres`,
        },
        {
          campo: 'numero_remision',
          validador: (valor) =>
            !valor ||
            valor.length <=
              INGRESOS_CONFIG.VALIDACIONES.NUMERO_REMISION_MAX_LENGTH,
          mensajeError: `El número de remisión debe tener máximo ${INGRESOS_CONFIG.VALIDACIONES.NUMERO_REMISION_MAX_LENGTH} caracteres`,
        },
        {
          campo: 'estado',
          validador: (valor) =>
            !valor ||
            valor.length <= INGRESOS_CONFIG.VALIDACIONES.ESTADO_MAX_LENGTH,
          mensajeError: `El estado debe tener máximo ${INGRESOS_CONFIG.VALIDACIONES.ESTADO_MAX_LENGTH} caracteres`,
        },
      ],
    };
  }

  private obtenerFiltrosActivos(): any {
    return {};
  }

  verDetalle(ingreso: Ingreso): void {
    import('../shared/dialogs/detalle-dialog/detalle-dialog.component').then(
      ({ DetalleDialogComponent }) => {
        const datosDetalle = {
          ...ingreso,
          id_insumo: this.getInsumoNombre(ingreso.id_insumo),
          id_lote: this.getLoteNombre(ingreso.id_lote),
          id_unidad: this.getUnidadNombre(ingreso.id_unidad),
          fecha: this.formatearFecha(ingreso.fecha),
          precio_total_formula: this.formatearPrecio(ingreso.precio_total_formula),
          cantidad: this.formatearNumero(ingreso.cantidad)
        };
        
        const config = {
          entidad: 'Ingreso',
          entidadArticulo: 'el ingreso',
          datos: datosDetalle,
          filas: [
            [
              { key: 'fecha', label: 'Fecha', tipo: 'text' as const },
              { key: 'id_insumo', label: 'Insumo', tipo: 'text' as const }
            ],
            [
              { key: 'cantidad', label: 'Cantidad', tipo: 'text' as const },
              { key: 'presentacion', label: 'Presentación', tipo: 'text' as const }
            ],
            [
              { key: 'id_unidad', label: 'Unidad', tipo: 'text' as const },
              { key: 'id_lote', label: 'Lote', tipo: 'text' as const }
            ],
            [
              { key: 'precio_total_formula', label: 'Precio Total', tipo: 'text' as const },
              { key: 'estado', label: 'Estado', tipo: 'text' as const }
            ],
            [
              { key: 'numero_remision', label: 'N° Remisión', tipo: 'text' as const },
              { key: 'orden_compra', label: 'Orden de Compra', tipo: 'text' as const }
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

  agregar(): void {
    import(
      '../shared/dialogs/formulario-dialog/formulario-dialog.component'
    ).then(({ FormularioDialogComponent }) => {
      const config = {
        titulo: {
          agregar: 'Agregar Ingreso',
          editar: 'Editar Ingreso'
        },
        entidad: 'Ingreso',
        entidadArticulo: 'el ingreso',
        esEdicion: false,
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
              tipo: 'autocomplete' as const,
              obligatorio: true,
              opciones: this.insumos.map(i => ({ value: i.id_insumo!, label: i.nombre })),
              ancho: 'normal' as const,
              conScanner: true
            }
          ],
          [
            {
              key: 'cantidad',
              label: 'Cantidad',
              tipo: 'number' as const,
              obligatorio: true,
              ancho: 'normal' as const
            },
            {
              key: 'presentacion',
              label: 'Presentación',
              tipo: 'text' as const,
              ancho: 'normal' as const
            }
          ],
          [
            {
              key: 'id_unidad',
              label: 'Unidad',
              tipo: 'select' as const,
              opciones: this.unidades.map(u => ({ value: u.id_unidad, label: u.nombre })),
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
              key: 'precio_unitario_historico',
              label: 'Precio Unitario',
              tipo: 'number' as const,
              ancho: 'normal' as const
            },
            {
              key: 'estado',
              label: 'Estado',
              tipo: 'select' as const,
              obligatorio: true,
              opciones: [
                { value: 'PENDIENTE', label: 'Pendiente' },
                { value: 'PROCESADO', label: 'Procesado' },
                { value: 'ANULADO', label: 'Anulado' }
              ],
              ancho: 'normal' as const
            }
          ],
          [
            {
              key: 'numero_remision',
              label: 'N° Remisión',
              tipo: 'text' as const,
              ancho: 'normal' as const
            },
            {
              key: 'orden_compra',
              label: 'Orden de Compra',
              tipo: 'text' as const,
              ancho: 'normal' as const
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
          console.log('Creando ingreso:', resultado.datos);
          this.cargarDatos();
        }
      });
    });
  }

  editar(ingreso: Ingreso): void {
    import(
      '../shared/dialogs/formulario-dialog/formulario-dialog.component'
    ).then(({ FormularioDialogComponent }) => {
      const config = {
        titulo: {
          agregar: 'Agregar Ingreso',
          editar: 'Editar Ingreso'
        },
        entidad: 'Ingreso',
        entidadArticulo: 'el ingreso',
        esEdicion: true,
        datosIniciales: ingreso,
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
              tipo: 'autocomplete' as const,
              obligatorio: true,
              opciones: this.insumos.map(i => ({ value: i.id_insumo!, label: i.nombre })),
              ancho: 'normal' as const,
              conScanner: true
            }
          ],
          [
            {
              key: 'cantidad',
              label: 'Cantidad',
              tipo: 'number' as const,
              obligatorio: true,
              ancho: 'normal' as const
            },
            {
              key: 'presentacion',
              label: 'Presentación',
              tipo: 'text' as const,
              ancho: 'normal' as const
            }
          ],
          [
            {
              key: 'id_unidad',
              label: 'Unidad',
              tipo: 'select' as const,
              opciones: this.unidades.map(u => ({ value: u.id_unidad, label: u.nombre })),
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
              key: 'precio_unitario_historico',
              label: 'Precio Unitario',
              tipo: 'number' as const,
              ancho: 'normal' as const
            },
            {
              key: 'estado',
              label: 'Estado',
              tipo: 'select' as const,
              obligatorio: true,
              opciones: [
                { value: 'PENDIENTE', label: 'Pendiente' },
                { value: 'PROCESADO', label: 'Procesado' },
                { value: 'ANULADO', label: 'Anulado' }
              ],
              ancho: 'normal' as const
            }
          ],
          [
            {
              key: 'numero_remision',
              label: 'N° Remisión',
              tipo: 'text' as const,
              ancho: 'normal' as const
            },
            {
              key: 'orden_compra',
              label: 'Orden de Compra',
              tipo: 'text' as const,
              ancho: 'normal' as const
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
          console.log('Actualizando ingreso:', resultado.datos);
          this.cargarDatos();
        }
      });
    });
  }

}

export { IngresosComponent as Ingresos };
