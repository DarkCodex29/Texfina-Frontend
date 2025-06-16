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

export interface Stock {
  id_insumo: number;
  codigo_fox: string;
  nombre: string;
  id_almacen: number;
  almacen: string;
  id_clase: number;
  clase: string;
  id_unidad: number;
  unidad: string;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  costo_unitario: number;
  valor_total: number;
  fecha_ultimo_movimiento: string;
  estado_stock: 'CRITICO' | 'BAJO' | 'NORMAL' | 'ALTO';
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
  // Gestión de estado
  isLoading = false;
  hasError = false;
  errorMessage = '';
  filtrosExpanded = false;

  // Datos
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

  // Filtros
  filtrosForm: FormGroup;
  private destroy$ = new Subject<void>();

  // Estadísticas
  totalItems = 0;
  valorTotalInventario = 0;
  itemsCriticos = 0;
  itemsBajos = 0;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.filtrosForm = this.fb.group({
      codigo: [''],
      material: [''],
      almacen: [''],
      clase: [''],
      estado: [''],
    });
  }

  ngOnInit() {
    this.configurarFiltros();
    this.cargarDatos();
  }

  ngAfterViewInit() {
    // Configuración adicional después de la vista
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Computed properties
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

  // Configuración de filtros
  private configurarFiltros() {
    this.filtrosForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltros();
      });
  }

  // Cargar datos
  private async cargarDatos() {
    this.isLoading = true;
    this.hasError = false;

    try {
      // Simular carga de datos
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Cargar datos mock
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
    // Datos de almacenes
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

    // Datos de clases
    this.clases = [
      { id_clase: 1, nombre: 'Fibras Naturales' },
      { id_clase: 2, nombre: 'Fibras Sintéticas' },
      { id_clase: 3, nombre: 'Hilos' },
      { id_clase: 4, nombre: 'Telas' },
      { id_clase: 5, nombre: 'Accesorios' },
    ];

    // Datos de stock
    this.stocks = [
      {
        id_insumo: 1,
        codigo_fox: 'ALG001',
        nombre: 'Algodón Pima Blanco',
        id_almacen: 1,
        almacen: 'Almacén Principal',
        id_clase: 1,
        clase: 'Fibras Naturales',
        id_unidad: 1,
        unidad: 'kg',
        stock_actual: 450,
        stock_minimo: 500,
        stock_maximo: 2000,
        costo_unitario: 8.5,
        valor_total: 3825.0,
        fecha_ultimo_movimiento: '2024-01-10',
        estado_stock: 'BAJO',
      },
      {
        id_insumo: 2,
        codigo_fox: 'POL002',
        nombre: 'Poliéster 150D',
        id_almacen: 1,
        almacen: 'Almacén Principal',
        id_clase: 2,
        clase: 'Fibras Sintéticas',
        id_unidad: 1,
        unidad: 'kg',
        stock_actual: 1250,
        stock_maximo: 3000,
        stock_minimo: 300,
        costo_unitario: 6.75,
        valor_total: 8437.5,
        fecha_ultimo_movimiento: '2024-01-12',
        estado_stock: 'NORMAL',
      },
      {
        id_insumo: 3,
        codigo_fox: 'HIL003',
        nombre: 'Hilo de Algodón 20/1',
        id_almacen: 2,
        almacen: 'Almacén Secundario',
        id_clase: 3,
        clase: 'Hilos',
        id_unidad: 1,
        unidad: 'kg',
        stock_actual: 85,
        stock_minimo: 100,
        stock_maximo: 800,
        costo_unitario: 12.3,
        valor_total: 1045.5,
        fecha_ultimo_movimiento: '2024-01-08',
        estado_stock: 'CRITICO',
      },
      {
        id_insumo: 4,
        codigo_fox: 'TEL004',
        nombre: 'Tela Jersey Modal',
        id_almacen: 2,
        almacen: 'Almacén Secundario',
        id_clase: 4,
        clase: 'Telas',
        id_unidad: 2,
        unidad: 'm',
        stock_actual: 2500,
        stock_minimo: 500,
        stock_maximo: 5000,
        costo_unitario: 15.8,
        valor_total: 39500.0,
        fecha_ultimo_movimiento: '2024-01-15',
        estado_stock: 'NORMAL',
      },
      {
        id_insumo: 5,
        codigo_fox: 'ACC005',
        nombre: 'Botones Plásticos 15mm',
        id_almacen: 3,
        almacen: 'Almacén de Tránsito',
        id_clase: 5,
        clase: 'Accesorios',
        id_unidad: 3,
        unidad: 'und',
        stock_actual: 15000,
        stock_minimo: 5000,
        stock_maximo: 50000,
        costo_unitario: 0.05,
        valor_total: 750.0,
        fecha_ultimo_movimiento: '2024-01-14',
        estado_stock: 'ALTO',
      },
    ];

    this.dataSource.data = this.stocks;
  }

  // Filtros
  toggleFiltros() {
    this.filtrosExpanded = !this.filtrosExpanded;
  }

  aplicarFiltros() {
    const filtros = this.filtrosForm.value;

    this.dataSource.filterPredicate = (stock: Stock) => {
      const codigo = (stock.codigo_fox || '').toLowerCase();
      const material = (stock.nombre || '').toLowerCase();
      const almacen = (stock.almacen || '').toLowerCase();
      const clase = (stock.clase || '').toLowerCase();
      const estado = (stock.estado_stock || '').toLowerCase();

      return (
        (!filtros.codigo || codigo.includes(filtros.codigo.toLowerCase())) &&
        (!filtros.material ||
          material.includes(filtros.material.toLowerCase())) &&
        (!filtros.almacen || almacen.includes(filtros.almacen.toLowerCase())) &&
        (!filtros.clase || clase.includes(filtros.clase.toLowerCase())) &&
        (!filtros.estado || estado.includes(filtros.estado.toLowerCase()))
      );
    };

    this.dataSource.filter = Date.now().toString(); // Trigger filter
  }

  limpiarFiltros() {
    this.filtrosForm.reset();
    this.dataSource.filter = '';
  }

  // Formateo de datos
  formatearCodigo(codigo: string): string {
    return codigo?.toUpperCase() || 'N/A';
  }

  formatearMoneda(valor: number): string {
    if (valor === null || valor === undefined) return 'S/ 0.00';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(valor);
  }

  formatearNumero(valor: number): string {
    if (valor === null || valor === undefined) return '0';
    return valor.toLocaleString('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
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

  // Estadísticas
  calcularEstadisticas() {
    this.totalItems = this.stocks.length;
    this.valorTotalInventario = this.stocks.reduce(
      (total, stock) => total + stock.valor_total,
      0
    );
    this.itemsCriticos = this.stocks.filter(
      (stock) => stock.estado_stock === 'CRITICO'
    ).length;
    this.itemsBajos = this.stocks.filter(
      (stock) => stock.estado_stock === 'BAJO'
    ).length;
  }

  // Acciones de la tabla
  sortData(column: string) {
    // Implementar ordenamiento
    console.log('Ordenar por:', column);
  }

  verMovimientos(stock: Stock) {
    console.log('Ver movimientos de stock:', stock);
    // Implementar navegación o modal de movimientos
  }

  ajustarStockItem(stock: Stock) {
    console.log('Ajustar stock individual:', stock);
    // Implementar navegación o modal de ajuste
  }

  // Acciones principales
  ajustarStock() {
    console.log('Abrir ajuste de stock general');
    // Implementar navegación o modal de ajuste general
  }

  exportarReporte() {
    console.log('Exportar reporte de stock');
    // Implementar exportación de reportes
  }

  reintentarCarga() {
    this.cargarDatos();
  }
}
