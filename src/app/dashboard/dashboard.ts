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
  DashboardInventario,
  DashboardCostos,
  DashboardTrazabilidad,
  DashboardDesempeno,
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

  // Nuevos dashboards
  dashboardInventario: DashboardInventario | null = null;
  dashboardCostos: DashboardCostos | null = null;
  dashboardTrazabilidad: DashboardTrazabilidad | null = null;
  dashboardDesempeno: DashboardDesempeno | null = null;

  // Chart data para nuevos dashboards
  inventarioRotacionData: any = {};
  inventarioRotacionOptions: any = {};
  
  costosAlmacenData: any = {};
  costosAlmacenOptions: any = {};
  
  trazabilidadLotesData: any = {};
  trazabilidadLotesOptions: any = {};
  
  desempenoEficienciaData: any = {};
  desempenoEficienciaOptions: any = {};

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
      dashboardInventario: this.dashboardService.getDashboardInventario().pipe(
        catchError((error) => {
          console.error('Error al cargar dashboard inventario:', error);
          return of(this.getDashboardInventarioSimulado());
        })
      ),
      dashboardCostos: this.dashboardService.getDashboardCostos().pipe(
        catchError((error) => {
          console.error('Error al cargar dashboard costos:', error);
          return of(this.getDashboardCostosSimulado());
        })
      ),
      dashboardTrazabilidad: this.dashboardService.getDashboardTrazabilidad().pipe(
        catchError((error) => {
          console.error('Error al cargar dashboard trazabilidad:', error);
          return of(this.getDashboardTrazabilidadSimulado());
        })
      ),
      dashboardDesempeno: this.dashboardService.getDashboardDesempeno().pipe(
        catchError((error) => {
          console.error('Error al cargar dashboard desempeno:', error);
          return of(this.getDashboardDesempenoSimulado());
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
          this.dashboardInventario = data.dashboardInventario;
          this.dashboardCostos = data.dashboardCostos;
          this.dashboardTrazabilidad = data.dashboardTrazabilidad;
          this.dashboardDesempeno = data.dashboardDesempeno;

          // Configurar gráficos después de cargar los datos
          this.configurarGraficos();
          this.configurarNuevosDashboards();

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
    return texto?.trim() || '-';
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
  // DATOS SIMULADOS PARA NUEVOS DASHBOARDS
  // ============================================================================

  private getDashboardInventarioSimulado(): DashboardInventario {
    return {
      rotacionPorCategoria: [
        { categoria: 'Químicos Básicos', rotacionPromedio: 8.5, diasPromedio: 45, valor: 125000 },
        { categoria: 'Reactivos Especiales', rotacionPromedio: 6.2, diasPromedio: 62, valor: 89000 },
        { categoria: 'Solventes', rotacionPromedio: 12.1, diasPromedio: 30, valor: 156000 },
        { categoria: 'Sales Metálicas', rotacionPromedio: 4.8, diasPromedio: 78, valor: 67000 },
        { categoria: 'Ácidos', rotacionPromedio: 9.3, diasPromedio: 39, valor: 98000 }
      ],
      stockOptimo: [
        { insumo: 'Ácido Sulfúrico', stockActual: 450, stockOptimo: 380, diferencia: 70, estado: 'SOBRE_STOCK' },
        { insumo: 'Acetato de Sodio', stockActual: 15, stockOptimo: 80, diferencia: -65, estado: 'BAJO_STOCK' },
        { insumo: 'Hidróxido de Sodio', stockActual: 320, stockOptimo: 310, diferencia: 10, estado: 'OPTIMO' },
        { insumo: 'Sulfato de Cobre', stockActual: 185, stockOptimo: 200, diferencia: -15, estado: 'BAJO_STOCK' }
      ],
      analisisABC: [
        { categoria: 'A', porcentajeInsumos: 20, porcentajeValor: 80, cantidad: 249 },
        { categoria: 'B', porcentajeInsumos: 30, porcentajeValor: 15, cantidad: 374 },
        { categoria: 'C', porcentajeInsumos: 50, porcentajeValor: 5, cantidad: 624 }
      ],
      prediccionDemanda: [
        { mes: 'Ene', demandaReal: 125, demandaPrediccion: 128, precision: 97.6 },
        { mes: 'Feb', demandaReal: 142, demandaPrediccion: 138, precision: 97.2 },
        { mes: 'Mar', demandaReal: 156, demandaPrediccion: 159, precision: 98.1 },
        { mes: 'Abr', demandaReal: 134, demandaPrediccion: 131, precision: 97.8 },
        { mes: 'May', demandaReal: 167, demandaPrediccion: 165, precision: 98.8 },
        { mes: 'Jun', demandaReal: 178, demandaPrediccion: 172, precision: 96.6 }
      ]
    };
  }

  private getDashboardCostosSimulado(): DashboardCostos {
    return {
      costoPorAlmacen: [
        { almacen: 'Principal', costoTotal: 285640, costoPromedio: 835, participacion: 58.9 },
        { almacen: 'Secundario', costoTotal: 124890, costoPromedio: 668, participacion: 25.7 },
        { almacen: 'Emergencia', costoTotal: 45680, costoPromedio: 481, participacion: 9.4 },
        { almacen: 'Temporal', costoTotal: 29539, costoPromedio: 434, participacion: 6.0 }
      ],
      tendenciaCostos: [
        { mes: 'Jul', costoTotal: 445000, costoPromedio: 378, variacion: 2.3 },
        { mes: 'Ago', costoTotal: 467000, costoPromedio: 388, variacion: 4.9 },
        { mes: 'Sep', costoTotal: 485000, costoPromedio: 389, variacion: 3.9 },
        { mes: 'Oct', costoTotal: 472000, costoPromedio: 386, variacion: -2.7 },
        { mes: 'Nov', costoTotal: 458000, costoPromedio: 383, variacion: -3.0 },
        { mes: 'Dic', costoTotal: 485750, costoPromedio: 390, variacion: 6.1 }
      ],
      analisisProveedores: [
        { proveedor: 'QuimiCorp S.A.', totalCompras: 125000, precioPromedio: 285, confiabilidad: 98.5, ranking: 1 },
        { proveedor: 'Industrias Lima', totalCompras: 98000, precioPromedio: 312, confiabilidad: 95.2, ranking: 2 },
        { proveedor: 'Solventes Perú', totalCompras: 87000, precioPromedio: 298, confiabilidad: 97.1, ranking: 3 },
        { proveedor: 'Reactivos Unidos', totalCompras: 72000, precioPromedio: 334, confiabilidad: 93.8, ranking: 4 }
      ],
      variacionPrecios: [
        { insumo: 'Ácido Sulfúrico', precioAnterior: 150.0, precioActual: 152.5, variacion: 1.67, tendencia: 'SUBE' },
        { insumo: 'Acetato de Sodio', precioAnterior: 2550.0, precioActual: 2480.0, variacion: -2.75, tendencia: 'BAJA' },
        { insumo: 'Hidróxido de Sodio', precioAnterior: 151.85, precioActual: 151.85, variacion: 0, tendencia: 'ESTABLE' },
        { insumo: 'Sulfato de Cobre', precioAnterior: 172.3, precioActual: 175.8, variacion: 2.03, tendencia: 'SUBE' }
      ]
    };
  }

  private getDashboardTrazabilidadSimulado(): DashboardTrazabilidad {
    return {
      lotesPorEstado: [
        { estado: 'ACTIVO', cantidad: 1184, porcentaje: 85.2 },
        { estado: 'POR_VENCER', cantidad: 127, porcentaje: 9.1 },
        { estado: 'VENCIDO', cantidad: 52, porcentaje: 3.7 },
        { estado: 'CONSUMIDO', cantidad: 28, porcentaje: 2.0 }
      ],
      tiempoVidaPromedio: [
        { categoria: 'Químicos Básicos', promedioVida: 365, lotesMenores30: 15, lotesMayores90: 285 },
        { categoria: 'Reactivos Especiales', promedioVida: 180, lotesMenores30: 45, lotesMayores90: 98 },
        { categoria: 'Solventes', promedioVida: 730, lotesMenores30: 8, lotesMayores90: 187 },
        { categoria: 'Sales Metálicas', promedioVida: 545, lotesMenores30: 12, lotesMayores90: 156 }
      ],
      alertasVencimiento: [
        { lote: 'L-2024-001', insumo: 'Acetato de Sodio', fechaVencimiento: new Date('2024-12-30'), diasRestantes: 8, gravedad: 'CRITICO' },
        { lote: 'L-2024-015', insumo: 'Sulfato de Cobre', fechaVencimiento: new Date('2025-01-15'), diasRestantes: 24, gravedad: 'ALERTA' },
        { lote: 'L-2024-032', insumo: 'Permanganato K', fechaVencimiento: new Date('2025-02-10'), diasRestantes: 50, gravedad: 'ATENCION' }
      ],
      historialMovimientos: [
        { fecha: new Date('2024-12-15'), tipo: 'INGRESO', cantidad: 125, responsable: 'Juan Pérez' },
        { fecha: new Date('2024-12-14'), tipo: 'SALIDA', cantidad: 89, responsable: 'María García' },
        { fecha: new Date('2024-12-13'), tipo: 'TRANSFERENCIA', cantidad: 45, responsable: 'Carlos López' },
        { fecha: new Date('2024-12-12'), tipo: 'AJUSTE', cantidad: 12, responsable: 'Ana Martínez' }
      ]
    };
  }

  private getDashboardDesempenoSimulado(): DashboardDesempeno {
    return {
      eficienciaOperaciones: [
        { operacion: 'Recepción', eficiencia: 94.5, tiempo: 45, errores: 3, mejora: 2.1 },
        { operacion: 'Almacenamiento', eficiencia: 89.2, tiempo: 78, errores: 8, mejora: -1.5 },
        { operacion: 'Despacho', eficiencia: 96.8, tiempo: 32, errores: 1, mejora: 4.2 },
        { operacion: 'Inventario', eficiencia: 87.3, tiempo: 125, errores: 12, mejora: -0.8 }
      ],
      tiemposProceso: [
        { proceso: 'Ingreso Insumos', tiempoPromedio: 45, tiempoOptimo: 35, variacion: 28.6 },
        { proceso: 'Control Calidad', tiempoPromedio: 78, tiempoOptimo: 60, variacion: 30.0 },
        { proceso: 'Ubicación Stock', tiempoPromedio: 32, tiempoOptimo: 25, variacion: 28.0 },
        { proceso: 'Preparación Pedido', tiempoPromedio: 125, tiempoOptimo: 90, variacion: 38.9 }
      ],
      productividad: [
        { mes: 'Jul', operacionesCompletadas: 1245, tiempoTotal: 8760, productividad: 85.2 },
        { mes: 'Ago', operacionesCompletadas: 1389, tiempoTotal: 8760, productividad: 89.7 },
        { mes: 'Sep', operacionesCompletadas: 1456, tiempoTotal: 8640, productividad: 92.1 },
        { mes: 'Oct', operacionesCompletadas: 1324, tiempoTotal: 8760, productividad: 87.5 },
        { mes: 'Nov', operacionesCompletadas: 1398, tiempoTotal: 8640, productividad: 90.3 },
        { mes: 'Dic', operacionesCompletadas: 1487, tiempoTotal: 8760, productividad: 93.8 }
      ],
      utilizacionRecursos: [
        { recurso: 'Personal Almacén', utilizacion: 87.5, capacidad: 100, eficiencia: 92.3 },
        { recurso: 'Montacargas', utilizacion: 78.2, capacidad: 100, eficiencia: 89.1 },
        { recurso: 'Espacio Almacén', utilizacion: 82.7, capacidad: 100, eficiencia: 94.5 },
        { recurso: 'Sistemas TI', utilizacion: 95.8, capacidad: 100, eficiencia: 97.2 }
      ]
    };
  }

  // ============================================================================
  // CONFIGURACIÓN DE GRÁFICOS
  // ============================================================================

  private configurarGraficos(): void {
    // Método mantenido por compatibilidad - los gráficos ahora están en configurarNuevosDashboards
  }






  // ============================================================================
  // CONFIGURACIÓN DE NUEVOS DASHBOARDS
  // ============================================================================

  private configurarNuevosDashboards(): void {
    this.configurarDashboardInventario();
    this.configurarDashboardCostos();
    this.configurarDashboardTrazabilidad();
    this.configurarDashboardDesempeno();
  }

  private configurarDashboardInventario(): void {
    if (!this.dashboardInventario) return;

    // Gráfico de Línea - Tendencia de Rotación
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    this.inventarioRotacionData = {
      labels: meses,
      datasets: [
        {
          label: 'Rotación Químicos Básicos',
          data: [8.2, 8.5, 9.1, 8.8, 8.3, 8.5],
          borderColor: '#bd2126',
          backgroundColor: 'rgba(189, 33, 38, 0.1)',
          borderWidth: 3,
          pointRadius: 6,
          pointBackgroundColor: '#bd2126',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true
        },
        {
          label: 'Rotación Solventes',
          data: [11.8, 12.1, 12.5, 12.2, 11.9, 12.1],
          borderColor: '#16a34a',
          backgroundColor: 'rgba(22, 163, 74, 0.1)',
          borderWidth: 3,
          pointRadius: 6,
          pointBackgroundColor: '#16a34a',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true
        },
        {
          label: 'Rotación Reactivos',
          data: [6.0, 6.2, 6.5, 6.1, 5.9, 6.2],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          borderWidth: 3,
          pointRadius: 6,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.4,
          fill: true
        }
      ]
    };

    this.inventarioRotacionOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { 
            usePointStyle: true, 
            padding: 20,
            font: { size: 12 }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (context: any) => {
              return `${context.dataset.label}: ${context.parsed.y} veces/mes`;
            }
          }
        }
      },
      scales: {
        x: { 
          title: { display: true, text: 'Meses' },
          grid: { display: false }
        },
        y: { 
          title: { display: true, text: 'Rotación (veces por mes)' },
          beginAtZero: true,
          grid: { color: 'rgba(0, 0, 0, 0.1)' }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false
      }
    };
  }

  private configurarDashboardCostos(): void {
    if (!this.dashboardCostos) return;

    // Gráfico de Costos por Almacén
    this.costosAlmacenData = {
      labels: this.dashboardCostos.costoPorAlmacen.map(c => c.almacen),
      datasets: [{
        data: this.dashboardCostos.costoPorAlmacen.map(c => c.costoTotal),
        backgroundColor: [
          'rgba(189, 33, 38, 0.9)',
          'rgba(18, 30, 102, 0.9)',
          'rgba(22, 163, 74, 0.9)',
          'rgba(245, 158, 11, 0.9)'
        ],
        borderColor: ['#bd2126', '#121e66', '#16a34a', '#f59e0b'],
        borderWidth: 2
      }]
    };

    this.costosAlmacenOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, padding: 20 }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const almacen = this.dashboardCostos!.costoPorAlmacen[context.dataIndex];
              return [
                `${context.label}: ${this.formatearMoneda(context.parsed)}`,
                `Promedio: ${this.formatearMoneda(almacen.costoPromedio)}`,
                `Participación: ${almacen.participacion}%`
              ];
            }
          }
        }
      }
    };
  }

  private configurarDashboardTrazabilidad(): void {
    if (!this.dashboardTrazabilidad) return;

    // Gráfico de Torta - Estados de Lotes
    this.trazabilidadLotesData = {
      labels: ['Activos', 'Por Vencer', 'Vencidos', 'Consumidos'],
      datasets: [{
        data: [1184, 127, 52, 28],
        backgroundColor: [
          '#22c55e', // ACTIVO - Verde vibrante
          '#f59e0b', // POR_VENCER - Amarillo
          '#ef4444', // VENCIDO - Rojo vibrante
          '#94a3b8'  // CONSUMIDO - Gris
        ],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 8
      }]
    };

    this.trazabilidadLotesOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: { size: 12 },
            generateLabels: (chart: any) => {
              const data = chart.data;
              const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
              
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label}: ${value} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor,
                  lineWidth: 2,
                  pointStyle: 'circle',
                  index: i
                };
              });
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${context.parsed} lotes (${percentage}%)`;
            }
          }
        }
      }
    };
  }

  private configurarDashboardDesempeno(): void {
    if (!this.dashboardDesempeno) return;

    // Gráfico de Eficiencia por Operación
    this.desempenoEficienciaData = {
      labels: this.dashboardDesempeno.eficienciaOperaciones.map(e => e.operacion),
      datasets: [{
        label: 'Eficiencia (%)',
        data: this.dashboardDesempeno.eficienciaOperaciones.map(e => e.eficiencia),
        backgroundColor: this.dashboardDesempeno.eficienciaOperaciones.map(e => {
          if (e.eficiencia >= 95) return 'rgba(22, 163, 74, 0.8)';
          if (e.eficiencia >= 90) return 'rgba(245, 158, 11, 0.8)';
          return 'rgba(189, 33, 38, 0.8)';
        }),
        borderColor: this.dashboardDesempeno.eficienciaOperaciones.map(e => {
          if (e.eficiencia >= 95) return '#16a34a';
          if (e.eficiencia >= 90) return '#f59e0b';
          return '#bd2126';
        }),
        borderWidth: 2,
        borderRadius: 6
      }]
    };

    this.desempenoEficienciaOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const operacion = this.dashboardDesempeno!.eficienciaOperaciones[context.dataIndex];
              return [
                `Eficiencia: ${context.parsed.y}%`,
                `Tiempo: ${operacion.tiempo} min`,
                `Errores: ${operacion.errores}`,
                `Mejora: ${operacion.mejora > 0 ? '+' : ''}${operacion.mejora}%`
              ];
            }
          }
        }
      },
      scales: {
        x: { title: { display: true, text: 'Operaciones' } },
        y: {
          beginAtZero: true,
          max: 100,
          title: { display: true, text: 'Eficiencia (%)' },
          ticks: {
            callback: (value: any) => `${value}%`
          }
        }
      }
    };
  }
}

export { DashboardComponent as Dashboard };
