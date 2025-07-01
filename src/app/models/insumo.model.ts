// ============================================================================
// MODELOS ALINEADOS CON crear_bd_texfina.sql
// ============================================================================

// ===== TABLAS DE CONFIGURACIÓN =====
export interface Clase {
  id_clase: string;
  familia: string;
  sub_familia: string;
}

export interface Unidad {
  id_unidad: string;
  nombre: string;
}

export interface Almacen {
  id_almacen?: number;
  nombre: string;
  ubicacion: string; // NOT NULL en BD - corregido
}

// ===== SISTEMA DE USUARIOS Y PERMISOS =====
export interface Rol {
  id_rol: string;
  nombre: string;
  descripcion?: string;
}

export interface TipoUsuario {
  id_tipo_usuario?: number;
  descripcion: string;
  requiere_cierre_automatico?: boolean;
}

export interface Usuario {
  id_usuario?: number;
  username: string; // UNIQUE NOT NULL
  email?: string;
  password_hash?: string;
  id_rol?: string;
  id_tipo_usuario?: number;
  activo?: boolean; // BIT DEFAULT 1
  created_at?: Date; // DATETIME2 DEFAULT GETDATE()
  last_login?: Date; // DATETIME2

  // Relaciones
  rol?: Rol;
  tipo_usuario?: TipoUsuario;
}

export interface Permiso {
  id_permiso?: number;
  nombre: string;
  descripcion?: string;
}

export interface RolPermiso {
  id?: number;
  id_rol: string;
  id_permiso: number;

  // Relaciones
  rol?: Rol;
  permiso?: Permiso;
}

export interface Sesion {
  id_sesion: string; // UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID()
  id_usuario?: number;
  inicio?: Date; // DATETIME2
  fin?: Date; // DATETIME2
  cerrada_automaticamente?: boolean; // BIT

  // Relaciones
  usuario?: Usuario;
}

export interface LogEvento {
  id?: number;
  id_usuario?: number;
  accion?: string; // NVARCHAR(100)
  descripcion?: string; // NVARCHAR(500)
  ip_origen?: string; // NVARCHAR(50)
  modulo?: string; // NVARCHAR(100)
  tabla_afectada?: string; // NVARCHAR(100)
  timestamp?: Date; // DATETIME2 DEFAULT GETDATE()

  // Relaciones
  usuario?: Usuario;
}

// ===== PROVEEDORES =====
export interface Proveedor {
  id_proveedor?: number;
  empresa?: string; // NVARCHAR(200)
  ruc?: string; // NVARCHAR(20)
  contacto?: string; // NVARCHAR(200)
  direccion?: string; // NVARCHAR(500)
  created_at?: Date; // DATETIME2 DEFAULT GETDATE()
  updated_at?: Date; // DATETIME2 DEFAULT GETDATE()
}

// ===== INSUMOS Y MATERIALES =====
export interface Insumo {
  id_insumo?: number;
  id_fox?: string; // NVARCHAR(50)
  nombre: string; // NVARCHAR(200) NOT NULL
  id_clase?: string;
  peso_unitario?: number; // FLOAT
  id_unidad?: string;
  presentacion?: string; // NVARCHAR(100)
  precio_unitario?: number; // FLOAT
  created_at?: Date; // DATETIME2 DEFAULT GETDATE()
  updated_at?: Date; // DATETIME2 DEFAULT GETDATE()

  // Relaciones
  clase?: Clase;
  unidad?: Unidad;
  proveedores?: InsumoProveedor[];
  lotes?: Lote[];
}

export interface InsumoProveedor {
  id?: number;
  id_insumo?: number;
  id_proveedor?: number;
  precio_unitario?: number; // FLOAT

  // Relaciones
  insumo?: Insumo;
  proveedor?: Proveedor;
}

// ===== LOTES Y STOCK =====
export interface Lote {
  id_lote?: number;
  id_insumo: number; // INT REFERENCES INSUMO - NOT NULL
  lote: string; // NVARCHAR(100) - NOT NULL
  ubicacion: string; // NVARCHAR(200) - NOT NULL
  stock_inicial: number; // FLOAT - NOT NULL
  stock_actual: number; // FLOAT - NOT NULL
  fecha_expiracion?: Date; // DATE - Puede ser NULL
  precio_total: number; // FLOAT - NOT NULL
  estado_lote: string; // NVARCHAR(50) - NOT NULL

  // Relaciones
  insumo?: Insumo;
}

export interface Stock {
  id_stock?: number;
  id_insumo?: number;
  presentacion?: string; // NVARCHAR(100)
  id_unidad?: string;
  cantidad?: number; // FLOAT
  id_lote?: number;
  id_almacen?: number;
  fecha_entrada?: Date; // DATETIME2
  fecha_salida?: Date; // DATETIME2

  // Relaciones
  insumo?: Insumo;
  unidad?: Unidad;
  lote?: Lote;
  almacen?: Almacen;
}

// ===== INGRESOS Y MOVIMIENTOS =====
export interface Ingreso {
  id_ingreso?: number;
  id_insumo?: number;
  id_insumo_proveedor?: number;
  fecha?: Date; // DATE
  presentacion?: string; // NVARCHAR(100)
  id_unidad?: string;
  cantidad?: number; // FLOAT
  id_lote?: number;
  precio_total_formula?: number; // FLOAT
  precio_unitario_historico?: number; // FLOAT
  numero_remision?: string; // NVARCHAR(50)
  orden_compra?: string; // NVARCHAR(50)
  estado?: string; // NVARCHAR(50)

  // Relaciones
  insumo?: Insumo;
  insumo_proveedor?: InsumoProveedor;
  unidad?: Unidad;
  lote?: Lote;
}

// ===== RECETAS =====
export interface Receta {
  id_receta?: number;
  nombre: string; // NVARCHAR(200) NOT NULL

  // Relaciones
  detalles?: RecetaDetalle[];
}

export interface RecetaDetalle {
  id?: number;
  id_receta?: number;
  id_insumo?: number;
  proporcion?: number; // FLOAT
  orden?: number; // INT
  tipo_medida?: string; // NVARCHAR(50)

  // Relaciones
  receta?: Receta;
  insumo?: Insumo;
}

// ===== DTOs PARA FORMULARIOS =====
export interface UsuarioFormDto {
  username: string;
  email?: string;
  password?: string;
  id_rol?: string;
  id_tipo_usuario?: number;
  activo?: boolean;
}

export interface ProveedorFormDto {
  empresa?: string;
  ruc?: string;
  contacto?: string;
  direccion?: string;
}

export interface InsumoFormDto {
  id_fox?: string;
  nombre: string;
  id_clase?: string;
  peso_unitario?: number;
  id_unidad?: string;
  presentacion?: string;
  precio_unitario?: number;
}

export interface IngresoFormDto {
  id_insumo?: number;
  id_proveedor?: number;
  fecha?: Date;
  cantidad?: number;
  id_unidad?: string;
  precio_unitario?: number;
  numero_remision?: string;
  orden_compra?: string;
  lote?: string;
  fecha_expiracion?: Date;
}

export interface AlmacenFormDto {
  nombre: string;
  ubicacion: string; // Alineado con BD - NOT NULL
}

export interface UnidadFormDto {
  id_unidad: string;
  nombre: string;
}

export interface LoteFormDto {
  id_insumo: number; // Required
  lote: string; // Required
  ubicacion: string; // Required
  stock_inicial: number; // Required
  stock_actual: number; // Required
  fecha_expiracion?: Date; // Optional
  precio_total: number; // Required
  estado_lote: string; // Required
}

// ===== INTERFACES PARA ESTADOS Y CATÁLOGOS =====
export interface EstadoLote {
  ACTIVO: 'ACTIVO';
  AGOTADO: 'AGOTADO';
  VENCIDO: 'VENCIDO';
}

export interface EstadoIngreso {
  PENDIENTE: 'PENDIENTE';
  RECIBIDO: 'RECIBIDO';
  PARCIAL: 'PARCIAL';
  CANCELADO: 'CANCELADO';
}

export interface EstadoConsumo {
  PENDIENTE: 'PENDIENTE';
  CONFIRMADO: 'CONFIRMADO';
  CANCELADO: 'CANCELADO';
}

export interface TipoRol {
  ADMIN: 'ADMIN';
  SUPERVISOR: 'SUPERVISOR';
  OPERARIO: 'OPERARIO';
  CONSULTOR: 'CONSULTOR';
}

// ===== INTERFACES PARA REPORTES Y ANÁLISIS =====
export interface StockResumen {
  totalItems: number;
  valorTotal: number;
  itemsCriticos: number;
  itemsBajos: number;
  ultimaActualizacion: Date;
}

export interface ReporteInventario {
  id_insumo: number;
  codigo_fox: string;
  nombre: string;
  clase: string;
  almacen: string;
  stock_actual: number;
  valor_unitario: number;
  valor_total: number;
  estado_stock: 'CRITICO' | 'BAJO' | 'NORMAL' | 'ALTO';
  ultimo_movimiento: Date;
}

export interface ReporteMovimiento {
  id: number;
  fecha: Date;
  tipo: 'INGRESO' | 'CONSUMO' | 'AJUSTE';
  insumo: string;
  cantidad: number;
  almacen: string;
  usuario: string;
  observaciones?: string;
}

export interface AnalisisRotacion {
  id_insumo: number;
  nombre: string;
  categoria_abc: 'A' | 'B' | 'C';
  rotacion_mensual: number;
  dias_promedio_stock: number;
  valor_inventario: number;
  clasificacion: 'RAPIDA' | 'MEDIA' | 'LENTA';
}
