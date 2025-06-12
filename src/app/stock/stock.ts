import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  templateUrl: './stock.html',
  styleUrls: ['./stock.scss'],
})
export class StockComponent implements OnInit {
  filtrosForm: FormGroup;
  stocks: Stock[] = [];
  stocksFiltrados: Stock[] = [];
  almacenes: Almacen[] = [];
  clases: Clase[] = [];

  displayedColumns: string[] = [
    'codigo',
    'material',
    'almacen',
    'stock_actual',
    'estado',
    'valor',
  ];

  // Estadísticas
  totalItems = 0;
  valorTotalInventario = 0;
  itemsCriticos = 0;
  itemsBajos = 0;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.filtrosForm = this.fb.group({
      codigo: [''],
      nombre: [''],
      almacen: [''],
      clase: [''],
      estado_stock: [''],
      stock_minimo: [''],
      stock_maximo: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.calcularEstadisticas();
  }

  cargarDatos(): void {
    // Simular datos de almacenes
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

    // Simular datos de clases
    this.clases = [
      { id_clase: 1, nombre: 'Fibras Naturales' },
      { id_clase: 2, nombre: 'Fibras Sintéticas' },
      { id_clase: 3, nombre: 'Hilos' },
      { id_clase: 4, nombre: 'Telas' },
      { id_clase: 5, nombre: 'Accesorios' },
    ];

    // Simular datos de stock
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
        estado_stock: 'ALTO',
      },
      {
        id_insumo: 5,
        codigo_fox: 'ACC005',
        nombre: 'Botones Plásticos 4 orif.',
        id_almacen: 1,
        almacen: 'Almacén Principal',
        id_clase: 5,
        clase: 'Accesorios',
        id_unidad: 3,
        unidad: 'und',
        stock_actual: 15000,
        stock_minimo: 5000,
        stock_maximo: 50000,
        costo_unitario: 0.05,
        valor_total: 750.0,
        fecha_ultimo_movimiento: '2024-01-11',
        estado_stock: 'NORMAL',
      },
      {
        id_insumo: 6,
        codigo_fox: 'LYC006',
        nombre: 'Lycra Elastane 40D',
        id_almacen: 3,
        almacen: 'Almacén de Tránsito',
        id_clase: 2,
        clase: 'Fibras Sintéticas',
        id_unidad: 1,
        unidad: 'kg',
        stock_actual: 180,
        stock_minimo: 200,
        stock_maximo: 1000,
        costo_unitario: 45.6,
        valor_total: 8208.0,
        fecha_ultimo_movimiento: '2024-01-09',
        estado_stock: 'BAJO',
      },
    ];

    this.stocksFiltrados = [...this.stocks];
  }

  buscar(): void {
    const filtros = this.filtrosForm.value;

    this.stocksFiltrados = this.stocks.filter((stock) => {
      return (
        (!filtros.codigo ||
          stock.codigo_fox
            .toLowerCase()
            .includes(filtros.codigo.toLowerCase())) &&
        (!filtros.nombre ||
          stock.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())) &&
        (!filtros.almacen || stock.id_almacen.toString() === filtros.almacen) &&
        (!filtros.clase || stock.id_clase.toString() === filtros.clase) &&
        (!filtros.estado_stock ||
          stock.estado_stock === filtros.estado_stock) &&
        (!filtros.stock_minimo || stock.stock_actual >= filtros.stock_minimo) &&
        (!filtros.stock_maximo || stock.stock_actual <= filtros.stock_maximo)
      );
    });

    this.calcularEstadisticas();
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.stocksFiltrados = [...this.stocks];
    this.calcularEstadisticas();
  }

  calcularEstadisticas(): void {
    this.totalItems = this.stocksFiltrados.length;
    this.valorTotalInventario = this.stocksFiltrados.reduce(
      (sum, stock) => sum + stock.valor_total,
      0
    );
    this.itemsCriticos = this.stocksFiltrados.filter(
      (s) => s.estado_stock === 'CRITICO'
    ).length;
    this.itemsBajos = this.stocksFiltrados.filter(
      (s) => s.estado_stock === 'BAJO'
    ).length;
  }

  exportarExcel(): void {
    this.snackBar.open('Exportando a Excel...', 'Cerrar', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });

    setTimeout(() => {
      this.snackBar.open('Reporte exportado exitosamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['snackbar-success'],
      });
    }, 2000);
  }

  verMovimientos(stock: Stock): void {
    this.snackBar.open(
      `Abriendo historial de movimientos para ${stock.nombre}`,
      'Cerrar',
      {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      }
    );
  }

  formatearCodigo(codigo: string): string {
    return codigo || 'N/A';
  }

  formatearMoneda(valor: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(valor);
  }

  formatearNumero(valor: number): string {
    return new Intl.NumberFormat('es-PE').format(valor);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-PE');
  }

  getColorEstado(estado: string): string {
    switch (estado) {
      case 'CRITICO':
        return 'critico';
      case 'BAJO':
        return 'bajo';
      case 'NORMAL':
        return 'normal';
      case 'ALTO':
        return 'alto';
      default:
        return 'normal';
    }
  }

  getNombreAlmacen(id: number): string {
    const almacen = this.almacenes.find((a) => a.id_almacen === id);
    return almacen ? almacen.nombre : 'N/A';
  }

  getNombreClase(id: number): string {
    const clase = this.clases.find((c) => c.id_clase === id);
    return clase ? clase.nombre : 'N/A';
  }

  getEstadoStockClass(estado: string): string {
    switch (estado) {
      case 'CRITICO':
        return 'stock-critico';
      case 'BAJO':
        return 'stock-bajo';
      case 'NORMAL':
        return 'stock-normal';
      case 'ALTO':
        return 'stock-alto';
      default:
        return 'stock-normal';
    }
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'CRITICO':
        return 'badge-primary';
      case 'BAJO':
        return 'badge-warning';
      case 'NORMAL':
        return 'badge-success';
      case 'ALTO':
        return 'badge-secondary';
      default:
        return 'badge-neutral';
    }
  }
}
