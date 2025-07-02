import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

import {
  DashboardService,
  ResumenDashboard,
  KpisDashboard,
  AlertaDashboard,
  EstadisticaAlmacen,
  TopInsumo,
  MetricaConsumo,
} from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  isLoading = true;
  hasError = false;
  errorMessage = '';

  resumen: ResumenDashboard | null = null;
  kpis: KpisDashboard | null = null;
  alertas: AlertaDashboard[] = [];
  estadisticasAlmacenes: EstadisticaAlmacen[] = [];
  topInsumos: TopInsumo[] = [];
  insumosStockBajo: TopInsumo[] = [];
  metricasConsumo: MetricaConsumo[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDashboard(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    const dashboardData$ = forkJoin({
      resumen: this.dashboardService.getResumenDashboard().pipe(
        catchError((error) => {
          console.error('Error al cargar resumen:', error);
          return of(this.getResumenSimulado());
        })
      ),
      kpis: this.dashboardService.getKpisDashboard().pipe(
        catchError((error) => {
          console.error('Error al cargar KPIs:', error);
          return of(null);
        })
      ),
      alertas: this.dashboardService.getAlertasDashboard().pipe(
        catchError((error) => {
          console.error('Error al cargar alertas:', error);
          return of(this.getAlertasSimuladas());
        })
      ),
      estadisticasAlmacenes: this.dashboardService
        .getEstadisticasAlmacenes()
        .pipe(
          catchError((error) => {
            console.error('Error al cargar estadísticas de almacenes:', error);
            return of(this.getAlmacenesSimulados());
          })
        ),
      topInsumos: this.dashboardService.getTopInsumos().pipe(
        catchError((error) => {
          console.error('Error al cargar top insumos:', error);
          return of(this.getTopInsumosSimulados());
        })
      ),
      insumosStockBajo: this.dashboardService.getInsumosStockBajo().pipe(
        catchError((error) => {
          console.error('Error al cargar insumos con stock bajo:', error);
          return of(this.getStockBajoSimulado());
        })
      ),
      metricasConsumo: this.dashboardService.getMetricasConsumo().pipe(
        catchError((error) => {
          console.error('Error al cargar métricas de consumo:', error);
          return of(this.getConsumoSimulado());
        })
      ),
    });

    dashboardData$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.resumen = data.resumen;
          this.kpis = data.kpis;
          this.alertas = data.alertas || [];
          this.estadisticasAlmacenes = data.estadisticasAlmacenes || [];
          this.topInsumos = data.topInsumos || [];
          this.insumosStockBajo = data.insumosStockBajo || [];
          this.metricasConsumo = data.metricasConsumo || [];

          console.log('Dashboard cargado:', {
            resumen: this.resumen,
            alertas: this.alertas.length,
            almacenes: this.estadisticasAlmacenes.length,
          });
        },
        error: (error) => {
          console.error('Error general al cargar dashboard:', error);
          this.hasError = true;
          this.errorMessage =
            'Error al cargar los datos del dashboard. Por favor, intente nuevamente.';
        },
      });
  }

  private getResumenSimulado(): ResumenDashboard {
    return {
      totalInsumos: 1247,
      totalProveedores: 45,
      totalAlmacenes: 8,
      valorInventario: 485750.5,
      insumosActivos: 1224,
      stockCritico: 23,
      lotesVencidos: 5,
      lotesPorVencer: 12,
    };
  }

  private getAlertasSimuladas(): AlertaDashboard[] {
    return [
      {
        id: 1,
        titulo: 'Stock crítico detectado',
        descripcion:
          'El acetato de sodio ha alcanzado niveles críticos de inventario',
        nivel: 'ALTA',
        tipo: 'STOCK_BAJO',
        insumo: 'Acetato de Sodio',
        almacen: 'Almacén Principal',
        fechaCreacion: new Date(Date.now() - 2 * 60 * 60 * 1000),
        cantidad: 15,
      },
      {
        id: 2,
        titulo: 'Lote próximo a vencer',
        descripcion: 'Lote L-2024-003 de sulfato de cobre vence en 5 días',
        nivel: 'MEDIA',
        tipo: 'LOTE_POR_VENCER',
        insumo: 'Sulfato de Cobre',
        almacen: 'Almacén Secundario',
        fechaCreacion: new Date(Date.now() - 4 * 60 * 60 * 1000),
        cantidad: 85,
      },
      {
        id: 3,
        titulo: 'Consumo anormal detectado',
        descripcion:
          'El área de producción ha incrementado su consumo un 45% esta semana',
        nivel: 'MEDIA',
        tipo: 'SISTEMA',
        insumo: 'Varios',
        almacen: 'Área Producción',
        fechaCreacion: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    ];
  }

  private getAlmacenesSimulados(): EstadisticaAlmacen[] {
    return [
      {
        id: 1,
        nombre: 'Almacén Principal',
        ubicacion: 'Piso 1 - Zona A',
        cantidadInsumos: 342,
        valorInventario: 285640.75,
        ocupacion: 85,
        estado: 'OPTIMO',
      },
      {
        id: 2,
        nombre: 'Almacén Secundario',
        ubicacion: 'Piso 2 - Zona B',
        cantidadInsumos: 187,
        valorInventario: 124890.25,
        ocupacion: 95,
        estado: 'CRITICO',
      },
      {
        id: 3,
        nombre: 'Almacén de Emergencia',
        ubicacion: 'Sótano - Zona C',
        cantidadInsumos: 95,
        valorInventario: 45680.5,
        ocupacion: 78,
        estado: 'ALERTA',
      },
      {
        id: 4,
        nombre: 'Almacén Temporal',
        ubicacion: 'Patio Exterior',
        cantidadInsumos: 68,
        valorInventario: 29539.0,
        ocupacion: 65,
        estado: 'OPTIMO',
      },
    ];
  }

  private getTopInsumosSimulados(): TopInsumo[] {
    return [
      {
        id: 1,
        codigo: 'QUI-001',
        nombre: 'Ácido Sulfúrico',
        stockActual: 450,
        valorTotal: 67500.0,
        rotacion: 8.5,
        estado: 'ACTIVO',
      },
      {
        id: 2,
        codigo: 'QUI-025',
        nombre: 'Hidróxido de Sodio',
        stockActual: 320,
        valorTotal: 48600.75,
        rotacion: 6.2,
        estado: 'ACTIVO',
      },
      {
        id: 3,
        codigo: 'QUI-012',
        nombre: 'Acetato de Sodio',
        stockActual: 15,
        valorTotal: 38250.5,
        rotacion: 2.1,
        estado: 'CRITICO',
      },
      {
        id: 4,
        codigo: 'QUI-088',
        nombre: 'Sulfato de Cobre',
        stockActual: 185,
        valorTotal: 31875.25,
        rotacion: 4.8,
        estado: 'ACTIVO',
      },
      {
        id: 5,
        codigo: 'QUI-156',
        nombre: 'Cloruro de Calcio',
        stockActual: 278,
        valorTotal: 28940.0,
        rotacion: 7.3,
        estado: 'ACTIVO',
      },
    ];
  }

  private getStockBajoSimulado(): TopInsumo[] {
    return [
      {
        id: 1,
        codigo: 'QUI-012',
        nombre: 'Acetato de Sodio',
        stockActual: 15,
        valorTotal: 38250.5,
        rotacion: 2.1,
        estado: 'CRITICO',
      },
      {
        id: 2,
        codigo: 'QUI-067',
        nombre: 'Permanganato de Potasio',
        stockActual: 8,
        valorTotal: 12640.25,
        rotacion: 1.5,
        estado: 'CRITICO',
      },
      {
        id: 3,
        codigo: 'QUI-143',
        nombre: 'Nitrato de Plata',
        stockActual: 22,
        valorTotal: 18750.75,
        rotacion: 3.2,
        estado: 'CRITICO',
      },
      {
        id: 4,
        codigo: 'QUI-088',
        nombre: 'Sulfato de Cobre',
        stockActual: 35,
        valorTotal: 31875.25,
        rotacion: 4.8,
        estado: 'CRITICO',
      },
    ];
  }

  private getConsumoSimulado(): MetricaConsumo[] {
    return [
      {
        area: 'Producción Principal',
        consumoMensual: 125680.5,
        tendencia: 'AUMENTANDO',
        porcentajeDiferencia: 12.5,
      },
      {
        area: 'Control de Calidad',
        consumoMensual: 45290.25,
        tendencia: 'ESTABLE',
        porcentajeDiferencia: 2.1,
      },
      {
        area: 'Investigación y Desarrollo',
        consumoMensual: 28750.75,
        tendencia: 'DISMINUYENDO',
        porcentajeDiferencia: -8.3,
      },
      {
        area: 'Mantenimiento',
        consumoMensual: 18640.0,
        tendencia: 'AUMENTANDO',
        porcentajeDiferencia: 15.7,
      },
    ];
  }

  actualizarDashboard(): void {
    this.cargarDashboard();
  }

  reintentarCarga(): void {
    this.cargarDashboard();
  }

  resolverAlerta(alerta: AlertaDashboard): void {
    console.log('Resolviendo alerta:', alerta);
    this.alertas = this.alertas.filter((a) => a.id !== alerta.id);
  }

  formatearNumero(numero?: number): string {
    if (!numero) return '0';
    return new Intl.NumberFormat('es-PE').format(numero);
  }

  formatearMoneda(valor?: number): string {
    if (!valor) return 'S/ 0.00';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(valor);
  }

  formatearPorcentaje(valor?: number): string {
    if (!valor) return '0%';
    return `${valor.toFixed(1)}%`;
  }

  formatearFecha(fecha?: Date | string): string {
    if (!fecha) return '';

    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const ahora = new Date();
    const diferencia = ahora.getTime() - date.getTime();
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 1) {
      return 'Hace un momento';
    } else if (minutos < 60) {
      return `Hace ${minutos} min`;
    } else if (horas < 24) {
      return `Hace ${horas}h`;
    } else if (dias < 7) {
      return `Hace ${dias}d`;
    } else {
      return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }
}

export { DashboardComponent as Dashboard };
