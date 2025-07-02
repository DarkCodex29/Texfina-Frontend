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
}
