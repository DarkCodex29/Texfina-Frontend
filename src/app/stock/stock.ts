import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
} from '../services/carga-masiva.service';
import { CargaMasivaDialogComponent } from '../materiales/carga-masiva-dialog/carga-masiva-dialog.component';

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
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  templateUrl: './stock.html',
  styleUrls: ['./stock.scss'],
})
export class StockComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoading = false;
  hasError = false;
  errorMessage = '';
  dropdownExportAbierto = false;

  stocks: Stock[] = [];
  almacenes: Almacen[] = [];
  clases: Clase[] = [];
  dataSource = new MatTableDataSource<Stock>([]);
  displayedColumns: string[] = [
    'codigo',
    'material',
    'almacen',
    'clase',
    'stock',
    'estado',
    'valor',
    'acciones',
  ];

  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosColumnaHabilitados = false;
  private destroy$ = new Subject<void>();

  totalItems = 0;
  valorTotalInventario = 0;
  itemsCriticos = 0;
  itemsBajos = 0;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {
    this.filtroGeneralForm = this.fb.group({
      busquedaGeneral: [''],
    });

    this.filtrosColumnaForm = this.fb.group({
      codigo: [''],
      material: [''],
      almacen: [''],
      clase: [''],
      stock: [''],
      estado: [''],
      valor: [''],
    });
  }

  ngOnInit() {
    this.configurarFiltros();
    this.cargarDatos();
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isEmpty(): boolean {
    return !this.isLoading && !this.hasError && this.stocks.length === 0;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      !this.hasError &&
      this.stocks.length > 0 &&
      this.dataSource.filteredData.length === 0
    );
  }

  private configurarFiltros() {
    this.filtroGeneralForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltroGeneral();
      });
  }

  private async cargarDatos() {
    this.isLoading = true;
    this.hasError = false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.cargarDatosMock();
      this.calcularEstadisticas();
    } catch (error) {
      this.hasError = true;
      this.errorMessage = 'Error al cargar los datos de stock';
      console.error('Error cargando stock:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private cargarDatosMock() {
    this.almacenes = [
      {
        id_almacen: 1,
        nombre: 'Almacén Principal',
        descripcion: 'Almacén central de materias primas',
      },
      {
        id_almacen: 2,
        nombre: 'Almacén Secundario',
        descripcion: 'Almacén de productos terminados',
      },
      {
        id_almacen: 3,
        nombre: 'Almacén de Tránsito',
        descripcion: 'Almacén temporal de mercancías',
      },
    ];

    this.clases = [
      { id_clase: 1, nombre: 'Materias Primas' },
      { id_clase: 2, nombre: 'Productos Terminados' },
      { id_clase: 3, nombre: 'Insumos Auxiliares' },
    ];

    this.stocks = [
      {
        id_insumo: 1,
        codigo_fox: 'MT001',
        nombre: 'Acetato de Sodio',
        nombre_material: 'Acetato de Sodio',
        id_almacen: 1,
        almacen: 'Almacén Principal',
        nombre_almacen: 'Almacén Principal',
        id_clase: 1,
        clase: 'Materias Primas',
        id_unidad: 1,
        unidad: 'kg',
        stock_actual: 150.5,
        cantidad_actual: 150.5,
        stock_minimo: 50.0,
        stock_maximo: 300.0,
        costo_unitario: 125.0,
        precio_unitario: 125.0,
        valor_total: 18812.5,
        fecha_ultimo_movimiento: '2024-01-15',
        estado_stock: 'NORMAL',
        estado: 'NORMAL',
      },
      {
        id_insumo: 2,
        codigo_fox: 'MT002',
        nombre: 'Bicarbonato de Sodio',
        nombre_material: 'Bicarbonato de Sodio',
        id_almacen: 1,
        almacen: 'Almacén Principal',
        nombre_almacen: 'Almacén Principal',
        id_clase: 1,
        clase: 'Materias Primas',
        id_unidad: 1,
        unidad: 'kg',
        stock_actual: 25.0,
        cantidad_actual: 25.0,
        stock_minimo: 30.0,
        stock_maximo: 150.0,
        costo_unitario: 95.0,
        precio_unitario: 95.0,
        valor_total: 2375.0,
        fecha_ultimo_movimiento: '2024-01-14',
        estado_stock: 'BAJO',
        estado: 'BAJO',
      },
      {
        id_insumo: 3,
        codigo_fox: 'MT003',
        nombre: 'Carbonato de Calcio',
        nombre_material: 'Carbonato de Calcio',
        id_almacen: 2,
        almacen: 'Almacén Secundario',
        nombre_almacen: 'Almacén Secundario',
        id_clase: 1,
        clase: 'Materias Primas',
        id_unidad: 1,
        unidad: 'kg',
        stock_actual: 8.0,
        cantidad_actual: 8.0,
        stock_minimo: 20.0,
        stock_maximo: 100.0,
        costo_unitario: 85.0,
        precio_unitario: 85.0,
        valor_total: 680.0,
        fecha_ultimo_movimiento: '2024-01-13',
        estado_stock: 'CRITICO',
        estado: 'CRITICO',
      },
      {
        id_insumo: 4,
        codigo_fox: 'PT001',
        nombre: 'Polvo Efervescente Naranja',
        nombre_material: 'Polvo Efervescente Naranja',
        id_almacen: 2,
        almacen: 'Almacén Secundario',
        nombre_almacen: 'Almacén Secundario',
        id_clase: 2,
        clase: 'Productos Terminados',
        id_unidad: 2,
        unidad: 'pcs',
        stock_actual: 245.0,
        cantidad_actual: 245.0,
        stock_minimo: 100.0,
        stock_maximo: 500.0,
        costo_unitario: 15.5,
        precio_unitario: 15.5,
        valor_total: 3797.5,
        fecha_ultimo_movimiento: '2024-01-16',
        estado_stock: 'NORMAL',
        estado: 'NORMAL',
      },
      {
        id_insumo: 5,
        codigo_fox: 'IN001',
        nombre: 'Envase Plástico 500ml',
        nombre_material: 'Envase Plástico 500ml',
        id_almacen: 3,
        almacen: 'Almacén de Tránsito',
        nombre_almacen: 'Almacén de Tránsito',
        id_clase: 3,
        clase: 'Insumos Auxiliares',
        id_unidad: 2,
        unidad: 'pcs',
        stock_actual: 1200.0,
        cantidad_actual: 1200.0,
        stock_minimo: 500.0,
        stock_maximo: 2000.0,
        costo_unitario: 2.8,
        precio_unitario: 2.8,
        valor_total: 3360.0,
        fecha_ultimo_movimiento: '2024-01-17',
        estado_stock: 'ALTO',
        estado: 'ALTO',
      },
    ];

    this.dataSource.data = [...this.stocks];
  }

  aplicarFiltroGeneral(): void {
    const filtro =
      this.filtroGeneralForm.get('busquedaGeneral')?.value?.toLowerCase() || '';

    if (!filtro.trim()) {
      this.dataSource.data = [...this.stocks];
      return;
    }

    this.dataSource.data = this.stocks.filter(
      (stock) =>
        stock.codigo_fox.toLowerCase().includes(filtro) ||
        stock.nombre.toLowerCase().includes(filtro) ||
        stock.almacen.toLowerCase().includes(filtro) ||
        stock.clase.toLowerCase().includes(filtro) ||
        stock.unidad.toLowerCase().includes(filtro) ||
        this.getEstadoTexto(stock.estado_stock).toLowerCase().includes(filtro)
    );
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.get('busquedaGeneral')?.setValue('');
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
  }

  formatearCodigo(codigo: string): string {
    return codigo?.padStart(5, '0') || '00000';
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  formatearMoneda(valor: number): string {
    if (!valor && valor !== 0) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  }

  formatearNumero(valor: number): string {
    if (!valor && valor !== 0) return '-';
    return new Intl.NumberFormat('es-CO').format(valor);
  }

  getEstadoTexto(estado: string): string {
    const estados: { [key: string]: string } = {
      CRITICO: 'Crítico',
      BAJO: 'Bajo',
      NORMAL: 'Normal',
      ALTO: 'Alto',
    };
    return estados[estado] || estado;
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      CRITICO: 'badge-error',
      BAJO: 'badge-warning',
      NORMAL: 'badge-success',
      ALTO: 'badge-info',
    };
    return clases[estado] || 'badge-neutral';
  }

  getStockClass(estado: string): string {
    const clases: { [key: string]: string } = {
      CRITICO: 'text-error',
      BAJO: 'text-warning',
      NORMAL: 'text-success',
      ALTO: 'text-info',
    };
    return clases[estado] || '';
  }

  calcularEstadisticas() {
    this.totalItems = this.stocks.length;
    this.valorTotalInventario = this.stocks.reduce(
      (sum, stock) => sum + stock.valor_total,
      0
    );
    this.itemsCriticos = this.stocks.filter(
      (stock) => stock.estado_stock === 'CRITICO'
    ).length;
    this.itemsBajos = this.stocks.filter(
      (stock) => stock.estado_stock === 'BAJO'
    ).length;
  }

  sortData(column: string) {
    console.log('Ordenando por:', column);
  }

  verDetalle(stock: Stock) {
    console.log('Ver detalle:', stock);
  }

  editar(stock: Stock) {
    console.log('Editar stock:', stock);
  }

  eliminar(stock: Stock): void {
    const confirmacion = confirm(
      `¿Está seguro que desea eliminar el stock de ${stock.nombre}?`
    );
    if (confirmacion && stock.id_insumo) {
      console.log('Eliminar stock:', stock);
      this.snackBar.open('Stock eliminado correctamente', 'Cerrar', {
        duration: 3000,
      });
      this.cargarDatos();
    }
  }

  agregar(): void {
    console.log('Agregar stock');
  }

  private configurarExportacion(): ConfiguracionExportacion<Stock> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'stock',
      nombreEntidad: 'Stock',
      columnas: [
        { campo: 'codigo_fox', titulo: 'Código', formato: 'texto' },
        { campo: 'nombre', titulo: 'Material', formato: 'texto' },
        { campo: 'almacen', titulo: 'Almacén', formato: 'texto' },
        { campo: 'clase', titulo: 'Clase', formato: 'texto' },
        { campo: 'stock_actual', titulo: 'Stock Actual', formato: 'numero' },
        { campo: 'stock_minimo', titulo: 'Stock Mínimo', formato: 'numero' },
        { campo: 'stock_maximo', titulo: 'Stock Máximo', formato: 'numero' },
        { campo: 'estado_stock', titulo: 'Estado', formato: 'texto' },
        { campo: 'valor_total', titulo: 'Valor Total', formato: 'moneda' },
        {
          campo: 'fecha_ultimo_movimiento',
          titulo: 'Último Movimiento',
          formato: 'fecha',
        },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.stocks.length,
        cantidadFiltrada: this.dataSource.data.length,
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
          campoEntidad: 'nombre',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Almacén',
          campoEntidad: 'almacen',
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
          campoEntidad: 'stock_actual',
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
      ],
      validaciones: [
        {
          campo: 'codigo_fox',
          validador: (valor) => valor && valor.length <= 50,
          mensajeError: 'El código debe tener máximo 50 caracteres',
        },
        {
          campo: 'nombre',
          validador: (valor) => valor && valor.length <= 200,
          mensajeError: 'El nombre debe tener máximo 200 caracteres',
        },
        {
          campo: 'stock_actual',
          validador: (valor) => !isNaN(Number(valor)) && Number(valor) >= 0,
          mensajeError: 'El stock actual debe ser un número mayor o igual a 0',
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
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
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
      .catch((error) => {
        console.error('Error procesando archivo:', error);
      });
  }

  private obtenerFiltrosActivos(): any {
    return {
      busquedaGeneral:
        this.filtroGeneralForm.get('busquedaGeneral')?.value || '',
    };
  }

  reintentarCarga() {
    this.cargarDatos();
  }
}
