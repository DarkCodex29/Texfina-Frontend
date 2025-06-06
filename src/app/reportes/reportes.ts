import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface ReporteInventario {
  id_insumo: number;
  codigo_fox: string;
  nombre: string;
  almacen: string;
  clase: string;
  stock_actual: number;
  costo_unitario: number;
  valor_total: number;
  rotacion: number;
  dias_inventario: number;
}

export interface ReporteMovimiento {
  id_movimiento: number;
  fecha: string;
  tipo_movimiento: 'INGRESO' | 'EGRESO' | 'AJUSTE';
  codigo_fox: string;
  material: string;
  cantidad: number;
  almacen: string;
  usuario: string;
  observaciones: string;
}

export interface KPI {
  nombre: string;
  valor: string;
  descripcion: string;
  tendencia: 'up' | 'down' | 'stable';
  porcentaje?: number;
}

@Component({
  selector: 'app-reportes',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.scss'],
})
export class ReportesComponent implements OnInit {
  filtrosForm: FormGroup;
  reporteInventario: ReporteInventario[] = [];
  reporteMovimientos: ReporteMovimiento[] = [];
  kpis: KPI[] = [];

  almacenes = [
    { id: 1, nombre: 'Almacén Principal' },
    { id: 2, nombre: 'Almacén Secundario' },
    { id: 3, nombre: 'Almacén de Tránsito' },
  ];

  clases = [
    { id: 1, nombre: 'Fibras Naturales' },
    { id: 2, nombre: 'Fibras Sintéticas' },
    { id: 3, nombre: 'Hilos' },
    { id: 4, nombre: 'Telas' },
    { id: 5, nombre: 'Accesorios' },
  ];

  displayedColumnsInventario: string[] = [
    'codigo',
    'material',
    'almacen',
    'clase',
    'stock_actual',
    'valor_total',
    'rotacion',
    'dias_inventario',
  ];

  displayedColumnsMovimientos: string[] = [
    'fecha',
    'tipo',
    'codigo',
    'material',
    'cantidad',
    'almacen',
    'usuario',
  ];

  // Control de carga
  cargandoReporte = false;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.filtrosForm = this.fb.group({
      tipo_reporte: ['inventario'],
      fecha_desde: [''],
      fecha_hasta: [''],
      almacen: [''],
      clase: [''],
      incluir_stock_cero: [false],
    });
  }

  ngOnInit(): void {
    this.cargarKPIs();
    this.generarReporte();
  }

  cargarKPIs(): void {
    this.kpis = [
      {
        nombre: 'Valor Total Inventario',
        valor: 'S/ 485,240.50',
        descripcion: 'Valorización total del inventario',
        tendencia: 'up',
        porcentaje: 12.5,
      },
      {
        nombre: 'Rotación Promedio',
        valor: '4.2x',
        descripcion: 'Rotación promedio anual',
        tendencia: 'stable',
        porcentaje: 0.8,
      },
      {
        nombre: 'Días de Inventario',
        valor: '87 días',
        descripcion: 'Promedio días de inventario',
        tendencia: 'down',
        porcentaje: -5.2,
      },
      {
        nombre: 'Items Críticos',
        valor: '23',
        descripcion: 'Items con stock crítico',
        tendencia: 'up',
        porcentaje: 18.5,
      },
    ];
  }

  generarReporte(): void {
    this.cargandoReporte = true;
    const filtros = this.filtrosForm.value;

    setTimeout(() => {
      if (filtros.tipo_reporte === 'inventario') {
        this.cargarReporteInventario();
      } else {
        this.cargarReporteMovimientos();
      }
      this.cargandoReporte = false;
    }, 1500);
  }

  cargarReporteInventario(): void {
    this.reporteInventario = [
      {
        id_insumo: 1,
        codigo_fox: 'ALG001',
        nombre: 'Algodón Pima Blanco',
        almacen: 'Almacén Principal',
        clase: 'Fibras Naturales',
        stock_actual: 450,
        costo_unitario: 8.5,
        valor_total: 3825.0,
        rotacion: 6.2,
        dias_inventario: 59,
      },
      {
        id_insumo: 2,
        codigo_fox: 'POL002',
        nombre: 'Poliéster 150D',
        almacen: 'Almacén Principal',
        clase: 'Fibras Sintéticas',
        stock_actual: 1250,
        costo_unitario: 6.75,
        valor_total: 8437.5,
        rotacion: 4.8,
        dias_inventario: 76,
      },
      {
        id_insumo: 3,
        codigo_fox: 'HIL003',
        nombre: 'Hilo de Algodón 20/1',
        almacen: 'Almacén Secundario',
        clase: 'Hilos',
        stock_actual: 85,
        costo_unitario: 12.3,
        valor_total: 1045.5,
        rotacion: 12.1,
        dias_inventario: 30,
      },
      {
        id_insumo: 4,
        codigo_fox: 'TEL004',
        nombre: 'Tela Jersey Modal',
        almacen: 'Almacén Secundario',
        clase: 'Telas',
        stock_actual: 2500,
        costo_unitario: 15.8,
        valor_total: 39500.0,
        rotacion: 2.3,
        dias_inventario: 159,
      },
      {
        id_insumo: 5,
        codigo_fox: 'ACC005',
        nombre: 'Botones Plásticos 4 orif.',
        almacen: 'Almacén Principal',
        clase: 'Accesorios',
        stock_actual: 15000,
        costo_unitario: 0.05,
        valor_total: 750.0,
        rotacion: 8.7,
        dias_inventario: 42,
      },
    ];
  }

  cargarReporteMovimientos(): void {
    this.reporteMovimientos = [
      {
        id_movimiento: 1,
        fecha: '2024-01-15',
        tipo_movimiento: 'INGRESO',
        codigo_fox: 'ALG001',
        material: 'Algodón Pima Blanco',
        cantidad: 500,
        almacen: 'Almacén Principal',
        usuario: 'Juan Pérez',
        observaciones: 'Compra directa a proveedor',
      },
      {
        id_movimiento: 2,
        fecha: '2024-01-14',
        tipo_movimiento: 'EGRESO',
        codigo_fox: 'POL002',
        material: 'Poliéster 150D',
        cantidad: -200,
        almacen: 'Almacén Principal',
        usuario: 'María García',
        observaciones: 'Producción orden #1024',
      },
      {
        id_movimiento: 3,
        fecha: '2024-01-13',
        tipo_movimiento: 'AJUSTE',
        codigo_fox: 'HIL003',
        material: 'Hilo de Algodón 20/1',
        cantidad: -15,
        almacen: 'Almacén Secundario',
        usuario: 'Carlos López',
        observaciones: 'Ajuste por inventario físico',
      },
      {
        id_movimiento: 4,
        fecha: '2024-01-12',
        tipo_movimiento: 'INGRESO',
        codigo_fox: 'TEL004',
        material: 'Tela Jersey Modal',
        cantidad: 1000,
        almacen: 'Almacén Secundario',
        usuario: 'Ana Rodríguez',
        observaciones: 'Transferencia desde planta',
      },
    ];
  }

  exportarExcel(): void {
    this.snackBar.open('Generando reporte Excel...', 'Cerrar', {
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

  exportarPDF(): void {
    this.snackBar.open('Generando reporte PDF...', 'Cerrar', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });

    setTimeout(() => {
      this.snackBar.open('Reporte PDF generado exitosamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['snackbar-success'],
      });
    }, 2000);
  }

  programarReporte(): void {
    this.snackBar.open(
      'Funcionalidad de programación disponible próximamente',
      'Cerrar',
      {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      }
    );
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

  formatearCantidad(cantidad: number): string {
    const signo = cantidad >= 0 ? '+' : '';
    return `${signo}${this.formatearNumero(cantidad)}`;
  }

  getColorMovimiento(tipo: string): string {
    switch (tipo) {
      case 'INGRESO':
        return 'ingreso';
      case 'EGRESO':
        return 'egreso';
      case 'AJUSTE':
        return 'ajuste';
      default:
        return 'neutral';
    }
  }

  getIconoTendencia(tendencia: string): string {
    switch (tendencia) {
      case 'up':
        return 'trending_up';
      case 'down':
        return 'trending_down';
      case 'stable':
        return 'trending_flat';
      default:
        return 'trending_flat';
    }
  }

  getColorTendencia(tendencia: string): string {
    switch (tendencia) {
      case 'up':
        return 'success';
      case 'down':
        return 'warning';
      case 'stable':
        return 'neutral';
      default:
        return 'neutral';
    }
  }

  getColorRotacion(rotacion: number): string {
    if (rotacion >= 8) return 'alta';
    if (rotacion >= 4) return 'media';
    return 'baja';
  }
}
