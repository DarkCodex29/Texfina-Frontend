import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Lote } from '../models/insumo.model';

@Injectable({
  providedIn: 'root',
})
export class LotesService {
  constructor(private apiService: ApiService) {}

  // ============================================================================
  // MÉTODOS PRINCIPALES - USANDO API REAL
  // ============================================================================

  getLotes(pagina: number = 1, tamaño: number = 10): Observable<any> {
    return this.apiService.getLotes(pagina, tamaño).pipe(
      catchError(() =>
        of({
          data: this.getMockLotes(),
          total: this.getMockLotes().length,
          pagina: pagina,
          totalPaginas: Math.ceil(this.getMockLotes().length / tamaño),
        })
      )
    );
  }

  getLote(id: number): Observable<Lote | null> {
    return this.apiService.getLote(id).pipe(
      catchError(() => {
        const lote = this.getMockLotes().find((l) => l.id_lote === id);
        return of(lote || null);
      })
    );
  }

  getLotesActivos(): Observable<Lote[]> {
    return this.apiService
      .getLotesActivos()
      .pipe(
        catchError(() =>
          of(this.getMockLotes().filter((l) => l.estado_lote === 'ACTIVO'))
        )
      );
  }

  getLotesPorVencer(diasAlerta: number = 30): Observable<any[]> {
    return this.apiService.getLotesPorVencer(diasAlerta).pipe(
      catchError(() => {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + diasAlerta);

        return of(
          this.getMockLotes()
            .filter(
              (l) =>
                l.fecha_expiracion &&
                new Date(l.fecha_expiracion) <= fechaLimite
            )
            .map((l) => ({
              ...l,
              diasRestantes: this.calcularDiasRestantes(l.fecha_expiracion!),
              criticidad: this.calcularCriticidad(l.fecha_expiracion!),
            }))
        );
      })
    );
  }

  getLotesVencidos(): Observable<Lote[]> {
    return this.apiService.getLotesVencidos().pipe(
      catchError(() => {
        const hoy = new Date();
        return of(
          this.getMockLotes().filter(
            (l) => l.fecha_expiracion && new Date(l.fecha_expiracion) < hoy
          )
        );
      })
    );
  }

  getEstadisticas(): Observable<any> {
    return this.apiService.getLotesEstadisticas().pipe(
      catchError(() => {
        const lotes = this.getMockLotes();
        return of({
          fechaConsulta: new Date().toISOString(),
          totalItems: lotes.length,
          itemsActivos: lotes.filter((l) => l.estado_lote === 'ACTIVO').length,
          valorTotal: lotes.reduce((sum, l) => sum + (l.precio_total || 0), 0),
          detalles: lotes,
        });
      })
    );
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  private calcularDiasRestantes(fechaExpiracion: Date): number {
    const hoy = new Date();
    const expiracion = new Date(fechaExpiracion);
    const diffTime = expiracion.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private calcularCriticidad(fechaExpiracion: Date): string {
    const dias = this.calcularDiasRestantes(fechaExpiracion);
    if (dias <= 7) return 'CRITICO';
    if (dias <= 15) return 'ALTO';
    if (dias <= 30) return 'MEDIO';
    return 'BAJO';
  }

  // ============================================================================
  // DATOS MOCK COMO FALLBACK
  // ============================================================================

  private getMockLotes(): Lote[] {
    return [
      {
        id_lote: 1,
        lote: 'LT2024001',
        id_insumo: 1,
        ubicacion: 'Almacén Principal - A1',
        stock_inicial: 500,
        stock_actual: 350,
        fecha_expiracion: new Date('2025-06-14'),
        precio_total: 7750,
        estado_lote: 'ACTIVO',
      },
      {
        id_lote: 2,
        lote: 'LT2024002',
        id_insumo: 2,
        ubicacion: 'Almacén Químicos - B2',
        stock_inicial: 300,
        stock_actual: 180,
        fecha_expiracion: new Date('2025-12-19'),
        precio_total: 6840,
        estado_lote: 'ACTIVO',
      },
      {
        id_lote: 3,
        lote: 'LT2024003',
        id_insumo: 3,
        ubicacion: 'Almacén Tintas - C1',
        stock_inicial: 100,
        stock_actual: 25,
        fecha_expiracion: new Date('2026-03-09'),
        precio_total: 4500,
        estado_lote: 'ACTIVO',
      },
      {
        id_lote: 4,
        lote: 'LT2024004',
        id_insumo: 4,
        ubicacion: 'Almacén Tintas - C2',
        stock_inicial: 80,
        stock_actual: 0,
        fecha_expiracion: new Date('2025-08-29'),
        precio_total: 3080,
        estado_lote: 'AGOTADO',
      },
      {
        id_lote: 5,
        lote: 'LT2024005',
        id_insumo: 5,
        ubicacion: 'Almacén Materia Prima - D1',
        stock_inicial: 1000,
        stock_actual: 750,
        fecha_expiracion: undefined,
        precio_total: 6800,
        estado_lote: 'ACTIVO',
      },
      {
        id_lote: 6,
        lote: 'LT2024006',
        id_insumo: 6,
        ubicacion: 'Almacén Materia Prima - D2',
        stock_inicial: 200,
        stock_actual: 50,
        fecha_expiracion: undefined,
        precio_total: 2460,
        estado_lote: 'ACTIVO',
      },
      {
        id_lote: 7,
        lote: 'LT2024007',
        id_insumo: 1,
        ubicacion: 'Almacén Principal - A2',
        stock_inicial: 400,
        stock_actual: 400,
        fecha_expiracion: new Date('2024-02-09'),
        precio_total: 6200,
        estado_lote: 'VENCIDO',
      },
      {
        id_lote: 8,
        lote: 'LT2024008',
        id_insumo: 7,
        ubicacion: 'Almacén Acabados - E1',
        stock_inicial: 150,
        stock_actual: 120,
        fecha_expiracion: new Date('2025-01-24'),
        precio_total: 14250,
        estado_lote: 'ACTIVO',
      },
      {
        id_lote: 9,
        lote: 'LT2024009',
        id_insumo: 8,
        ubicacion: 'Almacén Acabados - E2',
        stock_inicial: 60,
        stock_actual: 35,
        fecha_expiracion: new Date('2026-09-14'),
        precio_total: 534,
        estado_lote: 'RESERVADO',
      },
      {
        id_lote: 10,
        lote: 'LT2024010',
        id_insumo: 9,
        ubicacion: 'Almacén Mantenimiento - F1',
        stock_inicial: 250,
        stock_actual: 15,
        fecha_expiracion: undefined,
        precio_total: 4175,
        estado_lote: 'ACTIVO',
      },
    ];
  }

  // ============================================================================
  // MÉTODOS CRUD (Preparados para implementación futura)
  // ============================================================================

  crearLote(lote: any): Observable<Lote> {
    // TODO: Implementar POST a la API
    const nuevoId =
      Math.max(...this.getMockLotes().map((l) => l.id_lote || 0)) + 1;
    return of({
      ...lote,
      id_lote: nuevoId,
      estado_lote: lote.estado_lote || 'ACTIVO',
    });
  }

  actualizarLote(lote: Lote): Observable<Lote> {
    // TODO: Implementar PUT a la API
    return of(lote);
  }

  eliminarLote(id: number): Observable<boolean> {
    // TODO: Implementar DELETE a la API
    return of(true);
  }

  buscarLotes(filtros: any): Observable<Lote[]> {
    // TODO: Implementar búsqueda en la API
    let resultados = this.getMockLotes();

    if (filtros.lote) {
      resultados = resultados.filter((l) =>
        l.lote?.toLowerCase().includes(filtros.lote!.toLowerCase())
      );
    }

    if (filtros.estado) {
      resultados = resultados.filter((l) => l.estado_lote === filtros.estado);
    }

    if (filtros.ubicacion) {
      resultados = resultados.filter((l) =>
        l.ubicacion?.toLowerCase().includes(filtros.ubicacion!.toLowerCase())
      );
    }

    return of(resultados);
  }
}
