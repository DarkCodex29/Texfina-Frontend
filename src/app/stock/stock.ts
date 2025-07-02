import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  finalize,
  delay,
} from 'rxjs/operators';
import { MaterialService } from '../services/material.service';
import {
  ExportacionService,
  ConfiguracionExportacion,
  ColumnaExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
  MapeoColumna,
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
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatPaginatorModule,
    MatCardModule,
    MatSortModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './stock.html',
  styleUrls: ['./stock.scss'],
})
export class StockComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;

  stocks: Stock[] = [];
  dataSource = new MatTableDataSource<Stock>([]);
  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosExpanded = true;
  filtrosColumnaHabilitados = false;
  filtrosColumnaActivos = false;
  dropdownExportAbierto = false;
  private destroy$ = new Subject<void>();

  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

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

  get stockFiltrado(): Stock[] {
    return this.dataSource.data;
  }

  get isEmpty(): boolean {
    return !this.isLoading && this.stocks.length === 0 && !this.hasError;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      this.dataSource.data.length === 0 &&
      this.stocks.length > 0
    );
  }

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {
    this.filtroGeneralForm = this.fb.group({ busquedaGeneral: [''] });
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

  ngAfterViewInit() {
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private configurarFiltros() {
    this.filtroGeneralForm
      .get('busquedaGeneral')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.aplicarFiltroGeneral();
      });

    this.filtrosColumnaForm.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltrosColumna();
        this.verificarFiltrosColumnaActivos();
      });
  }

  cargarDatos(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    of(null)
      .pipe(
        delay(800),
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.cargarDatosMock();
          this.aplicarFiltroGeneral();
        },
        error: (error: any) => {
          this.hasError = true;
          this.errorMessage = 'Error al cargar datos de stock';
          console.error('Error:', error);
        },
      });
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

    this.dataSource.data = this.stocks;
  }

  aplicarFiltroGeneral(): void {
    const filtro =
      this.filtroGeneralForm.get('busquedaGeneral')?.value?.toLowerCase() || '';

    if (!filtro) {
      this.dataSource.data = this.stocks;
      return;
    }

    this.dataSource.data = this.stocks.filter(
      (stock) =>
        stock.codigo_fox.toLowerCase().includes(filtro) ||
        stock.nombre_material.toLowerCase().includes(filtro) ||
        stock.nombre_almacen.toLowerCase().includes(filtro) ||
        stock.clase.toLowerCase().includes(filtro) ||
        stock.unidad.toLowerCase().includes(filtro) ||
        stock.estado.toLowerCase().includes(filtro)
    );
  }

  private aplicarFiltrosColumna(): void {
    const filtros = this.filtrosColumnaForm.value;
    let stockFiltrado = [...this.stocks];

    Object.keys(filtros).forEach((key) => {
      const valor = filtros[key];
      if (valor && valor.trim()) {
        switch (key) {
          case 'codigo':
            stockFiltrado = stockFiltrado.filter((s) =>
              s.codigo_fox.toLowerCase().includes(valor.toLowerCase())
            );
            break;
          case 'material':
            stockFiltrado = stockFiltrado.filter((s) =>
              s.nombre_material.toLowerCase().includes(valor.toLowerCase())
            );
            break;
          case 'almacen':
            stockFiltrado = stockFiltrado.filter((s) =>
              s.nombre_almacen.toLowerCase().includes(valor.toLowerCase())
            );
            break;
          case 'clase':
            stockFiltrado = stockFiltrado.filter((s) =>
              s.clase.toLowerCase().includes(valor.toLowerCase())
            );
            break;
          case 'stock':
            const stockValue = parseFloat(valor);
            if (!isNaN(stockValue)) {
              stockFiltrado = stockFiltrado.filter(
                (s) => s.cantidad_actual >= stockValue
              );
            }
            break;
          case 'estado':
            stockFiltrado = stockFiltrado.filter((s) =>
              s.estado.toLowerCase().includes(valor.toLowerCase())
            );
            break;
          case 'valor':
            const valorValue = parseFloat(valor);
            if (!isNaN(valorValue)) {
              stockFiltrado = stockFiltrado.filter(
                (s) => s.valor_total >= valorValue
              );
            }
            break;
        }
      }
    });

    this.dataSource.data = stockFiltrado;
  }

  private verificarFiltrosColumnaActivos(): void {
    const filtros = this.filtrosColumnaForm.value;
    this.filtrosColumnaActivos = Object.values(filtros).some(
      (valor) => valor && valor.toString().trim()
    );
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.reset();
    this.aplicarFiltroGeneral();
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
    this.aplicarFiltrosColumna();
    this.verificarFiltrosColumnaActivos();
  }

  toggleFiltrosColumna(): void {
    this.filtrosColumnaHabilitados = !this.filtrosColumnaHabilitados;
    if (!this.filtrosColumnaHabilitados) {
      this.limpiarFiltrosColumna();
    }
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
    console.log('Ver detalle stock:', stock);
  }

  editar(stock: Stock): void {
    console.log('Editar stock:', stock);
  }

  eliminar(stock: Stock): void {
    const confirmacion = confirm(
      `¿Está seguro que desea eliminar el registro de stock para ${stock.nombre_material}?`
    );
    if (confirmacion && stock.id_insumo) {
      console.log('Eliminar stock:', stock);
      this.cargarDatos();
    }
  }

  agregar(): void {
    console.log('Agregar nuevo stock');
  }

  reintentarCarga(): void {
    this.cargarDatos();
  }

  private configurarExportacion(): ConfiguracionExportacion<Stock> {
    return {
      entidades: this.dataSource.data,
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
    return {
      busquedaGeneral: this.filtroGeneralForm.get('busquedaGeneral')?.value,
      filtrosColumna: this.filtrosColumnaForm.value,
    };
  }
}
