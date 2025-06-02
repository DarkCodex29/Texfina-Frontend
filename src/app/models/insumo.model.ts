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

export interface Clase {
  id_clase: string;
  familia: string;
  sub_familia: string;
}

export interface Unidad {
  id_unidad: string;
  nombre: string;
}

export interface Proveedor {
  id_proveedor?: number;
  empresa: string;
  ruc?: string;
  contacto?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface InsumoProveedor {
  id?: number;
  id_insumo?: number;
  id_proveedor?: number;
  precio_unitario?: number;
  proveedor?: Proveedor;
}

export interface Lote {
  id_lote?: number;
  id_insumo?: number;
  lote: string;
  ubicacion?: string;
  stock_inicial?: number;
  stock_actual?: number;
  fecha_expiracion?: Date;
  precio_total?: number;
  estado_lote?: string;

  // Relaciones
  insumo?: Insumo;
}

export interface Almacen {
  id_almacen?: number;
  nombre: string;
  ubicacion?: string;
}

export interface Ingreso {
  id_ingreso?: number;
  id_insumo?: number;
  id_insumo_proveedor?: number;
  fecha: Date;
  presentacion?: string;
  id_unidad?: string;
  cantidad: number;
  id_lote?: number;
  precio_total_formula?: number;
  precio_unitario_historico?: number;
  numero_remision?: string;
  orden_compra?: string;
  estado?: string;

  // Relaciones
  insumo?: Insumo;
  lote?: Lote;
  unidad?: Unidad;
  insumo_proveedor?: InsumoProveedor;
}
