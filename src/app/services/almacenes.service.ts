import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Almacen } from '../models/insumo.model';

@Injectable({
  providedIn: 'root',
})
export class AlmacenesService {
  constructor(private apiService: ApiService) {}

  // ============================================================================
  // MÉTODOS PRINCIPALES - USANDO API REAL
  // ============================================================================

  getAlmacenes(): Observable<Almacen[]> {
    return this.apiService
      .getAlmacenes()
      .pipe(catchError(() => of(this.getMockAlmacenes())));
  }

  getEstadisticas(): Observable<any> {
    return this.apiService.getAlmacenesEstadisticas().pipe(
      catchError(() =>
        of({
          fechaConsulta: new Date().toISOString(),
          totalItems: 5,
          itemsActivos: 5,
          valorTotal: 125000.5,
          detalles: this.getMockAlmacenes(),
        })
      )
    );
  }

  // ============================================================================
  // DATOS MOCK COMO FALLBACK
  // ============================================================================

  private getMockAlmacenes(): Almacen[] {
    return [
      {
        id_almacen: 1,
        nombre: 'Almacén Principal',
        ubicacion: 'Planta - Área A',
      },
      {
        id_almacen: 2,
        nombre: 'Almacén de Químicos',
        ubicacion: 'Planta - Área B',
      },
      {
        id_almacen: 3,
        nombre: 'Almacén de Tintas',
        ubicacion: 'Planta - Área C',
      },
      {
        id_almacen: 4,
        nombre: 'Almacén de Materia Prima',
        ubicacion: 'Planta - Área D',
      },
      {
        id_almacen: 5,
        nombre: 'Almacén de Acabados',
        ubicacion: 'Planta - Área E',
      },
    ];
  }

  // ============================================================================
  // MÉTODOS CRUD (Preparados para implementación futura)
  // ============================================================================

  crearAlmacen(almacen: Almacen): Observable<Almacen> {
    // TODO: Implementar POST a la API
    const nuevoId =
      Math.max(...this.getMockAlmacenes().map((a) => a.id_almacen || 0)) + 1;
    return of({
      ...almacen,
      id_almacen: nuevoId,
    });
  }

  actualizarAlmacen(almacen: Almacen): Observable<Almacen> {
    // TODO: Implementar PUT a la API
    return of(almacen);
  }

  eliminarAlmacen(id: number): Observable<boolean> {
    // TODO: Implementar DELETE a la API
    return of(true);
  }

  buscarAlmacenes(filtros: {
    nombre?: string;
    ubicacion?: string;
  }): Observable<Almacen[]> {
    // TODO: Implementar búsqueda en la API
    let resultados = this.getMockAlmacenes();

    if (filtros.nombre) {
      resultados = resultados.filter((a) =>
        a.nombre.toLowerCase().includes(filtros.nombre!.toLowerCase())
      );
    }

    if (filtros.ubicacion) {
      resultados = resultados.filter((a) =>
        (a.ubicacion || '')
          .toLowerCase()
          .includes(filtros.ubicacion!.toLowerCase())
      );
    }

    return of(resultados);
  }
}
