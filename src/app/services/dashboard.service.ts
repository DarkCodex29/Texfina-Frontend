import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ResumenDashboard {
  totalInsumos: number;
  totalProveedores: number;
  totalAlmacenes: number;
  valorInventario: number;
  insumosActivos: number;
  stockCritico: number;
  lotesVencidos: number;
  lotesPorVencer: number;
}

export interface KpisDashboard {
  rotacionPromedio: number;
  valorTotalInventario: number;
  consumoMensual: number;
  ingresosMensual: number;
  eficienciaAlmacenes: number;
  alertasCriticas: number;
}

export interface AlertaDashboard {
  id: number;
  tipo: 'STOCK_BAJO' | 'LOTE_VENCIDO' | 'LOTE_POR_VENCER' | 'SISTEMA';
  nivel: 'ALTA' | 'MEDIA' | 'BAJA';
  titulo: string;
  descripcion: string;
  fechaCreacion: Date;
  insumo?: string;
  almacen?: string;
  cantidad?: number;
}

export interface EstadisticaAlmacen {
  id: number;
  nombre: string;
  ubicacion: string;
  cantidadInsumos: number;
  valorInventario: number;
  ocupacion: number;
  estado: 'OPTIMO' | 'CRITICO' | 'ALERTA';
}

export interface TopInsumo {
  id: number;
  nombre: string;
  codigo: string;
  stockActual: number;
  valorTotal: number;
  rotacion: number;
  estado: 'ACTIVO' | 'CRITICO' | 'AGOTADO';
}

export interface MetricaConsumo {
  area: string;
  consumoMensual: number;
  tendencia: 'AUMENTANDO' | 'DISMINUYENDO' | 'ESTABLE';
  porcentajeDiferencia: number;
}

// ==========================================
// NUEVAS INTERFACES PARA 4 DASHBOARDS
// ==========================================

export interface DashboardInventario {
  rotacionPorCategoria: RotacionCategoria[];
  stockOptimo: StockOptimo[];
  analisisABC: AnalisisABC[];
  prediccionDemanda: PrediccionDemanda[];
}

export interface RotacionCategoria {
  categoria: string;
  rotacionPromedio: number;
  diasPromedio: number;
  valor: number;
}

export interface StockOptimo {
  insumo: string;
  stockActual: number;
  stockOptimo: number;
  diferencia: number;
  estado: 'SOBRE_STOCK' | 'BAJO_STOCK' | 'OPTIMO';
}

export interface AnalisisABC {
  categoria: 'A' | 'B' | 'C';
  porcentajeInsumos: number;
  porcentajeValor: number;
  cantidad: number;
}

export interface PrediccionDemanda {
  mes: string;
  demandaReal: number;
  demandaPrediccion: number;
  precision: number;
}

export interface DashboardCostos {
  costoPorAlmacen: CostoAlmacen[];
  tendenciaCostos: TendenciaCosto[];
  analisisProveedores: AnalisisProveedor[];
  variacionPrecios: VariacionPrecio[];
}

export interface CostoAlmacen {
  almacen: string;
  costoTotal: number;
  costoPromedio: number;
  participacion: number;
}

export interface TendenciaCosto {
  mes: string;
  costoTotal: number;
  costoPromedio: number;
  variacion: number;
}

export interface AnalisisProveedor {
  proveedor: string;
  totalCompras: number;
  precioPromedio: number;
  confiabilidad: number;
  ranking: number;
}

export interface VariacionPrecio {
  insumo: string;
  precioAnterior: number;
  precioActual: number;
  variacion: number;
  tendencia: 'SUBE' | 'BAJA' | 'ESTABLE';
}

export interface DashboardTrazabilidad {
  lotesPorEstado: LoteEstado[];
  tiempoVidaPromedio: TiempoVida[];
  alertasVencimiento: AlertaVencimiento[];
  historialMovimientos: HistorialMovimiento[];
}

export interface LoteEstado {
  estado: 'ACTIVO' | 'POR_VENCER' | 'VENCIDO' | 'CONSUMIDO';
  cantidad: number;
  porcentaje: number;
}

export interface TiempoVida {
  categoria: string;
  promedioVida: number;
  lotesMenores30: number;
  lotesMayores90: number;
}

export interface AlertaVencimiento {
  lote: string;
  insumo: string;
  fechaVencimiento: Date;
  diasRestantes: number;
  gravedad: 'CRITICO' | 'ALERTA' | 'ATENCION';
}

export interface HistorialMovimiento {
  fecha: Date;
  tipo: 'INGRESO' | 'SALIDA' | 'TRANSFERENCIA' | 'AJUSTE';
  cantidad: number;
  responsable: string;
}

export interface DashboardDesempeno {
  eficienciaOperaciones: EficienciaOperacion[];
  tiemposProceso: TiempoProceso[];
  productividad: Productividad[];
  utilizacionRecursos: UtilizacionRecurso[];
}

export interface EficienciaOperacion {
  operacion: string;
  eficiencia: number;
  tiempo: number;
  errores: number;
  mejora: number;
}

export interface TiempoProceso {
  proceso: string;
  tiempoPromedio: number;
  tiempoOptimo: number;
  variacion: number;
}

export interface Productividad {
  mes: string;
  operacionesCompletadas: number;
  tiempoTotal: number;
  productividad: number;
}

export interface UtilizacionRecurso {
  recurso: string;
  utilizacion: number;
  capacidad: number;
  eficiencia: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/api/dashboard`;

  constructor(private http: HttpClient) {}

  getResumenDashboard(): Observable<ResumenDashboard> {
    return this.http.get<ResumenDashboard>(`${this.apiUrl}/resumen`);
  }

  getKpisDashboard(): Observable<KpisDashboard> {
    return this.http.get<KpisDashboard>(`${this.apiUrl}/kpis`);
  }

  getAlertasDashboard(): Observable<AlertaDashboard[]> {
    return this.http.get<AlertaDashboard[]>(`${this.apiUrl}/alertas`);
  }

  getEstadisticasAlmacenes(): Observable<EstadisticaAlmacen[]> {
    return this.http.get<EstadisticaAlmacen[]>(
      `${environment.apiUrl}/api/almacenes/estadisticas`
    );
  }

  getTopInsumos(limite: number = 5): Observable<TopInsumo[]> {
    return this.http.get<TopInsumo[]>(
      `${environment.apiUrl}/api/insumos/estadisticas?limite=${limite}`
    );
  }

  getInsumosStockBajo(umbral: number = 10): Observable<TopInsumo[]> {
    return this.http.get<TopInsumo[]>(
      `${environment.apiUrl}/api/insumos/bajo-stock?umbral=${umbral}`
    );
  }

  getLotesVencidos(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/api/lotes/vencidos`);
  }

  getLotesPorVencer(dias: number = 30): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/api/lotes/por-vencer?diasAlerta=${dias}`
    );
  }

  getMetricasConsumo(): Observable<MetricaConsumo[]> {
    return this.http.get<MetricaConsumo[]>(
      `${environment.apiUrl}/api/consumos/estadisticas`
    );
  }

  getStockResumen(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/api/stocks/resumen`);
  }

  getProveedoresTop(limite: number = 3): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.apiUrl}/api/proveedores/top?limite=${limite}`
    );
  }

  // ==========================================
  // MÉTODOS PARA NUEVOS DASHBOARDS
  // ==========================================

  getDashboardInventario(): Observable<DashboardInventario> {
    return this.http.get<DashboardInventario>(`${this.apiUrl}/inventario`);
  }

  getDashboardCostos(): Observable<DashboardCostos> {
    return this.http.get<DashboardCostos>(`${this.apiUrl}/costos`);
  }

  getDashboardTrazabilidad(): Observable<DashboardTrazabilidad> {
    return this.http.get<DashboardTrazabilidad>(`${this.apiUrl}/trazabilidad`);
  }

  getDashboardDesempeno(): Observable<DashboardDesempeno> {
    return this.http.get<DashboardDesempeno>(`${this.apiUrl}/desempeno`);
  }
}
