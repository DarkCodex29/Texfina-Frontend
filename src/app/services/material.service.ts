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
  constructor() {}

  // ============================================================================
  // DATOS DE CONFIGURACIÓN INICIALES (ALINEADOS CON BD)
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
      nombre: 'INGRESOS_CREAR',
      descripcion: 'Registrar ingresos',
    },
    {
      id_permiso: 22,
      nombre: 'INGRESOS_EDITAR',
      descripcion: 'Editar ingresos',
    },
    {
      id_permiso: 23,
      nombre: 'INGRESOS_CONSULTAR',
      descripcion: 'Consultar ingresos',
    },
    {
      id_permiso: 24,
      nombre: 'CONSUMOS_CREAR',
      descripcion: 'Registrar consumos',
    },
    {
      id_permiso: 25,
      nombre: 'CONSUMOS_EDITAR',
      descripcion: 'Editar consumos',
    },
    {
      id_permiso: 26,
      nombre: 'CONSUMOS_CONSULTAR',
      descripcion: 'Consultar consumos',
    },
    { id_permiso: 27, nombre: 'RECETAS_CREAR', descripcion: 'Crear recetas' },
    { id_permiso: 28, nombre: 'RECETAS_EDITAR', descripcion: 'Editar recetas' },
    {
      id_permiso: 29,
      nombre: 'RECETAS_ELIMINAR',
      descripcion: 'Eliminar recetas',
    },
    {
      id_permiso: 30,
      nombre: 'RECETAS_CONSULTAR',
      descripcion: 'Consultar recetas',
    },
    {
      id_permiso: 31,
      nombre: 'ALMACENES_CREAR',
      descripcion: 'Crear almacenes',
    },
    {
      id_permiso: 32,
      nombre: 'ALMACENES_EDITAR',
      descripcion: 'Editar almacenes',
    },
    {
      id_permiso: 33,
      nombre: 'ALMACENES_ELIMINAR',
      descripcion: 'Eliminar almacenes',
    },
    {
      id_permiso: 34,
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

  // ===== UNIDADES =====
  private unidades: Unidad[] = [
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

  // ===== CLASES =====
  private clases: Clase[] = [
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

  // ===== ALMACENES (ALINEADOS CON BD) =====
  private almacenes: Almacen[] = [
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

  // ===== PROVEEDORES (ALINEADOS CON BD) =====
  private proveedores: Proveedor[] = [
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

  // ===== MATERIALES/INSUMOS (ACTUALIZADOS) =====
  private materiales: Insumo[] = [
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
      nombre: 'Colorante Azul Reactivo',
      id_clase: 'TINTAS',
      peso_unitario: 0.95,
      id_unidad: 'KG',
      presentacion: 'Bolsa 25Kg',
      precio_unitario: 45.0,
      created_at: new Date('2024-01-03'),
    },
    {
      id_insumo: 4,
      id_fox: 'TINT002',
      nombre: 'Colorante Rojo Directo',
      id_clase: 'TINTAS',
      peso_unitario: 0.92,
      id_unidad: 'KG',
      presentacion: 'Bolsa 20Kg',
      precio_unitario: 38.5,
      created_at: new Date('2024-01-04'),
    },
    {
      id_insumo: 5,
      id_fox: 'MAT001',
      nombre: 'Algodón Peinado',
      id_clase: 'MAT_PRIMA',
      peso_unitario: 0.85,
      id_unidad: 'KG',
      presentacion: 'Fardo 250Kg',
      precio_unitario: 6.8,
      created_at: new Date('2024-01-05'),
    },
    {
      id_insumo: 6,
      id_fox: 'MAT002',
      nombre: 'Poliéster 40D',
      id_clase: 'MAT_FIB',
      peso_unitario: 1.38,
      id_unidad: 'KG',
      presentacion: 'Bobina 100Kg',
      precio_unitario: 12.3,
      created_at: new Date('2024-01-06'),
    },
    {
      id_insumo: 7,
      id_fox: 'MAT003',
      nombre: 'Lycra 40 Denier',
      id_clase: 'MAT_FIB',
      peso_unitario: 1.15,
      id_unidad: 'KG',
      presentacion: 'Bobina 50Kg',
      precio_unitario: 95.0,
      created_at: new Date('2024-01-07'),
    },
    {
      id_insumo: 8,
      id_fox: 'ACAB001',
      nombre: 'Suavizante Catiônico',
      id_clase: 'ACAB_SOFT',
      peso_unitario: 1.02,
      id_unidad: 'KG',
      presentacion: 'Bidón 200Kg',
      precio_unitario: 8.9,
      created_at: new Date('2024-01-08'),
    },
    {
      id_insumo: 9,
      id_fox: 'ACAB002',
      nombre: 'Resina Termofit',
      id_clase: 'ACAB_RIG',
      peso_unitario: 1.18,
      id_unidad: 'KG',
      presentacion: 'Bidón 150Kg',
      precio_unitario: 16.7,
      created_at: new Date('2024-01-09'),
    },
    {
      id_insumo: 10,
      id_fox: 'QUIM003',
      nombre: 'Soda Cáustica',
      id_clase: 'QUIM',
      peso_unitario: 2.13,
      id_unidad: 'KG',
      presentacion: 'Saco 25Kg',
      precio_unitario: 3.2,
      created_at: new Date('2024-01-10'),
    },
  ];

  // ============================================================================
  // MÉTODOS DE USUARIOS
  // ============================================================================
  getUsuarios(): Observable<Usuario[]> {
    return of(this.usuarios);
  }

  getUsuario(id: number): Observable<Usuario | undefined> {
    return of(this.usuarios.find((u) => u.id_usuario === id));
  }

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    const nuevoId =
      Math.max(...this.usuarios.map((u) => u.id_usuario || 0)) + 1;
    const nuevoUsuario: Usuario = {
      ...usuario,
      id_usuario: nuevoId,
      created_at: new Date(),
    };
    this.usuarios.push(nuevoUsuario);
    return of(nuevoUsuario);
  }

  actualizarUsuario(usuario: Usuario): Observable<Usuario> {
    const index = this.usuarios.findIndex(
      (u) => u.id_usuario === usuario.id_usuario
    );
    if (index !== -1) {
      this.usuarios[index] = usuario;
    }
    return of(usuario);
  }

  eliminarUsuario(id: number): Observable<boolean> {
    const index = this.usuarios.findIndex((u) => u.id_usuario === id);
    if (index !== -1) {
      this.usuarios.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  // ============================================================================
  // MÉTODOS DE CONFIGURACIÓN
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

  getUnidades(): Observable<Unidad[]> {
    return of(this.unidades);
  }

  getClases(): Observable<Clase[]> {
    return of(this.clases);
  }

  getAlmacenes(): Observable<Almacen[]> {
    return of(this.almacenes);
  }

  // ============================================================================
  // MÉTODOS EXISTENTES (PROVEEDORES Y MATERIALES)
  // ============================================================================
  getProveedores(): Observable<Proveedor[]> {
    return of(this.proveedores);
  }

  getMateriales(): Observable<Insumo[]> {
    return of(this.materiales);
  }

  // Métodos CRUD para materiales
  crearMaterial(material: Insumo): Observable<Insumo> {
    const nuevoId =
      Math.max(...this.materiales.map((m) => m.id_insumo || 0)) + 1;
    const nuevoMaterial: Insumo = {
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
    }
    return of(material);
  }

  registrarIngreso(ingreso: Ingreso): Observable<Ingreso> {
    const nuevoId =
      Math.max(0, ...this.getIngresosMock().map((i) => i.id_ingreso || 0)) + 1;
    const nuevoIngreso: Ingreso = {
      ...ingreso,
      id_ingreso: nuevoId,
      fecha: ingreso.fecha || new Date(),
      estado: 'ACTIVO',
    };

    // Aquí se agregaría al array de ingresos (por ahora solo retornamos el objeto)
    return of(nuevoIngreso);
  }

  // Método auxiliar para datos mock de ingresos
  private getIngresosMock(): Ingreso[] {
    return [
      {
        id_ingreso: 1,
        id_insumo: 1,
        fecha: new Date('2024-01-15'),
        cantidad: 100,
        precio_total_formula: 1550,
        estado: 'ACTIVO',
      },
    ];
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

    return of(resultados);
  }

  buscarUsuarios(filtros: {
    username?: string;
    email?: string;
    rol?: string;
  }): Observable<Usuario[]> {
    let resultados = [...this.usuarios];

    if (filtros.username) {
      resultados = resultados.filter((u) =>
        u.username.toLowerCase().includes(filtros.username!.toLowerCase())
      );
    }

    if (filtros.email) {
      resultados = resultados.filter((u) =>
        u.email?.toLowerCase().includes(filtros.email!.toLowerCase())
      );
    }

    if (filtros.rol) {
      resultados = resultados.filter((u) => u.id_rol === filtros.rol);
    }

    return of(resultados);
  }

  // ============================================================================
  // MÉTODOS CRUD PARA ALMACENES
  // ============================================================================
  crearAlmacen(almacen: Almacen): Observable<Almacen> {
    const nuevoId =
      Math.max(...this.almacenes.map((a) => a.id_almacen || 0)) + 1;
    const nuevoAlmacen: Almacen = {
      ...almacen,
      id_almacen: nuevoId,
    };
    this.almacenes.push(nuevoAlmacen);
    return of(nuevoAlmacen);
  }

  actualizarAlmacen(id: number, almacen: Almacen): Observable<Almacen> {
    const index = this.almacenes.findIndex((a) => a.id_almacen === id);
    if (index !== -1) {
      this.almacenes[index] = { ...almacen, id_almacen: id };
      return of(this.almacenes[index]);
    }
    throw new Error('Almacén no encontrado');
  }

  // ============================================================================
  // MÉTODOS CRUD PARA CLASES
  // ============================================================================
  crearClase(clase: Clase): Observable<Clase> {
    // Verificar que el ID de clase no exista
    const claseExiste = this.clases.find((c) => c.id_clase === clase.id_clase);
    if (claseExiste) {
      throw new Error('Ya existe una clase con este código');
    }

    const nuevaClase: Clase = {
      ...clase,
      id_clase: clase.id_clase.toUpperCase(), // Asegurar mayúsculas
    };
    this.clases.push(nuevaClase);
    return of(nuevaClase);
  }

  actualizarClase(id: string, clase: Clase): Observable<Clase> {
    const index = this.clases.findIndex((c) => c.id_clase === id);
    if (index !== -1) {
      this.clases[index] = {
        ...clase,
        id_clase: id, // Mantener el ID original
      };
      return of(this.clases[index]);
    }
    throw new Error('Clase no encontrada');
  }

  eliminarClase(id: string): Observable<boolean> {
    // Verificar que no haya insumos usando esta clase
    const insumosConClase = this.materiales.filter((m) => m.id_clase === id);
    if (insumosConClase.length > 0) {
      throw new Error(
        'No se puede eliminar la clase porque hay insumos asociados'
      );
    }

    const index = this.clases.findIndex((c) => c.id_clase === id);
    if (index !== -1) {
      this.clases.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  buscarClases(filtros: {
    familia?: string;
    sub_familia?: string;
  }): Observable<Clase[]> {
    let resultados = [...this.clases];

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

  // ============================================================================
  // MÉTODOS CRUD PARA UNIDADES
  // ============================================================================
  crearUnidad(unidad: Unidad): Observable<Unidad> {
    // Verificar que el ID de unidad no exista
    const unidadExiste = this.unidades.find(
      (u) => u.id_unidad === unidad.id_unidad
    );
    if (unidadExiste) {
      throw new Error('Ya existe una unidad con este código');
    }

    const nuevaUnidad: Unidad = {
      ...unidad,
      id_unidad: unidad.id_unidad.toUpperCase(), // Asegurar mayúsculas
    };
    this.unidades.push(nuevaUnidad);
    return of(nuevaUnidad);
  }

  actualizarUnidad(id: string, unidad: Unidad): Observable<Unidad> {
    const index = this.unidades.findIndex((u) => u.id_unidad === id);
    if (index !== -1) {
      this.unidades[index] = {
        ...unidad,
        id_unidad: id, // Mantener el ID original
      };
      return of(this.unidades[index]);
    }
    throw new Error('Unidad no encontrada');
  }

  eliminarUnidad(id: string): Observable<boolean> {
    // Verificar que no haya insumos usando esta unidad
    const insumosConUnidad = this.materiales.filter((m) => m.id_unidad === id);
    if (insumosConUnidad.length > 0) {
      throw new Error(
        'No se puede eliminar la unidad porque hay insumos asociados'
      );
    }

    const index = this.unidades.findIndex((u) => u.id_unidad === id);
    if (index !== -1) {
      this.unidades.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  buscarUnidades(filtros: { descripcion?: string }): Observable<Unidad[]> {
    return new Observable((observer) => {
      setTimeout(() => {
        let unidadesFiltradas = [...this.unidades];

        if (filtros.descripcion) {
          const descripcion = filtros.descripcion.toLowerCase();
          unidadesFiltradas = unidadesFiltradas.filter((unidad) =>
            unidad.nombre.toLowerCase().includes(descripcion)
          );
        }

        observer.next(unidadesFiltradas);
        observer.complete();
      }, 300);
    });
  }

  // ===== LOTES (ALINEADOS CON BD) =====
  private lotes: Lote[] = [
    {
      id_lote: 1,
      id_insumo: 1,
      lote: 'LT2024001',
      ubicacion: 'Almacén Principal - A1',
      stock_inicial: 500,
      stock_actual: 350,
      fecha_expiracion: new Date('2025-06-15'),
      precio_total: 7750.0,
      estado_lote: 'ACTIVO',
    },
    {
      id_lote: 2,
      id_insumo: 2,
      lote: 'LT2024002',
      ubicacion: 'Almacén Químicos - B2',
      stock_inicial: 300,
      stock_actual: 180,
      fecha_expiracion: new Date('2025-12-20'),
      precio_total: 6840.0,
      estado_lote: 'ACTIVO',
    },
    {
      id_lote: 3,
      id_insumo: 3,
      lote: 'LT2024003',
      ubicacion: 'Almacén Tintas - C1',
      stock_inicial: 100,
      stock_actual: 25,
      fecha_expiracion: new Date('2026-03-10'),
      precio_total: 4500.0,
      estado_lote: 'ACTIVO',
    },
    {
      id_lote: 4,
      id_insumo: 4,
      lote: 'LT2024004',
      ubicacion: 'Almacén Tintas - C2',
      stock_inicial: 80,
      stock_actual: 0,
      fecha_expiracion: new Date('2025-08-30'),
      precio_total: 3080.0,
      estado_lote: 'AGOTADO',
    },
    {
      id_lote: 5,
      id_insumo: 5,
      lote: 'LT2024005',
      ubicacion: 'Almacén Materia Prima - D1',
      stock_inicial: 1000,
      stock_actual: 750,
      fecha_expiracion: undefined,
      precio_total: 6800.0,
      estado_lote: 'ACTIVO',
    },
    {
      id_lote: 6,
      id_insumo: 6,
      lote: 'LT2024006',
      ubicacion: 'Almacén Materia Prima - D2',
      stock_inicial: 200,
      stock_actual: 50,
      fecha_expiracion: undefined,
      precio_total: 2400.0,
      estado_lote: 'ACTIVO',
    },
    {
      id_lote: 7,
      id_insumo: 1,
      lote: 'LT2024007',
      ubicacion: 'Almacén Principal - A2',
      stock_inicial: 400,
      stock_actual: 400,
      fecha_expiracion: new Date('2024-02-10'), // Vencido
      precio_total: 6200.0,
      estado_lote: 'VENCIDO',
    },
    {
      id_lote: 8,
      id_insumo: 7,
      lote: 'LT2024008',
      ubicacion: 'Almacén Acabados - E1',
      stock_inicial: 150,
      stock_actual: 120,
      fecha_expiracion: new Date('2025-01-25'), // Por vencer
      precio_total: 1800.0,
      estado_lote: 'ACTIVO',
    },
    {
      id_lote: 9,
      id_insumo: 8,
      lote: 'LT2024009',
      ubicacion: 'Almacén Acabados - E2',
      stock_inicial: 60,
      stock_actual: 35,
      fecha_expiracion: new Date('2026-09-15'),
      precio_total: 1440.0,
      estado_lote: 'RESERVADO',
    },
    {
      id_lote: 10,
      id_insumo: 9,
      lote: 'LT2024010',
      ubicacion: 'Almacén Mantenimiento - F1',
      stock_inicial: 250,
      stock_actual: 15,
      fecha_expiracion: undefined,
      precio_total: 3750.0,
      estado_lote: 'ACTIVO',
    },
  ];

  // ===== MÉTODOS CRUD LOTES =====
  getLotes(): Observable<Lote[]> {
    return new Observable((observer) => {
      setTimeout(() => {
        observer.next([...this.lotes]);
        observer.complete();
      }, 300);
    });
  }

  getLote(id: number): Observable<Lote | undefined> {
    return new Observable((observer) => {
      setTimeout(() => {
        const lote = this.lotes.find((l) => l.id_lote === id);
        observer.next(lote);
        observer.complete();
      }, 200);
    });
  }

  crearLote(loteData: LoteFormDto): Observable<Lote> {
    return new Observable((observer) => {
      setTimeout(() => {
        // Validar duplicado
        const existe = this.lotes.some(
          (l) => l.lote?.toLowerCase() === loteData.lote?.toLowerCase()
        );

        if (existe) {
          observer.error({
            message: 'Ya existe un lote con este código duplicado',
          });
          return;
        }

        // Crear nuevo lote
        const nuevoId = Math.max(...this.lotes.map((l) => l.id_lote || 0)) + 1;
        const nuevoLote: Lote = {
          id_lote: nuevoId,
          id_insumo: loteData.id_insumo,
          lote: loteData.lote?.toUpperCase(),
          ubicacion: loteData.ubicacion,
          stock_inicial: loteData.stock_inicial,
          stock_actual: loteData.stock_actual,
          fecha_expiracion: loteData.fecha_expiracion,
          precio_total: loteData.precio_total,
          estado_lote: loteData.estado_lote || 'ACTIVO',
        };

        this.lotes.push(nuevoLote);
        observer.next(nuevoLote);
        observer.complete();
      }, 500);
    });
  }

  actualizarLote(id: number, loteData: LoteFormDto): Observable<Lote> {
    return new Observable((observer) => {
      setTimeout(() => {
        const index = this.lotes.findIndex((l) => l.id_lote === id);

        if (index === -1) {
          observer.error({ message: 'Lote no encontrado' });
          return;
        }

        // Validar duplicado (excluyendo el actual)
        const existeOtro = this.lotes.some(
          (l) =>
            l.id_lote !== id &&
            l.lote?.toLowerCase() === loteData.lote?.toLowerCase()
        );

        if (existeOtro) {
          observer.error({
            message: 'Ya existe otro lote con este código',
          });
          return;
        }

        // Actualizar lote
        const loteActualizado: Lote = {
          ...this.lotes[index],
          id_insumo: loteData.id_insumo,
          lote: loteData.lote?.toUpperCase(),
          ubicacion: loteData.ubicacion,
          stock_inicial: loteData.stock_inicial,
          stock_actual: loteData.stock_actual,
          fecha_expiracion: loteData.fecha_expiracion,
          precio_total: loteData.precio_total,
          estado_lote: loteData.estado_lote,
        };

        this.lotes[index] = loteActualizado;
        observer.next(loteActualizado);
        observer.complete();
      }, 500);
    });
  }

  eliminarLote(id: number): Observable<boolean> {
    return new Observable((observer) => {
      setTimeout(() => {
        const index = this.lotes.findIndex((l) => l.id_lote === id);

        if (index === -1) {
          observer.error({ message: 'Lote no encontrado' });
          return;
        }

        // Verificar si el lote está siendo usado (mock de verificación)
        const estaEnUso = false; // En la API real verificaría en Stock, Ingresos, Consumos

        if (estaEnUso) {
          observer.error({
            message:
              'No se puede eliminar el lote porque está siendo utilizado en otros registros',
          });
          return;
        }

        this.lotes.splice(index, 1);
        observer.next(true);
        observer.complete();
      }, 500);
    });
  }

  buscarLotes(filtros: {
    lote?: string;
    insumo?: string;
    estado?: string;
    ubicacion?: string;
  }): Observable<Lote[]> {
    return new Observable((observer) => {
      setTimeout(() => {
        let lotesFiltrados = [...this.lotes];

        if (filtros.lote) {
          const lote = filtros.lote.toLowerCase();
          lotesFiltrados = lotesFiltrados.filter((l) =>
            l.lote?.toLowerCase().includes(lote)
          );
        }

        if (filtros.insumo) {
          const insumo = filtros.insumo.toLowerCase();
          lotesFiltrados = lotesFiltrados.filter((l) => {
            const insumoData = this.materiales.find(
              (m) => m.id_insumo === l.id_insumo
            );
            return insumoData?.nombre.toLowerCase().includes(insumo);
          });
        }

        if (filtros.estado) {
          lotesFiltrados = lotesFiltrados.filter(
            (l) => l.estado_lote === filtros.estado
          );
        }

        if (filtros.ubicacion) {
          const ubicacion = filtros.ubicacion.toLowerCase();
          lotesFiltrados = lotesFiltrados.filter((l) =>
            l.ubicacion?.toLowerCase().includes(ubicacion)
          );
        }

        observer.next(lotesFiltrados);
        observer.complete();
      }, 300);
    });
  }
}
