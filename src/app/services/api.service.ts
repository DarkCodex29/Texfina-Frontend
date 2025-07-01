import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    rol: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  pagina?: number;
  totalPaginas?: number;
}

export interface EstadisticasResponse {
  fechaConsulta: string;
  totalItems: number;
  itemsActivos: number;
  valorTotal: number;
  detalles: any[];
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'http://localhost:5116/api';
  private tokenSubject = new BehaviorSubject<string | null>(
    this.getStoredToken()
  );
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ============================================================================
  // GESTIÓN DE AUTENTICACIÓN
  // ============================================================================

  private getStoredToken(): string | null {
    return localStorage.getItem('texfina_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('texfina_token', token);
    this.tokenSubject.next(token);
  }

  private removeToken(): void {
    localStorage.removeItem('texfina_token');
    this.tokenSubject.next(null);
  }

  private getHeaders(): HttpHeaders {
    const token = this.getStoredToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    });
  }

  // ============================================================================
  // AUTENTICACIÓN
  // ============================================================================

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials)
      .pipe(
        map((response) => {
          if (response.success && response.token) {
            this.setToken(response.token);
          }
          return response;
        })
      );
  }

  logout(): void {
    this.removeToken();
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  getDashboardResumen(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/resumen`, {
      headers: this.getHeaders(),
    });
  }

  getDashboardAlertas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/alertas`, {
      headers: this.getHeaders(),
    });
  }

  getDashboardKpis(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/kpis`, {
      headers: this.getHeaders(),
    });
  }

  // ============================================================================
  // ALMACENES
  // ============================================================================

  getAlmacenes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/almacenes`, {
      headers: this.getHeaders(),
    });
  }

  getAlmacenesEstadisticas(): Observable<EstadisticasResponse> {
    return this.http.get<EstadisticasResponse>(
      `${this.baseUrl}/almacenes/estadisticas`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  // ============================================================================
  // INSUMOS (MATERIALES)
  // ============================================================================

  getInsumos(
    pagina = 1,
    tamaño = 10,
    filtros?: any
  ): Observable<ApiResponse<any[]>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamaño', tamaño.toString());

    if (filtros?.buscar) {
      params = params.set('buscar', filtros.buscar);
    }

    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/insumos`, {
      headers: this.getHeaders(),
      params,
    });
  }

  getInsumo(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/insumos/${id}`, {
      headers: this.getHeaders(),
    });
  }

  buscarInsumos(termino: string): Observable<any[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get<any[]>(`${this.baseUrl}/insumos/buscar`, {
      headers: this.getHeaders(),
      params,
    });
  }

  getInsumosEstadisticas(): Observable<EstadisticasResponse> {
    return this.http.get<EstadisticasResponse>(
      `${this.baseUrl}/insumos/estadisticas`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  getInsumosBajoStock(umbral = 10): Observable<any[]> {
    const params = new HttpParams().set('umbral', umbral.toString());
    return this.http.get<any[]>(`${this.baseUrl}/insumos/bajo-stock`, {
      headers: this.getHeaders(),
      params,
    });
  }

  // ============================================================================
  // PROVEEDORES
  // ============================================================================

  getProveedores(pagina = 1, tamaño = 10): Observable<ApiResponse<any[]>> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamaño', tamaño.toString());

    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/proveedores`, {
      headers: this.getHeaders(),
      params,
    });
  }

  getProveedoresEstadisticas(): Observable<EstadisticasResponse> {
    return this.http.get<EstadisticasResponse>(
      `${this.baseUrl}/proveedores/estadisticas`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  getTopProveedores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/proveedores/top`, {
      headers: this.getHeaders(),
    });
  }

  buscarProveedores(termino: string): Observable<any[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http.get<any[]>(`${this.baseUrl}/proveedores/buscar`, {
      headers: this.getHeaders(),
      params,
    });
  }

  // ============================================================================
  // LOTES
  // ============================================================================

  getLotes(pagina = 1, tamaño = 10): Observable<ApiResponse<any[]>> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamaño', tamaño.toString());

    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/lotes`, {
      headers: this.getHeaders(),
      params,
    });
  }

  getLote(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/lotes/${id}`, {
      headers: this.getHeaders(),
    });
  }

  getLotesActivos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lotes/activos`, {
      headers: this.getHeaders(),
    });
  }

  getLotesPorVencer(diasAlerta = 30): Observable<any[]> {
    const params = new HttpParams().set('diasAlerta', diasAlerta.toString());
    return this.http.get<any[]>(`${this.baseUrl}/lotes/por-vencer`, {
      headers: this.getHeaders(),
      params,
    });
  }

  getLotesVencidos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/lotes/vencidos`, {
      headers: this.getHeaders(),
    });
  }

  getLotesEstadisticas(): Observable<EstadisticasResponse> {
    return this.http.get<EstadisticasResponse>(
      `${this.baseUrl}/lotes/estadisticas`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  // ============================================================================
  // STOCKS
  // ============================================================================

  getStocks(pagina = 1, tamaño = 10): Observable<ApiResponse<any[]>> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamaño', tamaño.toString());

    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/stocks`, {
      headers: this.getHeaders(),
      params,
    });
  }

  getStocksResumen(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stocks/resumen`, {
      headers: this.getHeaders(),
    });
  }

  getStocksPorAlmacen(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/stocks/por-almacen`, {
      headers: this.getHeaders(),
    });
  }

  getStocksBajoMinimo(umbral = 10): Observable<any[]> {
    const params = new HttpParams().set('umbral', umbral.toString());
    return this.http.get<any[]>(`${this.baseUrl}/stocks/bajo-minimo`, {
      headers: this.getHeaders(),
      params,
    });
  }

  // ============================================================================
  // CATÁLOGOS BASE
  // ============================================================================

  getClases(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/clases`, {
      headers: this.getHeaders(),
    });
  }

  getUnidades(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/unidades`, {
      headers: this.getHeaders(),
    });
  }

  // ============================================================================
  // REPORTES
  // ============================================================================

  getInventarioValorizado(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reportes/inventario-valorizado`, {
      headers: this.getHeaders(),
    });
  }

  getRotacionInventario(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reportes/rotacion-inventario`, {
      headers: this.getHeaders(),
    });
  }

  getAnalisisABC(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reportes/analisis-abc`, {
      headers: this.getHeaders(),
    });
  }

  getPerformanceProveedores(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reportes/performance-proveedores`, {
      headers: this.getHeaders(),
    });
  }

  // ============================================================================
  // LOGS Y AUDITORÍA
  // ============================================================================

  getLogs(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/logs`, {
      headers: this.getHeaders(),
    });
  }

  buscarLogs(filtros: any): Observable<ApiResponse<any[]>> {
    let params = new HttpParams();

    if (filtros.usuario) {
      params = params.set('usuario', filtros.usuario.toString());
    }
    if (filtros.modulo) {
      params = params.set('modulo', filtros.modulo);
    }
    if (filtros.accion) {
      params = params.set('accion', filtros.accion);
    }
    if (filtros.tabla_afectada) {
      params = params.set('tabla_afectada', filtros.tabla_afectada);
    }
    if (filtros.ip_origen) {
      params = params.set('ip_origen', filtros.ip_origen);
    }
    if (filtros.fecha_desde) {
      params = params.set('fecha_desde', filtros.fecha_desde.toISOString());
    }
    if (filtros.fecha_hasta) {
      params = params.set('fecha_hasta', filtros.fecha_hasta.toISOString());
    }
    if (filtros.descripcion) {
      params = params.set('descripcion', filtros.descripcion);
    }

    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/logs/buscar`, {
      headers: this.getHeaders(),
      params,
    });
  }

  registrarLog(evento: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/logs`, evento, {
      headers: this.getHeaders(),
    });
  }

  // ============================================================================
  // INGRESOS
  // ============================================================================

  getIngresos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ingresos`, {
      headers: this.getHeaders(),
    });
  }

  buscarIngresos(filtros: any): Observable<any[]> {
    let params = new HttpParams();

    if (filtros.insumo) {
      params = params.set('insumo', filtros.insumo);
    }
    if (filtros.numero_remision) {
      params = params.set('numero_remision', filtros.numero_remision);
    }
    if (filtros.orden_compra) {
      params = params.set('orden_compra', filtros.orden_compra);
    }
    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }

    return this.http.get<any[]>(`${this.baseUrl}/ingresos/buscar`, {
      headers: this.getHeaders(),
      params,
    });
  }

  crearIngreso(ingreso: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/ingresos`, ingreso, {
      headers: this.getHeaders(),
    });
  }

  actualizarIngreso(ingreso: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/ingresos/${ingreso.id_ingreso}`,
      ingreso,
      {
        headers: this.getHeaders(),
      }
    );
  }

  // ============================================================================
  // CONSUMOS
  // ============================================================================

  getConsumos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/consumos`, {
      headers: this.getHeaders(),
    });
  }

  buscarConsumos(filtros: any): Observable<any[]> {
    let params = new HttpParams();

    if (filtros.insumo) {
      params = params.set('insumo', filtros.insumo);
    }
    if (filtros.area) {
      params = params.set('area', filtros.area);
    }
    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }
    if (filtros.responsable) {
      params = params.set('responsable', filtros.responsable);
    }

    return this.http.get<any[]>(`${this.baseUrl}/consumos/buscar`, {
      headers: this.getHeaders(),
      params,
    });
  }

  crearConsumo(consumo: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/consumos`, consumo, {
      headers: this.getHeaders(),
    });
  }

  actualizarConsumo(consumo: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/consumos/${consumo.id_consumo}`,
      consumo,
      {
        headers: this.getHeaders(),
      }
    );
  }

  // ============================================================================
  // RECETAS
  // ============================================================================

  getRecetas(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/recetas`, {
      headers: this.getHeaders(),
    });
  }

  getReceta(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/recetas/${id}`, {
      headers: this.getHeaders(),
    });
  }

  crearReceta(receta: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/recetas`, receta, {
      headers: this.getHeaders(),
    });
  }

  actualizarReceta(receta: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/recetas/${receta.id_receta}`,
      receta,
      {
        headers: this.getHeaders(),
      }
    );
  }

  eliminarReceta(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/recetas/${id}`, {
      headers: this.getHeaders(),
    });
  }

  buscarRecetas(filtros: any): Observable<ApiResponse<any[]>> {
    let params = new HttpParams();

    if (filtros.nombre) {
      params = params.set('nombre', filtros.nombre);
    }

    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/recetas/buscar`, {
      headers: this.getHeaders(),
      params,
    });
  }
}
