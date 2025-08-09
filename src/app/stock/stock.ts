import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, finalize } from 'rxjs';
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

export interface Stock {
  id_insumo: number;
  codigo_fox: string;
  nombre: string;
  nombre_material: string;
  id_almacen: number;
  almacen: string;
  nombre_almacen: string;
  id_clase: number;
  clase: string;
  id_unidad: number;
  unidad: string;
  stock_actual: number;
  cantidad_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  costo_unitario: number;
  precio_unitario: number;
  valor_total: number;
  fecha_ultimo_movimiento: string;
  estado_stock: 'CRITICO' | 'BAJO' | 'NORMAL' | 'ALTO';
  estado: string;
}

export interface Almacen {
  id_almacen: number;
  nombre: string;
  descripcion: string;
}

export interface Clase {
  id_clase: number;
  nombre: string;
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTooltipModule,
    PrimeDataTableComponent,
  ],
  templateUrl: './stock.html',
  styleUrls: ['./stock.scss'],
})
export class StockComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  dropdownExportAbierto = false;
  stocks: Stock[] = [];

  tableState: TableState = {
    loading: false,
    error: false,
    empty: false,
    filteredEmpty: false
  };

  columns: TableColumn[] = [
    {
      key: 'codigo_fox',
      title: 'Código',
      sortable: true,
      filterable: true,
      width: '120px',
      type: 'text'
    },
    {
      key: 'nombre_material',
      title: 'Material',
      sortable: true,
      filterable: true,
      width: '200px',
      type: 'text'
    },
    {
      key: 'nombre_almacen',
      title: 'Almacén',
      sortable: true,
      filterable: true,
      width: '150px',
      type: 'text'
    },
    {
      key: 'clase',
      title: 'Clase',
      sortable: true,
      filterable: true,
      width: '130px',
      type: 'badge'
    },
    {
      key: 'cantidad_actual',
      title: 'Stock',
      sortable: true,
      filterable: false,
      width: '100px',
      type: 'number'
    },
    {
      key: 'estado',
      title: 'Estado',
      sortable: true,
      filterable: true,
      width: '120px',
      type: 'badge'
    },
    {
      key: 'valor_total',
      title: 'Valor Total',
      sortable: true,
      filterable: false,
      width: '120px',
      type: 'currency'
    },
    {
      key: 'unidad',
      title: 'Unidad',
      sortable: false,
      filterable: true,
      width: '80px',
      type: 'text'
    }
  ];

  actions: TableAction[] = [
    {
      action: 'view',
      tooltip: 'Ver Detalle',
      icon: 'pi pi-eye',
      color: 'primary'
    },
    {
      action: 'edit',
      tooltip: 'Editar',
      icon: 'pi pi-pencil',
      color: 'secondary'
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
      label: 'Agregar Stock',
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

  globalFilterFields: string[] = ['codigo_fox', 'nombre_material', 'nombre_almacen', 'clase', 'unidad', 'estado'];

  constructor(
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
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
    this.tableState.empty = this.stocks.length === 0;
  }

  private async cargarDatos() {
    this.tableState.loading = true;
    this.tableState.error = false;
    this.tableState.errorMessage = '';

    try {
      this.cargarDatosMock();
    } catch (error) {
      this.tableState.error = true;
      this.tableState.errorMessage = 'Error al cargar los datos de stock';
      console.error('Error cargando stock:', error);
      this.stocks = [];
    } finally {
      this.tableState.loading = false;
      this.updateTableStates();
    }
  }

  recargarDatos(): void {
    this.cargarDatos();
  }

  private cargarDatosMock() {
    this.stocks = [
      {
        id_insumo: 1,
        codigo_fox: 'MT001',
        nombre: 'Harina de Trigo Premium',
        nombre_material: 'Harina de Trigo Premium',
        id_almacen: 1,
        almacen: 'Almacén Principal',
        nombre_almacen: 'Almacén Principal',
        id_clase: 1,
        clase: 'Materia Prima',
        id_unidad: 1,
        unidad: 'KG',
        stock_actual: 250,
        cantidad_actual: 250,
        stock_minimo: 100,
        stock_maximo: 500,
        costo_unitario: 2.5,
        precio_unitario: 2.5,
        valor_total: 625,
        fecha_ultimo_movimiento: '2024-01-15',
        estado_stock: 'NORMAL',
        estado: 'NORMAL',
      },
      {
        id_insumo: 2,
        codigo_fox: 'MT002',
        nombre: 'Azúcar Blanca',
        nombre_material: 'Azúcar Blanca',
        id_almacen: 1,
        almacen: 'Almacén Principal',
        nombre_almacen: 'Almacén Principal',
        id_clase: 1,
        clase: 'Materia Prima',
        id_unidad: 1,
        unidad: 'KG',
        stock_actual: 75,
        cantidad_actual: 75,
        stock_minimo: 80,
        stock_maximo: 300,
        costo_unitario: 1.8,
        precio_unitario: 1.8,
        valor_total: 135,
        fecha_ultimo_movimiento: '2024-01-14',
        estado_stock: 'BAJO',
        estado: 'BAJO',
      },
      {
        id_insumo: 3,
        codigo_fox: 'MT003',
        nombre: 'Mantequilla Sin Sal',
        nombre_material: 'Mantequilla Sin Sal',
        id_almacen: 2,
        almacen: 'Cámara Fría',
        nombre_almacen: 'Cámara Fría',
        id_clase: 2,
        clase: 'Lácteos',
        id_unidad: 1,
        unidad: 'KG',
        stock_actual: 15,
        cantidad_actual: 15,
        stock_minimo: 20,
        stock_maximo: 100,
        costo_unitario: 8.5,
        precio_unitario: 8.5,
        valor_total: 127.5,
        fecha_ultimo_movimiento: '2024-01-16',
        estado_stock: 'CRITICO',
        estado: 'CRITICO',
      },
      {
        id_insumo: 4,
        codigo_fox: 'MT004',
        nombre: 'Levadura Seca',
        nombre_material: 'Levadura Seca',
        id_almacen: 1,
        almacen: 'Almacén Principal',
        nombre_almacen: 'Almacén Principal',
        id_clase: 3,
        clase: 'Aditivos',
        id_unidad: 2,
        unidad: 'GR',
        stock_actual: 800,
        cantidad_actual: 800,
        stock_minimo: 200,
        stock_maximo: 1000,
        costo_unitario: 0.05,
        precio_unitario: 0.05,
        valor_total: 40,
        fecha_ultimo_movimiento: '2024-01-13',
        estado_stock: 'ALTO',
        estado: 'ALTO',
      },
      {
        id_insumo: 5,
        codigo_fox: 'MT005',
        nombre: 'Chocolate Negro 70%',
        nombre_material: 'Chocolate Negro 70%',
        id_almacen: 3,
        almacen: 'Almacén Especiales',
        nombre_almacen: 'Almacén Especiales',
        id_clase: 4,
        clase: 'Chocolatería',
        id_unidad: 1,
        unidad: 'KG',
        stock_actual: 180,
        cantidad_actual: 180,
        stock_minimo: 50,
        stock_maximo: 200,
        costo_unitario: 12.0,
        precio_unitario: 12.0,
        valor_total: 2160,
        fecha_ultimo_movimiento: '2024-01-12',
        estado_stock: 'NORMAL',
        estado: 'NORMAL',
      },
      {
        id_insumo: 6,
        codigo_fox: 'MT006',
        nombre: 'Sal Marina Fina',
        nombre_material: 'Sal Marina Fina',
        id_almacen: 1,
        almacen: 'Almacén Principal',
        nombre_almacen: 'Almacén Principal',
        id_clase: 5,
        clase: 'Condimentos',
        id_unidad: 1,
        unidad: 'KG',
        stock_actual: 45,
        cantidad_actual: 45,
        stock_minimo: 30,
        stock_maximo: 150,
        costo_unitario: 1.2,
        precio_unitario: 1.2,
        valor_total: 54,
        fecha_ultimo_movimiento: '2024-01-11',
        estado_stock: 'NORMAL',
        estado: 'NORMAL',
      },
    ];

    console.log('✅ Datos mock cargados:', this.stocks.length, 'stocks');
  }

  formatearCodigo(codigo: string): string {
    return codigo || '---';
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  formatearMoneda(valor: number): string {
    if (!valor || valor === 0) return '$0.00';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(valor);
  }

  formatearNumero(valor: number): string {
    if (!valor && valor !== 0) return '0';
    return new Intl.NumberFormat('es-PE').format(valor);
  }

  getEstadoTexto(estado: string): string {
    const estados: Record<string, string> = {
      CRITICO: 'Crítico',
      BAJO: 'Stock Bajo',
      NORMAL: 'Normal',
      ALTO: 'Stock Alto',
    };
    return estados[estado] || estado;
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: Record<string, string> = {
      CRITICO: 'badge-danger',
      BAJO: 'badge-warning',
      NORMAL: 'badge-success',
      ALTO: 'badge-info',
    };
    return clases[estado] || 'badge-neutral';
  }

  sortData(column: string): void {
    console.log('Ordenando por:', column);
  }

  verDetalle(stock: Stock): void {
    import('../shared/dialogs/detalle-dialog/detalle-dialog.component').then(
      ({ DetalleDialogComponent }) => {
        import('../shared/configs/stock-config').then(
          ({ StockConfig }) => {
            const dialogRef = this.dialog.open(DetalleDialogComponent, {
              width: '800px',
              disableClose: true,
              data: StockConfig.getConfiguracionDetalle(stock),
            });
          }
        );
      }
    );
  }

  editar(stock: Stock): void {
    import(
      '../shared/dialogs/formulario-dialog/formulario-dialog.component'
    ).then(({ FormularioDialogComponent }) => {
      import('../shared/configs/stock-config').then(({ StockConfig }) => {
        const config = StockConfig.getConfiguracionFormulario(true, stock);
        
        // Configurar callbacks para los botones de agregar
        config.filas.forEach((fila: any[]) => {
          fila.forEach((campo: any) => {
            if (campo.key === 'nombre_almacen' && campo.conBotonAgregar) {
              campo.onAgregar = () => this.abrirFormularioNuevoAlmacen();
            }
            if (campo.key === 'clase' && campo.conBotonAgregar) {
              campo.onAgregar = () => this.abrirFormularioNuevaClase();
            }
            if (campo.key === 'unidad' && campo.conBotonAgregar) {
              campo.onAgregar = () => this.abrirFormularioNuevaUnidad();
            }
          });
        });
        
        const dialogRef = this.dialog.open(FormularioDialogComponent, {
          width: '600px',
          disableClose: true,
          data: config,
        });

        dialogRef.afterClosed().subscribe((resultado) => {
          if (resultado?.accion === 'guardar') {
            console.log('Actualizando stock:', resultado.datos);
            this.cargarDatos();
          }
        });
      });
    });
  }

  eliminar(stock: Stock): void {
    import('../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component').then(
      ({ ConfirmacionDialogComponent }) => {
        const config = {
          titulo: 'Eliminar Stock',
          subtitulo: 'Esta acción no se puede deshacer',
          mensaje: `¿Está seguro que desea eliminar el stock de "${stock.nombre_material}"?`,
          mensajeSecundario: 'Todos los registros de stock relacionados se perderán permanentemente.',
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
          if (confirmado && stock.id_insumo) {
            console.log('Eliminar stock:', stock);
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
      import('../shared/configs/stock-config').then(({ StockConfig }) => {
        const config = StockConfig.getConfiguracionFormulario(false);
        
        // Configurar callbacks para los botones de agregar
        config.filas.forEach((fila: any[]) => {
          fila.forEach((campo: any) => {
            if (campo.key === 'nombre_almacen' && campo.conBotonAgregar) {
              campo.onAgregar = () => this.abrirFormularioNuevoAlmacen();
            }
            if (campo.key === 'clase' && campo.conBotonAgregar) {
              campo.onAgregar = () => this.abrirFormularioNuevaClase();
            }
            if (campo.key === 'unidad' && campo.conBotonAgregar) {
              campo.onAgregar = () => this.abrirFormularioNuevaUnidad();
            }
          });
        });
        
        const dialogRef = this.dialog.open(FormularioDialogComponent, {
          width: '600px',
          disableClose: true,
          data: config,
        });

        dialogRef.afterClosed().subscribe((resultado) => {
          if (resultado?.accion === 'guardar') {
            console.log('Creando stock:', resultado.datos);
            this.cargarDatos();
          }
        });
      });
    });
  }
  
  private async abrirFormularioNuevoAlmacen(): Promise<void> {
    const { AlmacenesConfig } = await import('../shared/configs/almacenes-config');
    const configAlmacen = AlmacenesConfig.getConfiguracionFormulario(false);
    
    import('../shared/dialogs/formulario-dialog/formulario-dialog.component').then(
      ({ FormularioDialogComponent }) => {
        const dialogRef = this.dialog.open(FormularioDialogComponent, {
          width: '700px',
          data: {
            ...configAlmacen,
            titulo: {
              agregar: 'Registrar Nuevo Almacén',
              editar: 'Editar Almacén'
            },
            mensajeAdicional: 'Complete los datos del nuevo almacén. Una vez registrado, podrá seleccionarlo en el formulario de stock.'
          },
          disableClose: true
        });
        
        dialogRef.afterClosed().subscribe(resultadoAlmacen => {
          if (resultadoAlmacen && resultadoAlmacen.accion === 'guardar') {
            console.log('Almacén creado exitosamente:', resultadoAlmacen.datos);
            this.mostrarMensajeExito(`Almacén "${resultadoAlmacen.datos.nombre}" registrado exitosamente.`);
          }
        });
      }
    );
  }
  
  private async abrirFormularioNuevaClase(): Promise<void> {
    const { ClasesConfig } = await import('../shared/configs/clases-config');
    const configClase = ClasesConfig.getConfiguracionFormulario(false);
    
    import('../shared/dialogs/formulario-dialog/formulario-dialog.component').then(
      ({ FormularioDialogComponent }) => {
        const dialogRef = this.dialog.open(FormularioDialogComponent, {
          width: '700px',
          data: {
            ...configClase,
            titulo: {
              agregar: 'Registrar Nueva Clase',
              editar: 'Editar Clase'
            },
            mensajeAdicional: 'Complete los datos de la nueva clase. Una vez registrada, podrá seleccionarla en el formulario de stock.'
          },
          disableClose: true
        });
        
        dialogRef.afterClosed().subscribe(resultadoClase => {
          if (resultadoClase && resultadoClase.accion === 'guardar') {
            console.log('Clase creada exitosamente:', resultadoClase.datos);
            this.mostrarMensajeExito(`Clase "${resultadoClase.datos.id_clase}" registrada exitosamente.`);
          }
        });
      }
    );
  }
  
  private async abrirFormularioNuevaUnidad(): Promise<void> {
    const { UnidadesConfig } = await import('../shared/configs/unidades-config');
    const configUnidad = UnidadesConfig.getConfiguracionFormulario(false);
    
    import('../shared/dialogs/formulario-dialog/formulario-dialog.component').then(
      ({ FormularioDialogComponent }) => {
        const dialogRef = this.dialog.open(FormularioDialogComponent, {
          width: '600px',
          data: {
            ...configUnidad,
            titulo: {
              agregar: 'Registrar Nueva Unidad',
              editar: 'Editar Unidad'
            },
            mensajeAdicional: 'Complete los datos de la nueva unidad de medida. Una vez registrada, podrá seleccionarla en el formulario de stock.'
          },
          disableClose: true
        });
        
        dialogRef.afterClosed().subscribe(resultadoUnidad => {
          if (resultadoUnidad && resultadoUnidad.accion === 'guardar') {
            console.log('Unidad creada exitosamente:', resultadoUnidad.datos);
            this.mostrarMensajeExito(`Unidad "${resultadoUnidad.datos.nombre}" registrada exitosamente.`);
          }
        });
      }
    );
  }
  
  private mostrarMensajeExito(mensaje: string): void {
    import('../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component').then(
      ({ ConfirmacionDialogComponent }) => {
        this.dialog.open(ConfirmacionDialogComponent, {
          width: '500px',
          data: {
            tipo: 'success',
            titulo: 'Éxito',
            mensaje: mensaje,
            textoBotonConfirmar: 'Entendido',
            ocultarCancelar: true
          }
        });
      }
    );
  }

  private configurarExportacion(): ConfiguracionExportacion<Stock> {
    return {
      entidades: this.stocks,
      nombreArchivo: 'stock',
      nombreEntidad: 'Stock de Inventario',
      columnas: [
        { campo: 'codigo_fox', titulo: 'Código', formato: 'texto' },
        { campo: 'nombre_material', titulo: 'Material', formato: 'texto' },
        { campo: 'nombre_almacen', titulo: 'Almacén', formato: 'texto' },
        { campo: 'clase', titulo: 'Clase', formato: 'texto' },
        { campo: 'cantidad_actual', titulo: 'Stock Actual', formato: 'numero' },
        { campo: 'stock_minimo', titulo: 'Stock Mínimo', formato: 'numero' },
        { campo: 'stock_maximo', titulo: 'Stock Máximo', formato: 'numero' },
        { campo: 'unidad', titulo: 'Unidad', formato: 'texto' },
        {
          campo: 'precio_unitario',
          titulo: 'Precio Unitario',
          formato: 'moneda',
        },
        { campo: 'valor_total', titulo: 'Valor Total', formato: 'moneda' },
        { campo: 'estado', titulo: 'Estado', formato: 'texto' },
        {
          campo: 'fecha_ultimo_movimiento',
          titulo: 'Último Movimiento',
          formato: 'fecha',
        },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.stocks.length,
        cantidadFiltrada: this.stocks.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Stock> {
    return {
      tipoEntidad: 'stock',
      mapeoColumnas: [
        {
          columnaArchivo: 'Código',
          campoEntidad: 'codigo_fox',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Material',
          campoEntidad: 'nombre_material',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Almacén',
          campoEntidad: 'nombre_almacen',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Clase',
          campoEntidad: 'clase',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Stock Actual',
          campoEntidad: 'cantidad_actual',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Stock Mínimo',
          campoEntidad: 'stock_minimo',
          obligatorio: false,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Stock Máximo',
          campoEntidad: 'stock_maximo',
          obligatorio: false,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Unidad',
          campoEntidad: 'unidad',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Precio Unitario',
          campoEntidad: 'precio_unitario',
          obligatorio: false,
          tipoEsperado: 'numero',
        },
      ],
      validaciones: [
        {
          campo: 'codigo_fox',
          validador: (valor) => valor && valor.length <= 20,
          mensajeError: 'El código debe tener máximo 20 caracteres',
        },
        {
          campo: 'cantidad_actual',
          validador: (valor) => valor >= 0,
          mensajeError: 'El stock actual debe ser mayor o igual a 0',
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