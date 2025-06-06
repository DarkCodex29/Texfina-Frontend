import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interfaces para la API según README_CONTROLADORES.md
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
  detalles: unknown[];
}

export interface DashboardResumen {
  totalInsumos: number;
  valorInventario: number;
  stockBajo: number;
  vencimientosProximos: number;
  proveedoresActivos: number;
  ingresosMes: number;
  consumosMes: number;
  rotacionPromedio: number;
}

export interface AlertaDashboard {
  tipo: 'CRITICO' | 'ALTO' | 'MEDIO';
  titulo: string;
  descripcion: string;
  cantidad: number;
  enlace?: string;
}

export interface KpiDashboard {
  nombre: string;
  valor: number;
  unidad: string;
  tendencia: 'up' | 'down' | 'stable';
  porcentajeCambio: number;
  descripcion: string;
}

@Injectable({
  providedIn: 'root',
})
export class TexfinaApiService {
  private baseUrl = environment.apiUrl || 'http://localhost:5116/api';
  private tokenSubject = new BehaviorSubject<string | null>(
    this.getStoredToken()
  );
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ============================================================================
  // GESTIÓN DE AUTENTICACIÓN
  // ============================================================================

  private getStoredToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('texfina_token');
    }
    return null;
  }

  private setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('texfina_token', token);
    }
    this.tokenSubject.next(token);
  }

  private removeToken(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('texfina_token');
    }
    this.tokenSubject.next(null);
  }

  private getHeaders(): HttpHeaders {
    const token = this.getStoredToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    });
  }

  private handleError(error: unknown): Observable<never> {
    console.error('Error de API:', error);
    return throwError(() => error);
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
        }),
        catchError(this.handleError)
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

  getDashboardResumen(): Observable<DashboardResumen> {
    return this.http
      .get<DashboardResumen>(`${this.baseUrl}/dashboard/resumen`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getDashboardAlertas(): Observable<AlertaDashboard[]> {
    return this.http
      .get<AlertaDashboard[]>(`${this.baseUrl}/dashboard/alertas`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getDashboardKpis(): Observable<KpiDashboard[]> {
    return this.http
      .get<KpiDashboard[]>(`${this.baseUrl}/dashboard/kpis`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // ============================================================================
  // ALMACENES
  // ============================================================================

  getAlmacenes(): Observable<unknown[]> {
    return this.http
      .get<unknown[]>(`${this.baseUrl}/almacenes`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getAlmacenesEstadisticas(): Observable<EstadisticasResponse> {
    return this.http
      .get<EstadisticasResponse>(`${this.baseUrl}/almacenes/estadisticas`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // ============================================================================
  // CLASES
  // ============================================================================

  getClases(): Observable<unknown[]> {
    return this.http
      .get<unknown[]>(`${this.baseUrl}/clases`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getClasesJerarquia(): Observable<unknown[]> {
    return this.http
      .get<unknown[]>(`${this.baseUrl}/clases/jerarquia`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // ============================================================================
  // UNIDADES
  // ============================================================================

  getUnidades(): Observable<unknown[]> {
    return this.http
      .get<unknown[]>(`${this.baseUrl}/unidades`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getUnidadesMasUtilizadas(): Observable<unknown[]> {
    return this.http
      .get<unknown[]>(`${this.baseUrl}/unidades/mas-utilizadas`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  buscarUnidades(termino: string): Observable<unknown[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http
      .get<unknown[]>(`${this.baseUrl}/unidades/buscar`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(catchError(this.handleError));
  }

  // ============================================================================
  // PROVEEDORES
  // ============================================================================

  getProveedores(
    pagina = 1,
    tamaño = 10,
    filtros?: unknown
  ): Observable<ApiResponse<unknown[]>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamaño', tamaño.toString());

    if (filtros && typeof filtros === 'object') {
      const filtrosObj = filtros as Record<string, unknown>;
      if (filtrosObj['buscar']) {
        params = params.set('buscar', String(filtrosObj['buscar']));
      }
    }

    return this.http
      .get<ApiResponse<unknown[]>>(`${this.baseUrl}/proveedores`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(catchError(this.handleError));
  }

  getProveedoresEstadisticas(): Observable<EstadisticasResponse> {
    return this.http
      .get<EstadisticasResponse>(`${this.baseUrl}/proveedores/estadisticas`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getTopProveedores(): Observable<unknown[]> {
    return this.http
      .get<unknown[]>(`${this.baseUrl}/proveedores/top`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  buscarProveedores(termino: string): Observable<unknown[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http
      .get<unknown[]>(`${this.baseUrl}/proveedores/buscar`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(catchError(this.handleError));
  }

  // ============================================================================
  // INSUMOS
  // ============================================================================

  getInsumos(
    pagina = 1,
    tamaño = 10,
    filtros?: unknown
  ): Observable<ApiResponse<unknown[]>> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamaño', tamaño.toString());

    if (filtros && typeof filtros === 'object') {
      const filtrosObj = filtros as Record<string, unknown>;
      if (filtrosObj['buscar']) {
        params = params.set('buscar', String(filtrosObj['buscar']));
      }
    }

    return this.http
      .get<ApiResponse<unknown[]>>(`${this.baseUrl}/insumos`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(catchError(this.handleError));
  }

  getInsumo(id: number): Observable<unknown> {
    return this.http
      .get(`${this.baseUrl}/insumos/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  buscarInsumos(termino: string): Observable<unknown[]> {
    const params = new HttpParams().set('termino', termino);
    return this.http
      .get<unknown[]>(`${this.baseUrl}/insumos/buscar`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(catchError(this.handleError));
  }

  getInsumosEstadisticas(): Observable<EstadisticasResponse> {
    return this.http
      .get<EstadisticasResponse>(`${this.baseUrl}/insumos/estadisticas`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getInsumosBajoStock(umbral = 10): Observable<unknown[]> {
    const params = new HttpParams().set('umbral', umbral.toString());
    return this.http
      .get<unknown[]>(`${this.baseUrl}/insumos/bajo-stock`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(catchError(this.handleError));
  }

  // ============================================================================
  // LOTES
  // ============================================================================

  getLotes(
    pagina = 1,
    tamaño = 10
  ): Observable<ApiResponse<unknown[]>> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamaño', tamaño.toString());

    return this.http
      .get<ApiResponse<unknown[]>>(`${this.baseUrl}/lotes`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(catchError(this.handleError));
  }

  getLote(id: number): Observable<unknown> {
    return this.http
      .get(`${this.baseUrl}/lotes/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getLotesActivos(): Observable<unknown[]> {
    return this.http
      .get<unknown[]>(`${this.baseUrl}/lotes/activos`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getLotesPorVencer(diasAlerta = 30): Observable<unknown[]> {
    const params = new HttpParams().set('diasAlerta', diasAlerta.toString());
    return this.http
      .get<unknown[]>(`${this.baseUrl}/lotes/por-vencer`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(catchError(this.handleError));
  }

  getLotesVencidos(): Observable<unknown[]> {
    return this.http
      .get<unknown[]>(`${this.baseUrl}/lotes/vencidos`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getLotesEstadisticas(): Observable<EstadisticasResponse> {
    return this.http
      .get<EstadisticasResponse>(`${this.baseUrl}/lotes/estadisticas`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // ============================================================================
  // STOCKS
  // ============================================================================

  getStocks(
    pagina = 1,
    tamaño = 10
  ): Observable<ApiResponse<unknown[]>> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('tamaño', tamaño.toString());

    return this.http
      .get<ApiResponse<unknown[]>>(`${this.baseUrl}/stocks`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(catchError(this.handleError));
  }

  getStocksResumen(): Observable<unknown> {
    return this.http
      .get(`${this.baseUrl}/stocks/resumen`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getStocksPorAlmacen(): Observable<unknown[]> {
    return this.http
      .get<unknown[]>(`${this.baseUrl}/stocks/por-almacen`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getStocksBajoMinimo(umbral = 10): Observable<unknown[]> {
    const params = new HttpParams().set('umbral', umbral.toString());
    return this.http
      .get<unknown[]>(`${this.baseUrl}/stocks/bajo-minimo`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(catchError(this.handleError));
  }

  // ============================================================================
  // REPORTES
  // ============================================================================

  getInventarioValorizado(): Observable<unknown> {
    return this.http
      .get(`${this.baseUrl}/reportes/inventario-valorizado`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getRotacionInventario(): Observable<unknown> {
    return this.http
      .get(`${this.baseUrl}/reportes/rotacion-inventario`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getAnalisisABC(): Observable<unknown> {
    return this.http
      .get(`${this.baseUrl}/reportes/analisis-abc`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getPerformanceProveedores(): Observable<unknown> {
    return this.http
      .get(`${this.baseUrl}/reportes/performance-proveedores`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // ============================================================================
  // INGRESOS
  // ============================================================================

  getIngresos(): Observable<unknown[]> {
    return this.http
      .get<unknown[]>(`${this.baseUrl}/ingresos`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  buscarIngresos(filtros: unknown): Observable<unknown[]> {
    const params = new HttpParams();

    if (filtros && typeof filtros === 'object') {
      const filtrosObj = filtros as Record<string, unknown>;
      Object.keys(filtrosObj).forEach((key) => {
        const value = filtrosObj[key];
        if (value !== null && value !== undefined) {
          params.set(key, String(value));
        }
      });
    }

    return this.http
      .get<unknown[]>(`${this.baseUrl}/ingresos/con-filtros`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(catchError(this.handleError));
  }

  crearIngreso(ingreso: unknown): Observable<unknown> {
    return this.http
      .post(`${this.baseUrl}/ingresos`, ingreso, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // ============================================================================
  // CONSUMOS
  // ============================================================================

  getConsumos(): Observable<unknown[]> {
    return this.http
      .get<unknown[]>(`${this.baseUrl}/consumos`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getConsumosEstadisticas(): Observable<unknown> {
    return this.http
      .get(`${this.baseUrl}/consumos/estadisticas`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getConsumosPorArea(): Observable<unknown[]> {
    return this.http
      .get<unknown[]>(`${this.baseUrl}/consumos/por-area`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }
}
