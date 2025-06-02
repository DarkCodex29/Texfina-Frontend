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
      direccion: 'Av. Industrial 123, Lima',
      telefono: '234-837',
      email: 'empresa@mail.com',
    },
    {
      id_proveedor: 2,
      empresa: 'Empresa proveedora SAC',
      ruc: '20987654321',
      contacto: 'María García',
      direccion: 'Jr. Comercio 456, Callao',
      telefono: '234-838',
      email: 'ventas@proveedor.com',
    },
    {
      id_proveedor: 3,
      empresa: 'Admisión ambulatoria',
      ruc: '20555666777',
      contacto: 'Carlos López',
      direccion: 'Calle Principal 789, San Isidro',
      telefono: '234-839',
      email: 'contacto@admision.com',
    },
    {
      id_proveedor: 4,
      empresa: 'Química Industrial SAC',
      ruc: '20111222333',
      contacto: 'Ana Torres',
      direccion: 'Av. Los Químicos 321, Ate',
      telefono: '234-840',
      email: 'quimica@industrial.com',
    },
    {
      id_proveedor: 5,
      empresa: 'Tintas & Colores EIRL',
      ruc: '20444555666',
      contacto: 'Pedro Ramírez',
      direccion: 'Jr. Colores 654, Breña',
      telefono: '234-841',
      email: 'tintas@colores.com',
    },
    {
      id_proveedor: 6,
      empresa: 'Textiles del Norte',
      ruc: '20777888999',
      contacto: 'Lucia Mendoza',
      direccion: 'Av. Textil 987, Comas',
      telefono: '234-842',
      email: 'textiles@norte.com',
    },
    {
      id_proveedor: 7,
      empresa: 'Importaciones Lima SAC',
      ruc: '20123789456',
      contacto: 'Roberto Silva',
      direccion: 'Calle Importación 147, La Victoria',
      telefono: '234-843',
      email: 'importaciones@lima.com',
    },
    {
      id_proveedor: 8,
      empresa: 'Proveedores Unión',
      ruc: '20987321654',
      contacto: 'Carmen Flores',
      direccion: 'Jr. Unión 258, Rimac',
      telefono: '234-844',
      email: 'union@proveedores.com',
    },
    {
      id_proveedor: 9,
      empresa: 'Global Chemicals',
      ruc: '20456123789',
      contacto: 'Miguel Vargas',
      direccion: 'Av. Global 369, San Miguel',
      telefono: '234-845',
      email: 'global@chemicals.com',
    },
    {
      id_proveedor: 10,
      empresa: 'Distribuidora Central',
      ruc: '20654987321',
      contacto: 'Patricia Ruiz',
      direccion: 'Calle Central 741, Cercado',
      telefono: '234-846',
      email: 'central@distribuidora.com',
    },
    {
      id_proveedor: 11,
      empresa: 'Productos Especiales SA',
      ruc: '20789456123',
      contacto: 'Fernando Castro',
      direccion: 'Jr. Especiales 852, Magdalena',
      telefono: '234-847',
      email: 'especiales@productos.com',
    },
    {
      id_proveedor: 12,
      empresa: 'Materias Primas del Sur',
      ruc: '20321654987',
      contacto: 'Gabriela Morales',
      direccion: 'Av. Sur 963, Villa El Salvador',
      telefono: '234-848',
      email: 'materias@sur.com',
    },
    {
      id_proveedor: 13,
      empresa: 'Industrias Químicas ABC',
      ruc: '20159753486',
      contacto: 'Daniel Herrera',
      direccion: 'Calle ABC 159, Santa Anita',
      telefono: '234-849',
      email: 'abc@industrias.com',
    },
    {
      id_proveedor: 14,
      empresa: 'Comercial Textil Express',
      ruc: '20753159486',
      contacto: 'Verónica Jiménez',
      direccion: 'Jr. Express 357, El Agustino',
      telefono: '234-850',
      email: 'express@textil.com',
    },
    {
      id_proveedor: 15,
      empresa: 'Suministros Industriales',
      ruc: '20486159753',
      contacto: 'Arturo Ponce',
      direccion: 'Av. Industrial 468, Puente Piedra',
      telefono: '234-851',
      email: 'suministros@industrial.com',
    },
    {
      id_proveedor: 16,
      empresa: 'Química Premium SAC',
      ruc: '20852741963',
      contacto: 'Mónica Delgado',
      direccion: 'Calle Premium 579, San Borja',
      telefono: '234-852',
      email: 'premium@quimica.com',
    },
    {
      id_proveedor: 17,
      empresa: 'Distribuidora Nacional',
      ruc: '20963852741',
      contacto: 'Raúl Espinoza',
      direccion: 'Jr. Nacional 681, Los Olivos',
      telefono: '234-853',
      email: 'nacional@distribuidora.com',
    },
    {
      id_proveedor: 18,
      empresa: 'Exportaciones & Más',
      ruc: '20741963852',
      contacto: 'Sandra Vega',
      direccion: 'Av. Exportación 792, Surco',
      telefono: '234-854',
      email: 'exportaciones@mas.com',
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
    {
      id_insumo: 5,
      id_fox: '00005',
      nombre: 'Ácido Acético',
      id_clase: 'QUIM',
      peso_unitario: 1.0,
      id_unidad: 'LT',
      presentacion: 'Bidón 20L',
      precio_unitario: 25.5,
      created_at: new Date('2001-03-15'),
    },
    {
      id_insumo: 6,
      id_fox: '00006',
      nombre: 'Peróxido de Hidrógeno',
      id_clase: 'QUIM',
      peso_unitario: 1.0,
      id_unidad: 'LT',
      presentacion: 'Bidón 25L',
      precio_unitario: 32.0,
      created_at: new Date('2001-03-20'),
    },
    {
      id_insumo: 7,
      id_fox: '00007',
      nombre: 'Soda Cáustica',
      id_clase: 'QUIM',
      peso_unitario: 25.0,
      id_unidad: 'KG',
      presentacion: 'Saco 25kg',
      precio_unitario: 18.75,
      created_at: new Date('2001-04-10'),
    },
    {
      id_insumo: 8,
      id_fox: '00008',
      nombre: 'Algodón Peinado',
      id_clase: 'MAT_PRIMA',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Fardo 100kg',
      precio_unitario: 12.5,
      created_at: new Date('2001-04-25'),
    },
    {
      id_insumo: 9,
      id_fox: '00009',
      nombre: 'Poliéster DTY',
      id_clase: 'MAT_PRIMA',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Bobina 50kg',
      precio_unitario: 8.9,
      created_at: new Date('2001-05-05'),
    },
    {
      id_insumo: 10,
      id_fox: '00010',
      nombre: 'Suavizante Textil',
      id_clase: 'ACAB',
      peso_unitario: 1.0,
      id_unidad: 'LT',
      presentacion: 'Bidón 50L',
      precio_unitario: 28.0,
      created_at: new Date('2001-05-12'),
    },
    {
      id_insumo: 11,
      id_fox: '00011',
      nombre: 'Tinte Azul Reactivo',
      id_clase: 'TINTAS',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Bolsa 25kg',
      precio_unitario: 45.0,
      created_at: new Date('2001-05-18'),
    },
    {
      id_insumo: 12,
      id_fox: '00012',
      nombre: 'Tinte Rojo Directo',
      id_clase: 'TINTAS',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Bolsa 25kg',
      precio_unitario: 38.5,
      created_at: new Date('2001-06-02'),
    },
    {
      id_insumo: 13,
      id_fox: '00013',
      nombre: 'Carbonato de Sodio',
      id_clase: 'QUIM',
      peso_unitario: 25.0,
      id_unidad: 'KG',
      presentacion: 'Saco 25kg',
      precio_unitario: 15.25,
      created_at: new Date('2001-06-08'),
    },
    {
      id_insumo: 14,
      id_fox: '00014',
      nombre: 'Dispersante Químico',
      id_clase: 'QUIM',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Bolsa 20kg',
      precio_unitario: 65.0,
      created_at: new Date('2001-06-15'),
    },
    {
      id_insumo: 15,
      id_fox: '00015',
      nombre: 'Lycra 40 Denier',
      id_clase: 'MAT_PRIMA',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Bobina 25kg',
      precio_unitario: 95.0,
      created_at: new Date('2001-06-22'),
    },
    {
      id_insumo: 16,
      id_fox: '00016',
      nombre: 'Antiespumante',
      id_clase: 'ACAB',
      peso_unitario: 1.0,
      id_unidad: 'LT',
      presentacion: 'Bidón 20L',
      precio_unitario: 42.0,
      created_at: new Date('2001-07-01'),
    },
    {
      id_insumo: 17,
      id_fox: '00017',
      nombre: 'Tinte Verde Básico',
      id_clase: 'TINTAS',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Bolsa 25kg',
      precio_unitario: 52.5,
      created_at: new Date('2001-07-08'),
    },
    {
      id_insumo: 18,
      id_fox: '00018',
      nombre: 'Viscosa Fibra',
      id_clase: 'MAT_PRIMA',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Fardo 80kg',
      precio_unitario: 14.75,
      created_at: new Date('2001-07-15'),
    },
    {
      id_insumo: 19,
      id_fox: '00019',
      nombre: 'Secuestrante EDTA',
      id_clase: 'QUIM',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Bolsa 25kg',
      precio_unitario: 28.9,
      created_at: new Date('2001-07-22'),
    },
    {
      id_insumo: 20,
      id_fox: '00020',
      nombre: 'Fijador de Color',
      id_clase: 'ACAB',
      peso_unitario: 1.0,
      id_unidad: 'LT',
      presentacion: 'Bidón 25L',
      precio_unitario: 35.0,
      created_at: new Date('2001-07-28'),
    },
    {
      id_insumo: 21,
      id_fox: '00021',
      nombre: 'Tinte Negro Sulfuroso',
      id_clase: 'TINTAS',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Bolsa 25kg',
      precio_unitario: 33.25,
      created_at: new Date('2001-08-05'),
    },
    {
      id_insumo: 22,
      id_fox: '00022',
      nombre: 'Nylon 6.6 Texturizado',
      id_clase: 'MAT_PRIMA',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Bobina 40kg',
      precio_unitario: 78.0,
      created_at: new Date('2001-08-12'),
    },
    {
      id_insumo: 23,
      id_fox: '00023',
      nombre: 'Humectante Textil',
      id_clase: 'ACAB',
      peso_unitario: 1.0,
      id_unidad: 'LT',
      presentacion: 'Bidón 30L',
      precio_unitario: 22.5,
      created_at: new Date('2001-08-18'),
    },
    {
      id_insumo: 24,
      id_fox: '00024',
      nombre: 'Tinte Amarillo Ácido',
      id_clase: 'TINTAS',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Bolsa 25kg',
      precio_unitario: 41.75,
      created_at: new Date('2001-08-25'),
    },
    {
      id_insumo: 25,
      id_fox: '00025',
      nombre: 'Polipropileno BCF',
      id_clase: 'MAT_PRIMA',
      peso_unitario: 1.0,
      id_unidad: 'KG',
      presentacion: 'Bobina 60kg',
      precio_unitario: 6.8,
      created_at: new Date('2001-09-01'),
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
