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
  ];

  // ===== CLASES (FALLBACK) =====
  private clasesMock: Clase[] = [
    { id_clase: 'QUIM', familia: 'Químicos', sub_familia: 'Químicos Básicos' },
    {
      id_clase: 'QUIM_ACE',
      familia: 'Químicos',
      sub_familia: 'Aceites y Lubricantes',
    },
    { id_clase: 'QUIM_SOL', familia: 'Químicos', sub_familia: 'Solventes' },
    {
      id_clase: 'MAT_PRIMA',
      familia: 'Materia Prima',
      sub_familia: 'Materia Prima Textil',
    },
    { id_clase: 'MAT_FIB', familia: 'Materia Prima', sub_familia: 'Fibras' },
    { id_clase: 'MAT_HIL', familia: 'Materia Prima', sub_familia: 'Hilos' },
    {
      id_clase: 'TINTAS',
      familia: 'Tintas',
      sub_familia: 'Tintas de Impresión',
    },
    { id_clase: 'TINTAS_PIG', familia: 'Tintas', sub_familia: 'Pigmentos' },
    { id_clase: 'ACAB', familia: 'Acabados', sub_familia: 'Acabados Textiles' },
    { id_clase: 'ACAB_SOFT', familia: 'Acabados', sub_familia: 'Suavizantes' },
    { id_clase: 'ACAB_RIG', familia: 'Acabados', sub_familia: 'Rigidizantes' },
    { id_clase: 'MANT', familia: 'Mantenimiento', sub_familia: 'Repuestos' },
    {
      id_clase: 'MANT_HER',
      familia: 'Mantenimiento',
      sub_familia: 'Herramientas',
    },
    { id_clase: 'ENVASE', familia: 'Envases', sub_familia: 'Contenedores' },
    { id_clase: 'ENVASE_BOL', familia: 'Envases', sub_familia: 'Bolsas' },
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
    return [
      {
        id_insumo: 1,
        id_fox: 'QUIM001',
        nombre: 'Ácido Acético',
        id_clase: 'QUIM',
        peso_unitario: 1.05,
        id_unidad: 'LT',
        presentacion: 'Bidón 20L',
        precio_unitario: 15.5,
        created_at: new Date('2024-01-01'),
      },
      {
        id_insumo: 2,
        id_fox: 'QUIM002',
        nombre: 'Peróxido de Hidrógeno',
        id_clase: 'QUIM',
        peso_unitario: 1.45,
        id_unidad: 'LT',
        presentacion: 'Bidón 25L',
        precio_unitario: 22.8,
        created_at: new Date('2024-01-02'),
      },
      {
        id_insumo: 3,
        id_fox: 'TINT001',
        nombre: 'Colorante Azul Marino',
        id_clase: 'TINT',
        peso_unitario: 0.5,
        id_unidad: 'KG',
        presentacion: 'Saco 25kg',
        precio_unitario: 45.0,
        created_at: new Date('2024-01-03'),
      },
      {
        id_insumo: 4,
        id_fox: 'TINT002',
        nombre: 'Colorante Rojo Carmín',
        id_clase: 'TINT',
        peso_unitario: 0.6,
        id_unidad: 'KG',
        presentacion: 'Saco 20kg',
        precio_unitario: 52.5,
        created_at: new Date('2024-01-04'),
      },
      {
        id_insumo: 5,
        id_fox: 'TEX001',
        nombre: 'Algodón Peinado 40/1',
        id_clase: 'TEX',
        peso_unitario: 0.85,
        id_unidad: 'KG',
        presentacion: 'Fardo 250kg',
        precio_unitario: 8.2,
        created_at: new Date('2024-01-05'),
      },
      {
        id_insumo: 6,
        id_fox: 'ADHE001',
        nombre: 'Adhesivo Termoplástico',
        id_clase: 'ADHE',
        peso_unitario: 1.2,
        id_unidad: 'KG',
        presentacion: 'Tambor 200kg',
        precio_unitario: 18.9,
        created_at: new Date('2024-01-06'),
      },
      {
        id_insumo: 7,
        id_fox: 'ADHE002',
        nombre: 'Adhesivo PVA',
        id_clase: 'ADHE',
        peso_unitario: 1.1,
        id_unidad: 'KG',
        presentacion: 'Tambor 180kg',
        precio_unitario: 16.5,
        created_at: new Date('2024-01-07'),
      },
      {
        id_insumo: 8,
        id_fox: 'SOLV001',
        nombre: 'Disolvente Universal',
        id_clase: 'SOLV',
        peso_unitario: 0.95,
        id_unidad: 'LT',
        presentacion: 'Bidón 50L',
        precio_unitario: 12.3,
        created_at: new Date('2024-01-08'),
      },
      {
        id_insumo: 9,
        id_fox: 'QUIM003',
        nombre: 'Sulfato de Sodio',
        id_clase: 'QUIM',
        peso_unitario: 1.48,
        id_unidad: 'KG',
        presentacion: 'Saco 50kg',
        precio_unitario: 3.8,
        created_at: new Date('2024-01-09'),
      },
      {
        id_insumo: 10,
        id_fox: 'SOLV002',
        nombre: 'Acetona Industrial',
        id_clase: 'SOLV',
        peso_unitario: 0.79,
        id_unidad: 'LT',
        presentacion: 'Bidón 200L',
        precio_unitario: 7.5,
        created_at: new Date('2024-01-10'),
      },
    ];
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
  // MÉTODOS FALTANTES PARA INGRESOS
  // ============================================================================
  registrarIngreso(ingreso: any): Observable<any> {
    // TODO: Implementar registro de ingreso en la API
    return of({
      success: true,
      message: 'Ingreso registrado correctamente',
      data: {
        id: Date.now(),
        ...ingreso,
        fecha_ingreso: new Date(),
      },
    });
  }
}
