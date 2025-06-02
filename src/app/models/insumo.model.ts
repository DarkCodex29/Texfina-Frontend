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
  ubicacion?: string;
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
  username: string;
  email?: string;
  password_hash?: string;
  id_rol?: string;
  id_tipo_usuario?: number;
  activo?: boolean;
  created_at?: Date;
  last_login?: Date;

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
  id_sesion: string; // UNIQUEIDENTIFIER
  id_usuario?: number;
  inicio?: Date;
  fin?: Date;
  cerrada_automaticamente?: boolean;

  // Relaciones
  usuario?: Usuario;
}

export interface LogEvento {
  id?: number;
  id_usuario?: number;
  accion?: string;
  descripcion?: string;
  ip_origen?: string;
  modulo?: string;
  tabla_afectada?: string;
  timestamp?: Date;

  // Relaciones
  usuario?: Usuario;
}

// ===== PROVEEDORES =====
export interface Proveedor {
  id_proveedor?: number;
  empresa?: string;
  ruc?: string;
  contacto?: string;
  direccion?: string;
  created_at?: Date;
  updated_at?: Date;
}

// ===== INSUMOS Y MATERIALES =====
export interface Insumo {
  id_insumo?: number;
  id_fox?: string;
  nombre: string;
  id_clase?: string;
  peso_unitario?: number;
  id_unidad?: string;
  presentacion?: string;
  precio_unitario?: number;
  created_at?: Date;
  updated_at?: Date;

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
  precio_unitario?: number;

  // Relaciones
  insumo?: Insumo;
  proveedor?: Proveedor;
}

// ===== LOTES Y STOCK =====
export interface Lote {
  id_lote?: number;
  id_insumo?: number;
  lote?: string;
  ubicacion?: string;
  stock_inicial?: number;
  stock_actual?: number;
  fecha_expiracion?: Date;
  precio_total?: number;
  estado_lote?: string;

  // Relaciones
  insumo?: Insumo;
}

export interface Stock {
  id_stock?: number;
  id_insumo?: number;
  presentacion?: string;
  id_unidad?: string;
  cantidad?: number;
  id_lote?: number;
  id_almacen?: number;
  fecha_entrada?: Date;
  fecha_salida?: Date;

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
  fecha?: Date;
  presentacion?: string;
  id_unidad?: string;
  cantidad?: number;
  id_lote?: number;
  precio_total_formula?: number;
  precio_unitario_historico?: number;
  numero_remision?: string;
  orden_compra?: string;
  estado?: string;

  // Relaciones
  insumo?: Insumo;
  insumo_proveedor?: InsumoProveedor;
  unidad?: Unidad;
  lote?: Lote;
}

export interface Consumo {
  id_consumo?: number;
  id_insumo?: number;
  area?: string;
  fecha?: Date;
  cantidad?: number;
  id_lote?: number;
  estado?: string;

  // Relaciones
  insumo?: Insumo;
  lote?: Lote;
}

// ===== RECETAS =====
export interface Receta {
  id_receta?: number;
  nombre: string;

  // Relaciones
  detalles?: RecetaDetalle[];
}

export interface RecetaDetalle {
  id?: number;
  id_receta?: number;
  id_insumo?: number;
  proporcion?: number;
  orden?: number;
  tipo_medida?: string;

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
  ubicacion?: string;
}

export interface UnidadFormDto {
  id_unidad: string;
  nombre: string;
}
