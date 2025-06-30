import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  Insumo,
  Proveedor,
  Unidad,
  Clase,
  Lote,
  Ingreso,
  Almacen,
  Usuario,
  Rol,
  TipoUsuario,
  Permiso,
  RolPermiso,
  Stock,
  Consumo,
  Receta,
  RecetaDetalle,
  UsuarioFormDto,
  ProveedorFormDto,
  InsumoFormDto,
  IngresoFormDto,
  AlmacenFormDto,
  UnidadFormDto,
  LoteFormDto,
  LogEvento,
} from '../models/insumo.model';

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  constructor(private apiService: ApiService) {}

  // ============================================================================
  // CONFIGURACIÓN
  // ============================================================================
  private useApi = true; // Cambiar a false para usar datos mock

  // ============================================================================
  // DATOS DE CONFIGURACIÓN INICIALES (FALLBACK PARA MODO MOCK)
  // ============================================================================

  // ===== ROLES =====
  private roles: Rol[] = [
    {
      id_rol: 'ADMIN',
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema',
    },
    {
      id_rol: 'SUPERVISOR',
      nombre: 'Supervisor',
      descripcion: 'Supervisión de operaciones',
    },
    {
      id_rol: 'OPERARIO',
      nombre: 'Operario',
      descripcion: 'Operaciones básicas de insumos',
    },
    {
      id_rol: 'CONSULTOR',
      nombre: 'Consultor',
      descripcion: 'Solo consulta de información',
    },
  ];

  // ===== TIPOS DE USUARIO =====
  private tiposUsuario: TipoUsuario[] = [
    {
      id_tipo_usuario: 1,
      descripcion: 'Usuario Regular',
      requiere_cierre_automatico: false,
    },
    {
      id_tipo_usuario: 2,
      descripcion: 'Usuario Temporal',
      requiere_cierre_automatico: true,
    },
    {
      id_tipo_usuario: 3,
      descripcion: 'Usuario Externo',
      requiere_cierre_automatico: true,
    },
  ];

  // ===== PERMISOS =====
  private permisos: Permiso[] = [
    { id_permiso: 1, nombre: 'USUARIOS_CREAR', descripcion: 'Crear usuarios' },
    {
      id_permiso: 2,
      nombre: 'USUARIOS_EDITAR',
      descripcion: 'Editar usuarios',
    },
    {
      id_permiso: 3,
      nombre: 'USUARIOS_ELIMINAR',
      descripcion: 'Eliminar usuarios',
    },
    {
      id_permiso: 4,
      nombre: 'USUARIOS_CONSULTAR',
      descripcion: 'Consultar usuarios',
    },
    { id_permiso: 5, nombre: 'INSUMOS_CREAR', descripcion: 'Crear insumos' },
    { id_permiso: 6, nombre: 'INSUMOS_EDITAR', descripcion: 'Editar insumos' },
    {
      id_permiso: 7,
      nombre: 'INSUMOS_ELIMINAR',
      descripcion: 'Eliminar insumos',
    },
    {
      id_permiso: 8,
      nombre: 'INSUMOS_CONSULTAR',
      descripcion: 'Consultar insumos',
    },
    {
      id_permiso: 9,
      nombre: 'STOCK_CONSULTAR',
      descripcion: 'Consultar stock',
    },
    {
      id_permiso: 10,
      nombre: 'STOCK_GESTIONAR',
      descripcion: 'Gestionar stock',
    },
    {
      id_permiso: 11,
      nombre: 'REPORTES_GENERAR',
      descripcion: 'Generar reportes',
    },
    {
      id_permiso: 12,
      nombre: 'CONFIGURACION',
      descripcion: 'Configuración del sistema',
    },
    {
      id_permiso: 13,
      nombre: 'PROVEEDORES_CREAR',
      descripcion: 'Crear proveedores',
    },
    {
      id_permiso: 14,
      nombre: 'PROVEEDORES_EDITAR',
      descripcion: 'Editar proveedores',
    },
    {
      id_permiso: 15,
      nombre: 'PROVEEDORES_ELIMINAR',
      descripcion: 'Eliminar proveedores',
    },
    {
      id_permiso: 16,
      nombre: 'PROVEEDORES_CONSULTAR',
      descripcion: 'Consultar proveedores',
    },
    { id_permiso: 17, nombre: 'LOTES_CREAR', descripcion: 'Crear lotes' },
    { id_permiso: 18, nombre: 'LOTES_EDITAR', descripcion: 'Editar lotes' },
    { id_permiso: 19, nombre: 'LOTES_ELIMINAR', descripcion: 'Eliminar lotes' },
    {
      id_permiso: 20,
      nombre: 'LOTES_CONSULTAR',
      descripcion: 'Consultar lotes',
    },
    {
      id_permiso: 21,
      nombre: 'ALMACENES_CREAR',
      descripcion: 'Crear almacenes',
    },
    {
      id_permiso: 22,
      nombre: 'ALMACENES_EDITAR',
      descripcion: 'Editar almacenes',
    },
    {
      id_permiso: 23,
      nombre: 'ALMACENES_ELIMINAR',
      descripcion: 'Eliminar almacenes',
    },
    {
      id_permiso: 24,
      nombre: 'ALMACENES_CONSULTAR',
      descripcion: 'Consultar almacenes',
    },
  ];

  // ===== USUARIOS =====
  private usuarios: Usuario[] = [
    {
      id_usuario: 1,
      username: 'admin',
      email: 'admin@texfina.com',
      id_rol: 'ADMIN',
      id_tipo_usuario: 1,
      activo: true,
      created_at: new Date('2024-01-01'),
      last_login: new Date(),
    },
    {
      id_usuario: 2,
      username: 'supervisor01',
      email: 'supervisor@texfina.com',
      id_rol: 'SUPERVISOR',
      id_tipo_usuario: 1,
      activo: true,
      created_at: new Date('2024-01-01'),
      last_login: new Date(),
    },
    {
      id_usuario: 3,
      username: 'operario01',
      email: 'operario@texfina.com',
      id_rol: 'OPERARIO',
      id_tipo_usuario: 1,
      activo: true,
      created_at: new Date('2024-01-01'),
      last_login: new Date(),
    },
    {
      id_usuario: 4,
      username: 'consultor01',
      email: 'consultor@texfina.com',
      id_rol: 'CONSULTOR',
      id_tipo_usuario: 2,
      activo: true,
      created_at: new Date('2024-01-01'),
      last_login: new Date(),
    },
  ];

  // ===== UNIDADES (FALLBACK) =====
  private unidadesMock: Unidad[] = [
    { id_unidad: 'KG', nombre: 'Kilogramo' },
    { id_unidad: 'LT', nombre: 'Litro' },
    { id_unidad: 'UN', nombre: 'Unidad' },
    { id_unidad: 'MT', nombre: 'Metro' },
    { id_unidad: 'GR', nombre: 'Gramo' },
    { id_unidad: 'ML', nombre: 'Mililitro' },
    { id_unidad: 'CM', nombre: 'Centímetro' },
    { id_unidad: 'M2', nombre: 'Metro Cuadrado' },
    { id_unidad: 'M3', nombre: 'Metro Cúbico' },
    { id_unidad: 'TON', nombre: 'Tonelada' },
    { id_unidad: 'CAJA', nombre: 'Caja' },
  ];

  // ===== CLASES (FALLBACK) =====
  private clasesMock: Clase[] = [
    { id_clase: 'CC', familia: 'COLORANTE', sub_familia: 'REACTIVO' },
    { id_clase: 'CA', familia: 'COLORANTE', sub_familia: 'DISPERSO' },
    { id_clase: 'CA', familia: 'COLORANTE', sub_familia: 'CATIONICO' },
    { id_clase: 'CA', familia: 'COLORANTE', sub_familia: 'ACIDO' },
    { id_clase: 'CA', familia: 'COLORANTE', sub_familia: 'OPTICO' },
    { id_clase: 'CA', familia: 'COLORANTE', sub_familia: 'DIRECTO' },
    { id_clase: 'CD', familia: 'COLORANTE', sub_familia: 'TINTORERIA' },
    { id_clase: 'CD', familia: 'COLORANTE', sub_familia: 'ACABADO' },
    { id_clase: 'CDP', familia: 'COLORANTE', sub_familia: 'DISPERSO' },
    { id_clase: 'CR', familia: 'COLORANTE', sub_familia: 'REACTIVO' },
  ];

  // ============================================================================
  // MÉTODOS PRINCIPALES - USO DE API O MOCK
  // ============================================================================

  // ===== ALMACENES =====
  getAlmacenes(): Observable<Almacen[]> {
    if (this.useApi) {
      return this.apiService
        .getAlmacenes()
        .pipe(catchError(() => of(this.getAlmacenesMock())));
    }
    return of(this.getAlmacenesMock());
  }

  private getAlmacenesMock(): Almacen[] {
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

  // ===== PROVEEDORES =====
  getProveedores(): Observable<Proveedor[]> {
    if (this.useApi) {
      return this.apiService.getProveedores().pipe(
        map((response) => response.data || response),
        catchError(() => of(this.getProveedoresMock()))
      );
    }
    return of(this.getProveedoresMock());
  }

  private getProveedoresMock(): Proveedor[] {
    return [
      {
        id_proveedor: 1,
        empresa: 'Químicos Industriales SAC',
        ruc: '20123456789',
        contacto: 'Juan Pérez',
        direccion: 'Av. Industrial 123, Lima',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
      {
        id_proveedor: 2,
        empresa: 'Textiles del Sur EIRL',
        ruc: '20987654321',
        contacto: 'María García',
        direccion: 'Jr. Comercio 456, Arequipa',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
      {
        id_proveedor: 3,
        empresa: 'Fibras y Materiales SA',
        ruc: '20555666777',
        contacto: 'Carlos López',
        direccion: 'Av. Producción 789, Trujillo',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
      {
        id_proveedor: 4,
        empresa: 'Tintas Especializadas Perú',
        ruc: '20444333222',
        contacto: 'Ana Torres',
        direccion: 'Av. Tecnología 321, Lima',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
      {
        id_proveedor: 5,
        empresa: 'Acabados Textiles Premium',
        ruc: '20111222333',
        contacto: 'Roberto Silva',
        direccion: 'Jr. Innovación 654, Cusco',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      },
    ];
  }

  // ===== MATERIALES/INSUMOS =====
  getMateriales(): Observable<Insumo[]> {
    if (this.useApi) {
      return this.apiService.getInsumos().pipe(
        map((response) => response.data || response),
        catchError(() => of(this.getMaterialesMock()))
      );
    }
    return of(this.getMaterialesMock());
  }

  private getMaterialesMock(): Insumo[] {
    const materiales = [
      {
        id_insumo: 1,
        id_fox: '0003686',
        nombre: 'BASICO AMARILLO X-8GL 250%',
        id_clase: 'CC',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-01'),
      },
      {
        id_insumo: 2,
        id_fox: '0003622',
        nombre: 'BEMACID AMARILLO E-TL',
        id_clase: 'CA',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-02'),
      },
      {
        id_insumo: 3,
        id_fox: '0003506',
        nombre: 'BEMACID AMARILLO F-G',
        id_clase: 'CA',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-03'),
      },
      {
        id_insumo: 4,
        id_fox: '0003532',
        nombre: 'BEMACID AMARILLO FT',
        id_clase: 'CA',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-04'),
      },
      {
        id_insumo: 5,
        id_fox: '0003624',
        nombre: 'BEMACID AZUL E-TL',
        id_clase: 'CA',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-05'),
      },
      {
        id_insumo: 6,
        id_fox: '0003550',
        nombre: 'BEMACID AZUL F-2R',
        id_clase: 'CA',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-06'),
      },
      {
        id_insumo: 7,
        id_fox: '0003526',
        nombre: 'BEMACID AZUL FT',
        id_clase: 'CA',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-07'),
      },
      {
        id_insumo: 8,
        id_fox: '0003623',
        nombre: 'BEMACID ROJO E-TL',
        id_clase: 'CA',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-08'),
      },
      {
        id_insumo: 9,
        id_fox: '0003549',
        nombre: 'BEMACID ROJO F-4B',
        id_clase: 'CA',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-09'),
      },
      {
        id_insumo: 10,
        id_fox: '0003531',
        nombre: 'BEMACID ROJO FT',
        id_clase: 'CA',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-10'),
      },
      {
        id_insumo: 11,
        id_fox: '0003548',
        nombre: 'BEMACID TURQUEZA F-G',
        id_clase: 'CA',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-11'),
      },
      {
        id_insumo: 12,
        id_fox: '0003641',
        nombre: 'BEMACRON AZUL HP LTD',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-12'),
      },
      {
        id_insumo: 13,
        id_fox: '0002918',
        nombre: 'BEMACRON AZUL OSCURO HP LTD DT',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-13'),
      },
      {
        id_insumo: 14,
        id_fox: '0001563',
        nombre: 'BEMACRON AZUL S-BB',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-14'),
      },
      {
        id_insumo: 15,
        id_fox: '0001937',
        nombre: 'BEMACRON CYAN HP-G',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-15'),
      },
      {
        id_insumo: 16,
        id_fox: '0003649',
        nombre: 'BEMACRON MARINO HP-S',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-16'),
      },
      {
        id_insumo: 17,
        id_fox: '0002919',
        nombre: 'BEMACRON MARINO S-2GL',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-17'),
      },
      {
        id_insumo: 18,
        id_fox: '0003615',
        nombre: 'BEMACRON NEGRO HP-LTD',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-18'),
      },
      {
        id_insumo: 19,
        id_fox: '0003659',
        nombre: 'BEMACRON NEGRO HP-S',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-19'),
      },
      {
        id_insumo: 20,
        id_fox: '0003648',
        nombre: 'BEMACRON NOCHE NEGRA HP-S',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-20'),
      },
      {
        id_insumo: 21,
        id_fox: '0001562',
        nombre: 'BEMACRON PARDO AMARILLO S-2RFL',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-21'),
      },
      {
        id_insumo: 22,
        id_fox: '0003669',
        nombre: 'BEMACRON ROJO HP-FS',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-22'),
      },
      {
        id_insumo: 23,
        id_fox: '0002374',
        nombre: 'BEMACRON ROJO HP-LTD DT',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-23'),
      },
      {
        id_insumo: 24,
        id_fox: '0003657',
        nombre: 'BEMACRON ROJO SE-LF',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-24'),
      },
      {
        id_insumo: 25,
        id_fox: '0002377',
        nombre: 'BEMACRON RUBI HP-LTD DT',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-25'),
      },
      {
        id_insumo: 26,
        id_fox: '0002382',
        nombre: 'BEMACRON RUBI S-2GFL',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-26'),
      },
      {
        id_insumo: 27,
        id_fox: '0003662',
        nombre: 'BEMACRON TURQUESA HP-B',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-27'),
      },
      {
        id_insumo: 28,
        id_fox: '0003663',
        nombre: 'BEMACRON TURQUESA S-GF',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-28'),
      },
      {
        id_insumo: 29,
        id_fox: '0003658',
        nombre: 'BEMACRON YELLOW S-6GF',
        id_clase: 'CDP',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-29'),
      },
      {
        id_insumo: 30,
        id_fox: '0003514',
        nombre: 'BEMAPLEX AMARILLO MT',
        id_clase: 'CA',
        peso_unitario: 0,
        id_unidad: 'KG',
        presentacion: 'CAJA',
        precio_unitario: 0,
        created_at: new Date('2024-01-30'),
      },
    ];

    // Agregar las relaciones con unidades
    return materiales.map((material) => ({
      ...material,
      unidad: this.unidadesMock.find((u) => u.id_unidad === material.id_unidad),
    }));
  }

  // ===== LOTES =====
  getLotes(): Observable<Lote[]> {
    if (this.useApi) {
      return this.apiService.getLotes().pipe(
        map((response) => response.data || response),
        catchError(() => of(this.getLotesMock()))
      );
    }
    return of(this.getLotesMock());
  }

  private getLotesMock(): Lote[] {
    return [
      {
        id_lote: 1,
        lote: 'LT2024001',
        id_insumo: 1,
        ubicacion: 'Almacén Colorantes - A1',
        stock_inicial: 50,
        stock_actual: 35,
        fecha_expiracion: new Date('2025-06-14'),
        precio_total: 4500,
        estado_lote: 'ACTIVO',
      },
      {
        id_lote: 2,
        lote: 'LT2024002',
        id_insumo: 2,
        ubicacion: 'Almacén Colorantes - A2',
        stock_inicial: 25,
        stock_actual: 18,
        fecha_expiracion: new Date('2025-12-19'),
        precio_total: 3200,
        estado_lote: 'ACTIVO',
      },
      {
        id_lote: 3,
        lote: 'LT2024003',
        id_insumo: 3,
        ubicacion: 'Almacén Colorantes - A3',
        stock_inicial: 30,
        stock_actual: 8,
        fecha_expiracion: new Date('2026-03-09'),
        precio_total: 2850,
        estado_lote: 'ACTIVO',
      },
      {
        id_lote: 4,
        lote: 'LT2024004',
        id_insumo: 4,
        ubicacion: 'Almacén Colorantes - A4',
        stock_inicial: 40,
        stock_actual: 0,
        fecha_expiracion: new Date('2025-08-29'),
        precio_total: 3600,
        estado_lote: 'AGOTADO',
      },
      {
        id_lote: 5,
        lote: 'LT2024005',
        id_insumo: 5,
        ubicacion: 'Almacén Colorantes - B1',
        stock_inicial: 35,
        stock_actual: 28,
        fecha_expiracion: new Date('2025-10-15'),
        precio_total: 4200,
        estado_lote: 'ACTIVO',
      },
      {
        id_lote: 6,
        lote: 'LT2024006',
        id_insumo: 12,
        ubicacion: 'Almacén Dispersos - C1',
        stock_inicial: 60,
        stock_actual: 45,
        fecha_expiracion: new Date('2026-01-20'),
        precio_total: 5800,
        estado_lote: 'ACTIVO',
      },
      {
        id_lote: 7,
        lote: 'LT2024007',
        id_insumo: 13,
        ubicacion: 'Almacén Dispersos - C2',
        stock_inicial: 45,
        stock_actual: 5,
        fecha_expiracion: new Date('2024-02-09'),
        precio_total: 4950,
        estado_lote: 'VENCIDO',
      },
      {
        id_lote: 8,
        lote: 'LT2024008',
        id_insumo: 18,
        ubicacion: 'Almacén Dispersos - C3',
        stock_inicial: 80,
        stock_actual: 72,
        fecha_expiracion: new Date('2025-11-24'),
        precio_total: 7200,
        estado_lote: 'ACTIVO',
      },
      {
        id_lote: 9,
        lote: 'LT2024009',
        id_insumo: 21,
        ubicacion: 'Almacén Dispersos - C4',
        stock_inicial: 25,
        stock_actual: 12,
        fecha_expiracion: new Date('2026-09-14'),
        precio_total: 3500,
        estado_lote: 'RESERVADO',
      },
      {
        id_lote: 10,
        lote: 'LT2024010',
        id_insumo: 24,
        ubicacion: 'Almacén Dispersos - C5',
        stock_inicial: 55,
        stock_actual: 3,
        fecha_expiracion: new Date('2025-07-30'),
        precio_total: 6100,
        estado_lote: 'ACTIVO',
      },
    ];
  }

  // ===== UNIDADES =====
  getUnidades(): Observable<Unidad[]> {
    if (this.useApi) {
      return this.apiService
        .getUnidades()
        .pipe(catchError(() => of(this.unidadesMock)));
    }
    return of(this.unidadesMock);
  }

  // ===== CLASES =====
  getClases(): Observable<Clase[]> {
    if (this.useApi) {
      return this.apiService
        .getClases()
        .pipe(catchError(() => of(this.clasesMock)));
    }
    return of(this.clasesMock);
  }

  // ============================================================================
  // MÉTODOS ADICIONALES (BÚSQUEDAS Y FILTROS)
  // ============================================================================

  buscarMateriales(filtros: {
    codigo?: string;
    descripcion?: string;
    proveedor?: string;
  }): Observable<Insumo[]> {
    if (this.useApi) {
      // Construir término de búsqueda para la API
      const termino = [filtros.codigo, filtros.descripcion]
        .filter(Boolean)
        .join(' ');
      if (termino) {
        return this.apiService
          .buscarInsumos(termino)
          .pipe(catchError(() => this.buscarMaterialesMock(filtros)));
      }
    }
    return this.buscarMaterialesMock(filtros);
  }

  private buscarMaterialesMock(filtros: {
    codigo?: string;
    descripcion?: string;
    proveedor?: string;
  }): Observable<Insumo[]> {
    let resultados = this.getMaterialesMock();

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

    if (filtros.proveedor) {
      // Como usamos datos mock, simulamos la búsqueda por nombre de proveedor
      // En implementación real, esto sería un JOIN con INSUMO_PROVEEDOR
      resultados = resultados.filter((m) =>
        // Filtramos por los insumos que tienen proveedores que contienen el texto buscado
        // Por simplicidad en mock, asumimos que algunos insumos tienen ciertos proveedores
        this.getProveedoresMock().some(
          (p) =>
            (p.empresa || '')
              .toLowerCase()
              .includes(filtros.proveedor!.toLowerCase()) &&
            this.insumoTieneProveedor(m.id_insumo, p.id_proveedor)
        )
      );
    }

    return of(resultados);
  }

  // ============================================================================
  // MÉTODOS HELPER PARA RELACIONES MOCK
  // ============================================================================
  private insumoTieneProveedor(
    idInsumo?: number,
    idProveedor?: number
  ): boolean {
    // Simulamos la tabla INSUMO_PROVEEDOR con algunas relaciones mock
    const relacionesMock = [
      { id_insumo: 1, id_proveedor: 1 }, // Ácido Acético - Químicos Industriales
      { id_insumo: 2, id_proveedor: 1 }, // Peróxido - Químicos Industriales
      { id_insumo: 3, id_proveedor: 4 }, // Colorante Azul - Tintas Especializadas
      { id_insumo: 4, id_proveedor: 4 }, // Colorante Rojo - Tintas Especializadas
      { id_insumo: 5, id_proveedor: 2 }, // Algodón - Textiles del Sur
      { id_insumo: 6, id_proveedor: 3 }, // Poliéster - Fibras y Materiales
      { id_insumo: 7, id_proveedor: 3 }, // Lycra - Fibras y Materiales
      { id_insumo: 8, id_proveedor: 5 }, // Suavizante - Acabados Premium
      { id_insumo: 9, id_proveedor: 5 }, // Resina - Acabados Premium
      { id_insumo: 10, id_proveedor: 1 }, // Soda Cáustica - Químicos Industriales
    ];

    return relacionesMock.some(
      (r) => r.id_insumo === idInsumo && r.id_proveedor === idProveedor
    );
  }

  // ============================================================================
  // MÉTODOS DE CONFIGURACIÓN LEGACY (PARA COMPATIBILIDAD)
  // ============================================================================
  getRoles(): Observable<Rol[]> {
    return of(this.roles);
  }

  getTiposUsuario(): Observable<TipoUsuario[]> {
    return of(this.tiposUsuario);
  }

  getPermisos(): Observable<Permiso[]> {
    return of(this.permisos);
  }

  getUsuarios(): Observable<Usuario[]> {
    return of(this.usuarios);
  }

  // ============================================================================
  // MÉTODOS CRUD LEGACY (PARA COMPATIBILIDAD)
  // ============================================================================
  crearMaterial(material: Insumo): Observable<Insumo> {
    const nuevoId =
      Math.max(...this.getMaterialesMock().map((m) => m.id_insumo || 0)) + 1;
    const nuevoMaterial: Insumo = {
      ...material,
      id_insumo: nuevoId,
      created_at: new Date(),
      updated_at: new Date(),
    };
    return of(nuevoMaterial);
  }

  actualizarMaterial(material: Insumo): Observable<Insumo> {
    return of({
      ...material,
      updated_at: new Date(),
    });
  }

  crearProveedor(proveedor: Proveedor): Observable<Proveedor> {
    const nuevoId =
      Math.max(...this.getProveedoresMock().map((p) => p.id_proveedor || 0)) +
      1;
    const nuevoProveedor: Proveedor = {
      ...proveedor,
      id_proveedor: nuevoId,
      created_at: new Date(),
      updated_at: new Date(),
    };
    return of(nuevoProveedor);
  }

  actualizarProveedor(proveedor: Proveedor): Observable<Proveedor> {
    return of({
      ...proveedor,
      updated_at: new Date(),
    });
  }

  eliminarProveedor(id: number): Observable<boolean> {
    return of(true);
  }

  crearAlmacen(almacen: Almacen): Observable<Almacen> {
    const nuevoId =
      Math.max(...this.getAlmacenesMock().map((a) => a.id_almacen || 0)) + 1;
    const nuevoAlmacen: Almacen = {
      ...almacen,
      id_almacen: nuevoId,
    };
    return of(nuevoAlmacen);
  }

  actualizarAlmacen(almacen: Almacen): Observable<Almacen> {
    return of(almacen);
  }

  eliminarAlmacen(id: number): Observable<boolean> {
    return of(true);
  }

  buscarAlmacenes(filtros: {
    nombre?: string;
    ubicacion?: string;
  }): Observable<Almacen[]> {
    let resultados = this.getAlmacenesMock();

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

  buscarProveedores(filtros: {
    empresa?: string;
    ruc?: string;
    contacto?: string;
  }): Observable<Proveedor[]> {
    let resultados = this.getProveedoresMock();

    if (filtros.empresa) {
      resultados = resultados.filter((p) =>
        (p.empresa || '').toLowerCase().includes(filtros.empresa!.toLowerCase())
      );
    }

    if (filtros.ruc) {
      resultados = resultados.filter((p) =>
        (p.ruc || '').toLowerCase().includes(filtros.ruc!.toLowerCase())
      );
    }

    if (filtros.contacto) {
      resultados = resultados.filter((p) =>
        (p.contacto || '')
          .toLowerCase()
          .includes(filtros.contacto!.toLowerCase())
      );
    }

    return of(resultados);
  }

  crearClase(clase: Clase): Observable<Clase> {
    const nuevaClase: Clase = {
      ...clase,
      id_clase: clase.id_clase.toUpperCase(),
    };
    return of(nuevaClase);
  }

  actualizarClase(clase: Clase): Observable<Clase> {
    return of(clase);
  }

  eliminarClase(id: string): Observable<boolean> {
    return of(true);
  }

  buscarClases(filtros: {
    familia?: string;
    sub_familia?: string;
  }): Observable<Clase[]> {
    let resultados = this.clasesMock;

    if (filtros.familia) {
      resultados = resultados.filter((c) =>
        c.familia.toLowerCase().includes(filtros.familia!.toLowerCase())
      );
    }

    if (filtros.sub_familia) {
      resultados = resultados.filter((c) =>
        c.sub_familia.toLowerCase().includes(filtros.sub_familia!.toLowerCase())
      );
    }

    return of(resultados);
  }

  crearUnidad(unidad: Unidad): Observable<Unidad> {
    return of(unidad);
  }

  actualizarUnidad(unidad: Unidad): Observable<Unidad> {
    return of(unidad);
  }

  eliminarUnidad(id: string): Observable<boolean> {
    return of(true);
  }

  buscarUnidades(filtros: { nombre?: string }): Observable<Unidad[]> {
    let resultados = this.unidadesMock;

    if (filtros.nombre) {
      resultados = resultados.filter((u) =>
        u.nombre.toLowerCase().includes(filtros.nombre!.toLowerCase())
      );
    }

    return of(resultados);
  }

  // ============================================================================
  // MÉTODOS FALTANTES PARA LOTES
  // ============================================================================
  crearLote(lote: any): Observable<Lote> {
    const nuevoId =
      Math.max(...this.getLotesMock().map((l) => l.id_lote || 0)) + 1;
    return of({
      ...lote,
      id_lote: nuevoId,
      estado_lote: lote.estado_lote || 'ACTIVO',
    });
  }

  actualizarLote(lote: Lote): Observable<Lote> {
    return of(lote);
  }

  buscarLotes(filtros: any): Observable<Lote[]> {
    let resultados = this.getLotesMock();

    if (filtros.lote) {
      resultados = resultados.filter((l) =>
        l.lote?.toLowerCase().includes(filtros.lote!.toLowerCase())
      );
    }

    if (filtros.insumo) {
      const insumos = this.getMaterialesMock();
      const insumosFiltrados = insumos.filter((i) =>
        i.nombre.toLowerCase().includes(filtros.insumo!.toLowerCase())
      );
      const idsInsumos = insumosFiltrados.map((i) => i.id_insumo);
      resultados = resultados.filter((l) => idsInsumos.includes(l.id_insumo));
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

  // ============================================================================
  // MÉTODOS FALTANTES PARA USUARIOS
  // ============================================================================
  buscarUsuarios(filtros: any): Observable<Usuario[]> {
    let resultados = this.usuarios;

    if (filtros.username) {
      resultados = resultados.filter((u) =>
        u.username.toLowerCase().includes(filtros.username!.toLowerCase())
      );
    }

    if (filtros.email) {
      resultados = resultados.filter((u) =>
        (u.email || '').toLowerCase().includes(filtros.email!.toLowerCase())
      );
    }

    if (filtros.rol) {
      resultados = resultados.filter((u) => u.id_rol === filtros.rol);
    }

    return of(resultados);
  }

  // ============================================================================
  // MÉTODOS PARA INGRESOS
  // ============================================================================

  getIngresos(): Observable<Ingreso[]> {
    if (this.useApi) {
      return this.apiService.getIngresos().pipe(
        map((response: any) => response.data || response),
        catchError(() => of(this.getIngresosMock()))
      );
    }
    return of(this.getIngresosMock());
  }

  private getIngresosMock(): Ingreso[] {
    return [
      {
        id_ingreso: 1,
        id_insumo: 1,
        id_insumo_proveedor: 1,
        fecha: new Date('2024-05-15'),
        presentacion: 'Tambor de 200L',
        id_unidad: 'LT',
        cantidad: 200,
        id_lote: 1,
        precio_total_formula: 2500.0,
        precio_unitario_historico: 12.5,
        numero_remision: 'REM-2024-001',
        orden_compra: 'OC-2024-001',
        estado: 'PROCESADO',
      },
      {
        id_ingreso: 2,
        id_insumo: 2,
        id_insumo_proveedor: 2,
        fecha: new Date('2024-05-20'),
        presentacion: 'Saco de 25kg',
        id_unidad: 'KG',
        cantidad: 25,
        id_lote: 2,
        precio_total_formula: 850.0,
        precio_unitario_historico: 34.0,
        numero_remision: 'REM-2024-002',
        orden_compra: 'OC-2024-002',
        estado: 'PROCESADO',
      },
      {
        id_ingreso: 3,
        id_insumo: 3,
        id_insumo_proveedor: 3,
        fecha: new Date('2024-05-25'),
        presentacion: 'Bidón de 20L',
        id_unidad: 'LT',
        cantidad: 20,
        id_lote: 3,
        precio_total_formula: 420.0,
        precio_unitario_historico: 21.0,
        numero_remision: 'REM-2024-003',
        orden_compra: 'OC-2024-003',
        estado: 'PENDIENTE',
      },
      {
        id_ingreso: 4,
        id_insumo: 4,
        id_insumo_proveedor: 4,
        fecha: new Date('2024-05-28'),
        presentacion: 'Caja de 12 unidades',
        id_unidad: 'UN',
        cantidad: 12,
        id_lote: 4,
        precio_total_formula: 180.0,
        precio_unitario_historico: 15.0,
        numero_remision: 'REM-2024-004',
        orden_compra: 'OC-2024-004',
        estado: 'PROCESADO',
      },
      {
        id_ingreso: 5,
        id_insumo: 5,
        id_insumo_proveedor: 5,
        fecha: new Date('2024-05-30'),
        presentacion: 'Tambor de 100L',
        id_unidad: 'LT',
        cantidad: 100,
        id_lote: 5,
        precio_total_formula: 1200.0,
        precio_unitario_historico: 12.0,
        numero_remision: 'REM-2024-005',
        orden_compra: 'OC-2024-005',
        estado: 'ANULADO',
      },
    ];
  }

  buscarIngresos(filtros: {
    insumo?: string;
    numero_remision?: string;
    orden_compra?: string;
    estado?: string;
  }): Observable<Ingreso[]> {
    if (this.useApi) {
      return this.apiService.buscarIngresos(filtros).pipe(
        map((response: any) => response.data || response),
        catchError(() => this.buscarIngresosMock(filtros))
      );
    }
    return this.buscarIngresosMock(filtros);
  }

  private buscarIngresosMock(filtros: {
    insumo?: string;
    numero_remision?: string;
    orden_compra?: string;
    estado?: string;
  }): Observable<Ingreso[]> {
    let resultados = this.getIngresosMock();

    if (filtros.insumo) {
      resultados = resultados.filter((ingreso) => {
        const insumo = this.getMaterialesMock().find(
          (m) => m.id_insumo === ingreso.id_insumo
        );
        return insumo?.nombre
          ?.toLowerCase()
          .includes(filtros.insumo!.toLowerCase());
      });
    }

    if (filtros.numero_remision) {
      resultados = resultados.filter((ingreso) =>
        (ingreso.numero_remision || '')
          .toLowerCase()
          .includes(filtros.numero_remision!.toLowerCase())
      );
    }

    if (filtros.orden_compra) {
      resultados = resultados.filter((ingreso) =>
        (ingreso.orden_compra || '')
          .toLowerCase()
          .includes(filtros.orden_compra!.toLowerCase())
      );
    }

    if (filtros.estado) {
      resultados = resultados.filter(
        (ingreso) => ingreso.estado === filtros.estado
      );
    }

    return of(resultados);
  }

  crearIngreso(ingreso: Ingreso): Observable<Ingreso> {
    if (this.useApi) {
      return this.apiService
        .crearIngreso(ingreso)
        .pipe(map((response: any) => response.data || response));
    }
    console.log('Creando ingreso:', ingreso);
    return of({ ...ingreso, id_ingreso: Date.now() });
  }

  actualizarIngreso(ingreso: Ingreso): Observable<Ingreso> {
    if (this.useApi) {
      return this.apiService
        .actualizarIngreso(ingreso)
        .pipe(map((response: any) => response.data || response));
    }
    console.log('Actualizando ingreso:', ingreso);
    return of(ingreso);
  }

  // ============================================================================
  // MÉTODOS PARA LOGS Y AUDITORÍA
  // ============================================================================

  getLogs(): Observable<LogEvento[]> {
    if (this.useApi) {
      return this.apiService.getLogs().pipe(
        map((response: any) => response.data || response),
        catchError(() => of(this.getLogsMock()))
      );
    }
    return of(this.getLogsMock());
  }

  private getLogsMock(): LogEvento[] {
    return [
      {
        id: 1,
        id_usuario: 1,
        accion: 'LOGIN',
        descripcion: 'Usuario administrador inició sesión exitosamente',
        ip_origen: '192.168.1.100',
        modulo: 'SESIONES',
        tabla_afectada: 'SESION',
        timestamp: new Date('2024-05-30 09:00:00'),
      },
      {
        id: 2,
        id_usuario: 1,
        accion: 'CREAR',
        descripcion: 'Creó un nuevo insumo: Colorante Azul Marino',
        ip_origen: '192.168.1.100',
        modulo: 'INSUMOS',
        tabla_afectada: 'INSUMO',
        timestamp: new Date('2024-05-30 09:15:30'),
      },
      {
        id: 3,
        id_usuario: 2,
        accion: 'EDITAR',
        descripcion: 'Modificó datos del proveedor: Químicos del Pacífico SAC',
        ip_origen: '192.168.1.105',
        modulo: 'PROVEEDORES',
        tabla_afectada: 'PROVEEDOR',
        timestamp: new Date('2024-05-30 10:22:15'),
      },
      {
        id: 4,
        id_usuario: 1,
        accion: 'ELIMINAR',
        descripcion: 'Eliminó usuario: operario_temporal (ID: 15)',
        ip_origen: '192.168.1.100',
        modulo: 'USUARIOS',
        tabla_afectada: 'USUARIO',
        timestamp: new Date('2024-05-30 11:45:00'),
      },
      {
        id: 5,
        id_usuario: 3,
        accion: 'CONSULTAR',
        descripcion: 'Consultó stock del almacén principal',
        ip_origen: '192.168.1.120',
        modulo: 'STOCK',
        tabla_afectada: 'STOCK',
        timestamp: new Date('2024-05-30 14:30:45'),
      },
      {
        id: 6,
        id_usuario: 2,
        accion: 'CREAR',
        descripcion: 'Registró nuevo lote: LT2024011 para Acetona Industrial',
        ip_origen: '192.168.1.105',
        modulo: 'LOTES',
        tabla_afectada: 'LOTE',
        timestamp: new Date('2024-05-30 15:10:20'),
      },
      {
        id: 7,
        id_usuario: 1,
        accion: 'CONFIGURAR',
        descripcion: 'Modificó permisos del rol SUPERVISOR',
        ip_origen: '192.168.1.100',
        modulo: 'CONFIGURACION',
        tabla_afectada: 'ROL_PERMISO',
        timestamp: new Date('2024-05-30 16:05:30'),
      },
      {
        id: 8,
        id_usuario: 4,
        accion: 'EXPORTAR',
        descripcion: 'Exportó reporte de insumos del mes de mayo',
        ip_origen: '192.168.1.130',
        modulo: 'INSUMOS',
        tabla_afectada: 'INSUMO',
        timestamp: new Date('2024-05-30 16:45:10'),
      },
      {
        id: 9,
        id_usuario: 2,
        accion: 'EDITAR',
        descripcion: 'Actualizó stock del lote LT2024001',
        ip_origen: '192.168.1.105',
        modulo: 'STOCK',
        tabla_afectada: 'STOCK',
        timestamp: new Date('2024-05-30 17:20:55'),
      },
      {
        id: 10,
        id_usuario: 1,
        accion: 'BACKUP',
        descripcion: 'Realizó respaldo completo de la base de datos',
        ip_origen: '192.168.1.100',
        modulo: 'CONFIGURACION',
        tabla_afectada: 'SISTEMA',
        timestamp: new Date('2024-05-30 18:00:00'),
      },
      {
        id: 11,
        id_usuario: 3,
        accion: 'LOGIN',
        descripcion: 'Usuario operario inició sesión',
        ip_origen: '192.168.1.120',
        modulo: 'SESIONES',
        tabla_afectada: 'SESION',
        timestamp: new Date('2024-05-31 08:00:15'),
      },
      {
        id: 12,
        id_usuario: 3,
        accion: 'CREAR',
        descripcion: 'Registró ingreso de mercadería: Remisión #R-2024-0156',
        ip_origen: '192.168.1.120',
        modulo: 'INGRESOS',
        tabla_afectada: 'INGRESO',
        timestamp: new Date('2024-05-31 09:30:40'),
      },
      {
        id: 13,
        id_usuario: 5,
        accion: 'CONSULTAR',
        descripcion: 'Consultó historial de consumos del área de producción',
        ip_origen: '192.168.1.140',
        modulo: 'CONSUMOS',
        tabla_afectada: 'CONSUMO',
        timestamp: new Date('2024-05-31 10:15:25'),
      },
      {
        id: 14,
        id_usuario: 1,
        accion: 'CREAR',
        descripcion: 'Creó nueva receta: Mezcla Base para Tintas Offset',
        ip_origen: '192.168.1.100',
        modulo: 'RECETAS',
        tabla_afectada: 'RECETA',
        timestamp: new Date('2024-05-31 11:45:10'),
      },
      {
        id: 15,
        id_usuario: 2,
        accion: 'LOGOUT',
        descripcion: 'Usuario supervisor cerró sesión',
        ip_origen: '192.168.1.105',
        modulo: 'SESIONES',
        tabla_afectada: 'SESION',
        timestamp: new Date('2024-05-31 17:30:00'),
      },
    ];
  }

  buscarLogs(filtros: {
    usuario?: number;
    modulo?: string;
    accion?: string;
    tabla_afectada?: string;
    ip_origen?: string;
    fecha_desde?: Date;
    fecha_hasta?: Date;
    descripcion?: string;
  }): Observable<LogEvento[]> {
    if (this.useApi) {
      return this.apiService.buscarLogs(filtros).pipe(
        map((response: any) => response.data || response),
        catchError(() => this.buscarLogsMock(filtros))
      );
    }
    return this.buscarLogsMock(filtros);
  }

  private buscarLogsMock(filtros: {
    usuario?: number;
    modulo?: string;
    accion?: string;
    tabla_afectada?: string;
    ip_origen?: string;
    fecha_desde?: Date;
    fecha_hasta?: Date;
    descripcion?: string;
  }): Observable<LogEvento[]> {
    let resultados = this.getLogsMock();

    // Filtrar por usuario
    if (filtros.usuario) {
      resultados = resultados.filter(
        (log) => log.id_usuario === filtros.usuario
      );
    }

    // Filtrar por módulo
    if (filtros.modulo) {
      resultados = resultados.filter((log) =>
        log.modulo?.toLowerCase().includes(filtros.modulo!.toLowerCase())
      );
    }

    // Filtrar por acción
    if (filtros.accion) {
      resultados = resultados.filter((log) =>
        log.accion?.toLowerCase().includes(filtros.accion!.toLowerCase())
      );
    }

    // Filtrar por tabla afectada
    if (filtros.tabla_afectada) {
      resultados = resultados.filter((log) =>
        log.tabla_afectada
          ?.toLowerCase()
          .includes(filtros.tabla_afectada!.toLowerCase())
      );
    }

    // Filtrar por IP de origen
    if (filtros.ip_origen) {
      resultados = resultados.filter((log) =>
        log.ip_origen?.includes(filtros.ip_origen!)
      );
    }

    // Filtrar por rango de fechas
    if (filtros.fecha_desde) {
      const fechaDesde = new Date(filtros.fecha_desde);
      resultados = resultados.filter((log) => {
        if (!log.timestamp) return false;
        const fechaLog = new Date(log.timestamp);
        return fechaLog >= fechaDesde;
      });
    }

    if (filtros.fecha_hasta) {
      const fechaHasta = new Date(filtros.fecha_hasta);
      fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
      resultados = resultados.filter((log) => {
        if (!log.timestamp) return false;
        const fechaLog = new Date(log.timestamp);
        return fechaLog <= fechaHasta;
      });
    }

    // Filtrar por descripción
    if (filtros.descripcion) {
      resultados = resultados.filter((log) =>
        log.descripcion
          ?.toLowerCase()
          .includes(filtros.descripcion!.toLowerCase())
      );
    }

    // Ordenar por fecha descendente (más recientes primero)
    resultados.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return of(resultados);
  }

  // Método para registrar eventos de log (simulado)
  registrarLog(evento: {
    id_usuario?: number;
    accion: string;
    descripcion: string;
    modulo: string;
    tabla_afectada?: string;
    ip_origen?: string;
  }): Observable<LogEvento> {
    const nuevoLog: LogEvento = {
      id: Math.floor(Math.random() * 10000),
      timestamp: new Date(),
      ...evento,
    };

    if (this.useApi) {
      return this.apiService
        .registrarLog(nuevoLog)
        .pipe(catchError(() => of(nuevoLog)));
    }

    console.log('Log registrado (mock):', nuevoLog);
    return of(nuevoLog);
  }

  // Método para exportar logs (simulado)
  exportarLogs(filtros?: any): Observable<Blob> {
    const logs = this.getLogsMock();
    const csvContent = this.convertirLogsACSV(logs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return of(blob);
  }

  private convertirLogsACSV(logs: LogEvento[]): string {
    const headers = [
      'ID',
      'Fecha y Hora',
      'Usuario',
      'Acción',
      'Módulo',
      'Tabla Afectada',
      'Descripción',
      'IP Origen',
    ];

    const csvRows = [headers.join(',')];

    logs.forEach((log) => {
      const row = [
        log.id || '',
        log.timestamp ? new Date(log.timestamp).toLocaleString('es-PE') : '',
        log.id_usuario || '',
        log.accion || '',
        log.modulo || '',
        log.tabla_afectada || '',
        `"${log.descripcion || ''}"`, // Comillas para textos con comas
        log.ip_origen || '',
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  // ===== RECETAS =====
  getRecetas(): Observable<Receta[]> {
    if (this.useApi) {
      return this.apiService.getRecetas().pipe(
        map((response) => response.data || response),
        catchError(() => of(this.getRecetasMock()))
      );
    }
    return of(this.getRecetasMock());
  }

  private getRecetasMock(): Receta[] {
    return [
      {
        id_receta: 1,
        nombre: 'Tela Algodón Básica',
        detalles: [
          {
            id: 1,
            id_receta: 1,
            id_insumo: 5, // Algodón Peinado 40/1
            proporcion: 85.0,
            orden: 1,
            tipo_medida: 'PORCENTAJE',
          },
          {
            id: 2,
            id_receta: 1,
            id_insumo: 1, // Ácido Acético
            proporcion: 10.0,
            orden: 2,
            tipo_medida: 'PORCENTAJE',
          },
          {
            id: 3,
            id_receta: 1,
            id_insumo: 9, // Sulfato de Sodio
            proporcion: 5.0,
            orden: 3,
            tipo_medida: 'PORCENTAJE',
          },
        ],
      },
      {
        id_receta: 2,
        nombre: 'Tela Teñida Azul Marino',
        detalles: [
          {
            id: 4,
            id_receta: 2,
            id_insumo: 5, // Algodón Peinado 40/1
            proporcion: 70.0,
            orden: 1,
            tipo_medida: 'PORCENTAJE',
          },
          {
            id: 5,
            id_receta: 2,
            id_insumo: 3, // Colorante Azul Marino
            proporcion: 15.0,
            orden: 2,
            tipo_medida: 'PORCENTAJE',
          },
          {
            id: 6,
            id_receta: 2,
            id_insumo: 2, // Peróxido de Hidrógeno
            proporcion: 10.0,
            orden: 3,
            tipo_medida: 'PORCENTAJE',
          },
          {
            id: 7,
            id_receta: 2,
            id_insumo: 9, // Sulfato de Sodio
            proporcion: 5.0,
            orden: 4,
            tipo_medida: 'PORCENTAJE',
          },
        ],
      },
      {
        id_receta: 3,
        nombre: 'Tela con Adhesivo Termoplástico',
        detalles: [
          {
            id: 8,
            id_receta: 3,
            id_insumo: 5, // Algodón Peinado 40/1
            proporcion: 60.0,
            orden: 1,
            tipo_medida: 'PORCENTAJE',
          },
          {
            id: 9,
            id_receta: 3,
            id_insumo: 6, // Adhesivo Termoplástico
            proporcion: 25.0,
            orden: 2,
            tipo_medida: 'PORCENTAJE',
          },
          {
            id: 10,
            id_receta: 3,
            id_insumo: 8, // Disolvente Universal
            proporcion: 15.0,
            orden: 3,
            tipo_medida: 'PORCENTAJE',
          },
        ],
      },
      {
        id_receta: 4,
        nombre: 'Tela Roja Premium',
        detalles: [
          {
            id: 11,
            id_receta: 4,
            id_insumo: 5, // Algodón Peinado 40/1
            proporcion: 65.0,
            orden: 1,
            tipo_medida: 'PORCENTAJE',
          },
          {
            id: 12,
            id_receta: 4,
            id_insumo: 4, // Colorante Rojo Carmín
            proporcion: 20.0,
            orden: 2,
            tipo_medida: 'PORCENTAJE',
          },
          {
            id: 13,
            id_receta: 4,
            id_insumo: 7, // Adhesivo PVA
            proporcion: 10.0,
            orden: 3,
            tipo_medida: 'PORCENTAJE',
          },
          {
            id: 14,
            id_receta: 4,
            id_insumo: 1, // Ácido Acético
            proporcion: 5.0,
            orden: 4,
            tipo_medida: 'PORCENTAJE',
          },
        ],
      },
      {
        id_receta: 5,
        nombre: 'Receta Sin Ingredientes',
        detalles: [],
      },
    ];
  }

  crearReceta(receta: Receta): Observable<Receta> {
    if (this.useApi) {
      return this.apiService.crearReceta(receta);
    }

    // Mock implementation
    const nuevaReceta = {
      ...receta,
      id_receta:
        Math.max(...this.getRecetasMock().map((r) => r.id_receta || 0)) + 1,
    };

    return of(nuevaReceta);
  }

  actualizarReceta(receta: Receta): Observable<Receta> {
    if (this.useApi) {
      return this.apiService.actualizarReceta(receta);
    }
    return of(receta);
  }

  eliminarReceta(id: number): Observable<boolean> {
    if (this.useApi) {
      return this.apiService.eliminarReceta(id);
    }
    return of(true);
  }

  buscarRecetas(filtros: { nombre?: string }): Observable<Receta[]> {
    if (this.useApi) {
      return this.apiService.buscarRecetas(filtros).pipe(
        map((response) => response.data || response),
        catchError(() => this.buscarRecetasMock(filtros))
      );
    }
    return this.buscarRecetasMock(filtros);
  }

  private buscarRecetasMock(filtros: {
    nombre?: string;
  }): Observable<Receta[]> {
    let recetasFiltradas = this.getRecetasMock();

    if (filtros.nombre?.trim()) {
      const nombreBusqueda = filtros.nombre.toLowerCase();
      recetasFiltradas = recetasFiltradas.filter((receta) =>
        receta.nombre?.toLowerCase().includes(nombreBusqueda)
      );
    }

    return of(recetasFiltradas);
  }
}
