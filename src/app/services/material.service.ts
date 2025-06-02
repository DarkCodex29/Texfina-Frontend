import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  Insumo,
  Proveedor,
  Unidad,
  Clase,
  Lote,
  Ingreso,
  Almacen,
} from '../models/insumo.model';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  constructor() {}

  // Mock data basado en el diseño y la BD
  private unidades: Unidad[] = [
    { id_unidad: 'KG', nombre: 'Kilogramo' },
    { id_unidad: 'LT', nombre: 'Litro' },
    { id_unidad: 'UN', nombre: 'Unidad' },
    { id_unidad: 'MT', nombre: 'Metro' },
    { id_unidad: 'GR', nombre: 'Gramo' },
    { id_unidad: 'ML', nombre: 'Mililitro' },
  ];

  private clases: Clase[] = [
    { id_clase: 'QUIM', familia: 'Químicos', sub_familia: 'Químicos Básicos' },
    {
      id_clase: 'TINTAS',
      familia: 'Tintas',
      sub_familia: 'Tintas de Impresión',
    },
    {
      id_clase: 'MAT_PRIMA',
      familia: 'Materia Prima',
      sub_familia: 'Materia Prima Textil',
    },
    { id_clase: 'ACAB', familia: 'Acabados', sub_familia: 'Acabados Textiles' },
  ];

  private proveedores: Proveedor[] = [
    {
      id_proveedor: 1,
      empresa: 'Texfina',
      ruc: '20123456789',
      contacto: 'Juan Pérez',
    },
    {
      id_proveedor: 2,
      empresa: 'Empresa proveedora SAC',
      ruc: '20987654321',
      contacto: 'María García',
    },
    {
      id_proveedor: 3,
      empresa: 'Admisión ambulatoria',
      ruc: '20555666777',
      contacto: 'Carlos López',
    },
  ];

  private almacenes: Almacen[] = [
    { id_almacen: 1, nombre: 'Texfina', ubicacion: 'Almacén Principal' },
    { id_almacen: 2, nombre: 'Almacén Químicos', ubicacion: 'Área B' },
    { id_almacen: 3, nombre: 'Almacén Tintas', ubicacion: 'Área C' },
  ];

  private materiales: Insumo[] = [
    {
      id_insumo: 1,
      id_fox: '00001',
      nombre: 'Tinte 1',
      id_clase: 'TINTAS',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Bolsa 25kg',
      precio_unitario: 15.5,
      created_at: new Date('2001-02-01'),
    },
    {
      id_insumo: 2,
      id_fox: '00002',
      nombre: 'Tinte 2',
      id_clase: 'TINTAS',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Bolsa 25kg',
      precio_unitario: 18.75,
      created_at: new Date('2001-02-01'),
    },
    {
      id_insumo: 3,
      id_fox: '00003',
      nombre: 'Tinte 3',
      id_clase: 'TINTAS',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Bolsa 25kg',
      precio_unitario: 22.3,
      created_at: new Date('2001-02-01'),
    },
    {
      id_insumo: 4,
      id_fox: '00004',
      nombre: 'Tinte 4',
      id_clase: 'TINTAS',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Bolsa 25kg',
      precio_unitario: 16.8,
      created_at: new Date('2001-02-01'),
    },
  ];

  // Métodos para obtener datos
  getMateriales(): Observable<Insumo[]> {
    return of(this.materiales);
  }

  getMaterialById(id: number): Observable<Insumo | undefined> {
    const material = this.materiales.find((m) => m.id_insumo === id);
    return of(material);
  }

  getUnidades(): Observable<Unidad[]> {
    return of(this.unidades);
  }

  getClases(): Observable<Clase[]> {
    return of(this.clases);
  }

  getProveedores(): Observable<Proveedor[]> {
    return of(this.proveedores);
  }

  getAlmacenes(): Observable<Almacen[]> {
    return of(this.almacenes);
  }

  // Métodos CRUD para materiales
  crearMaterial(material: Insumo): Observable<Insumo> {
    const nuevoId =
      Math.max(...this.materiales.map((m) => m.id_insumo || 0)) + 1;
    const nuevoMaterial = {
      ...material,
      id_insumo: nuevoId,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.materiales.push(nuevoMaterial);
    return of(nuevoMaterial);
  }

  actualizarMaterial(material: Insumo): Observable<Insumo> {
    const index = this.materiales.findIndex(
      (m) => m.id_insumo === material.id_insumo
    );
    if (index !== -1) {
      this.materiales[index] = {
        ...material,
        updated_at: new Date(),
      };
      return of(this.materiales[index]);
    }
    throw new Error('Material no encontrado');
  }

  eliminarMaterial(id: number): Observable<boolean> {
    const index = this.materiales.findIndex((m) => m.id_insumo === id);
    if (index !== -1) {
      this.materiales.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  // Métodos para ingresos
  registrarIngreso(ingreso: Ingreso): Observable<Ingreso> {
    // Aquí se registraría el ingreso en la BD
    console.log('Registrando ingreso:', ingreso);
    return of(ingreso);
  }

  // Filtros y búsquedas
  buscarMateriales(filtros: {
    codigo?: string;
    descripcion?: string;
    proveedor?: string;
  }): Observable<Insumo[]> {
    let resultados = [...this.materiales];

    if (filtros.codigo) {
      resultados = resultados.filter((m) =>
        m.id_fox?.toLowerCase().includes(filtros.codigo!.toLowerCase())
      );
    }

    if (filtros.descripcion) {
      resultados = resultados.filter((m) =>
        m.nombre.toLowerCase().includes(filtros.descripcion!.toLowerCase())
      );
    }

    // Implementar filtro por proveedor cuando se tenga la relación

    return of(resultados);
  }
}
