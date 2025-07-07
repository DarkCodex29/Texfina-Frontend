import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';

// PrimeNG imports
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

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
    ChartModule,
    CardModule,
    ButtonModule,
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

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

  // Chart data y options
  inventarioChartData: any = {};
  inventarioChartOptions: any = {};

  stockTendenciaData: any = {};
  stockTendenciaOptions: any = {};

  movimientosBarData: any = {};
  movimientosBarOptions: any = {};

  proveedoresData: any = {};
  proveedoresOptions: any = {};

  consumosPorTipoData: any = {};
  consumosPorTipoOptions: any = {};

  constructor(private readonly dashboardService: DashboardService) {}

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

          // Configurar gráficos después de cargar los datos
          this.configurarGraficos();

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

  getAlertIcon(tipo: string): string {
    const iconMap: { [key: string]: string } = {
      STOCK_BAJO: 'pi pi-exclamation-triangle',
      LOTE_POR_VENCER: 'pi pi-clock',
      SISTEMA: 'pi pi-cog',
      CRITICO: 'pi pi-times-circle',
      WARNING: 'pi pi-exclamation-triangle',
      INFO: 'pi pi-info-circle',
    };
    return iconMap[tipo] || 'pi pi-bell';
  }

  // ============================================================================
  // CONFIGURACIÓN DE GRÁFICOS
  // ============================================================================

  private configurarGraficos(): void {
    this.configurarGraficoInventario();
    this.configurarGraficoTendenciaStock();
    this.configurarGraficoMovimientos();
    this.configurarGraficoProveedores();
    this.configurarGraficoConsumosPorTipo();
  }

  private configurarGraficoInventario(): void {
    const texfinaColors = [
      '#bd2126', // Texfina Primary Red
      '#121e66', // Texfina Secondary Blue
      '#16a34a', // Success Green
      '#f59e0b', // Warning Orange
      '#8b5cf6', // Purple
      '#06b6d4', // Cyan
      '#ef4444', // Red variant
      '#10b981', // Emerald
    ];

    this.inventarioChartData = {
      labels: this.estadisticasAlmacenes.map((a) => a.nombre),
      datasets: [
        {
          data: this.estadisticasAlmacenes.map((a) => a.cantidadInsumos),
          backgroundColor: texfinaColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverBorderWidth: 3,
          hoverBorderColor: '#ffffff',
          hoverBackgroundColor: texfinaColors.map((color) => color + '90'), // Add transparency on hover
        },
      ],
    };

    this.inventarioChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              family: 'Segoe UI',
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const almacen = this.estadisticasAlmacenes[context.dataIndex];
              return [
                `${context.label}: ${context.parsed} insumos`,
                `Valor: ${this.formatearMoneda(almacen.valorInventario)}`,
                `Ocupación: ${almacen.ocupacion}%`,
              ];
            },
          },
        },
      },
    };
  }

  private configurarGraficoTendenciaStock(): void {
    // Simular datos de tendencia de los últimos 6 meses
    const meses = ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const stockData = [1180, 1205, 1247, 1224, 1198, 1247];
    const valorData = [445000, 467000, 485000, 472000, 458000, 485750];

    this.stockTendenciaData = {
      labels: meses,
      datasets: [
        {
          type: 'line',
          label: 'Cantidad de Insumos',
          data: stockData,
          borderColor: '#bd2126',
          backgroundColor: 'rgba(189, 33, 38, 0.1)',
          borderWidth: 4,
          pointBackgroundColor: '#bd2126',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 3,
          pointRadius: 8,
          pointHoverRadius: 10,
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        },
        {
          type: 'bar',
          label: 'Valor de Inventario (S/)',
          data: valorData,
          backgroundColor: 'rgba(18, 30, 102, 0.7)',
          borderColor: '#121e66',
          borderWidth: 2,
          borderRadius: 6,
          yAxisID: 'y1',
        },
      ],
    };

    this.stockTendenciaOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              if (context.datasetIndex === 0) {
                return `${context.dataset.label}: ${context.parsed.y} insumos`;
              } else {
                return `${context.dataset.label}: ${this.formatearMoneda(
                  context.parsed.y
                )}`;
              }
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Mes',
          },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Cantidad de Insumos',
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Valor (S/)',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };
  }

  private configurarGraficoMovimientos(): void {
    const meses = ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    this.movimientosBarData = {
      labels: meses,
      datasets: [
        {
          label: 'Ingresos',
          data: [85, 92, 78, 115, 88, 102],
          backgroundColor: 'rgba(22, 163, 74, 0.8)',
          borderColor: '#16a34a',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Salidas',
          data: [72, 88, 95, 68, 94, 79],
          backgroundColor: 'rgba(189, 33, 38, 0.8)',
          borderColor: '#bd2126',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Transferencias',
          data: [23, 31, 18, 42, 28, 35],
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: '#f59e0b',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };

    this.movimientosBarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return `${context.dataset.label}: ${context.parsed.y} movimientos`;
            },
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Mes',
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Cantidad de Movimientos',
          },
        },
      },
    };
  }

  private configurarGraficoProveedores(): void {
    // Simular datos de proveedores top
    const proveedoresTop = [
      { nombre: 'QuimiCorp S.A.', valor: 125000 },
      { nombre: 'Industrias Lima', valor: 98000 },
      { nombre: 'Solventes Perú', valor: 87000 },
      { nombre: 'Reactivos Unidos', valor: 72000 },
      { nombre: 'Chemicals Express', valor: 65000 },
    ];

    this.proveedoresData = {
      labels: proveedoresTop.map((p) => p.nombre),
      datasets: [
        {
          label: 'Valor de Compras (S/)',
          data: proveedoresTop.map((p) => p.valor),
          backgroundColor: [
            'rgba(189, 33, 38, 0.9)', // Texfina Primary Red
            'rgba(18, 30, 102, 0.9)', // Texfina Secondary Blue
            'rgba(22, 163, 74, 0.9)', // Success Green
            'rgba(245, 158, 11, 0.9)', // Warning Orange
            'rgba(139, 92, 246, 0.9)', // Purple
          ],
          borderColor: ['#bd2126', '#121e66', '#16a34a', '#f59e0b', '#8b5cf6'],
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };

    this.proveedoresOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return `${context.label}: ${this.formatearMoneda(
                context.parsed.x
              )}`;
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valor de Compras (S/)',
          },
          ticks: {
            callback: (value: any) => this.formatearMoneda(value),
          },
        },
        y: {
          title: {
            display: true,
            text: 'Proveedores',
          },
        },
      },
    };
  }

  private configurarGraficoConsumosPorTipo(): void {
    this.consumosPorTipoData = {
      labels: this.metricasConsumo.map((m) => m.area),
      datasets: [
        {
          data: this.metricasConsumo.map((m) => m.consumoMensual),
          backgroundColor: [
            'rgba(189, 33, 38, 0.8)', // Texfina Primary Red
            'rgba(18, 30, 102, 0.8)', // Texfina Secondary Blue
            'rgba(22, 163, 74, 0.8)', // Success Green
            'rgba(245, 158, 11, 0.8)', // Warning Orange
            'rgba(139, 92, 246, 0.8)', // Purple
            'rgba(6, 182, 212, 0.8)', // Cyan
          ],
          borderWidth: 3,
          borderColor: [
            '#bd2126',
            '#121e66',
            '#16a34a',
            '#f59e0b',
            '#8b5cf6',
            '#06b6d4',
          ],
        },
      ],
    };

    this.consumosPorTipoOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            padding: 20,
            generateLabels: (chart: any) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label: string, i: number) => {
                  const meta = chart.getDatasetMeta(0);
                  const style = meta.controller.getStyle(i);
                  const metrica = this.metricasConsumo[i];

                  return {
                    text: `${label} (${this.formatearMoneda(
                      metrica.consumoMensual
                    )})`,
                    fillStyle: style.backgroundColor,
                    strokeStyle: style.borderColor,
                    lineWidth: style.borderWidth,
                    pointStyle: 'circle',
                    hidden:
                      isNaN(data.datasets[0].data[i]) || meta.data[i].hidden,
                    index: i,
                  };
                });
              }
              return [];
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const metrica = this.metricasConsumo[context.dataIndex];
              return [
                `${context.label}: ${this.formatearMoneda(context.parsed)}`,
                `Tendencia: ${metrica.tendencia}`,
                `Variación: ${metrica.porcentajeDiferencia > 0 ? '+' : ''}${
                  metrica.porcentajeDiferencia
                }%`,
              ];
            },
          },
        },
      },
    };
  }
}

export { DashboardComponent as Dashboard };
