export interface Receta {
  id_receta?: number;
  nombre: string;
  detalles?: RecetaDetalle[];
  created_at?: Date;
  updated_at?: Date;
}

export interface RecetaDetalle {
  id?: number;
  id_receta?: number;
  id_insumo?: number;
  proporcion?: number;
  orden?: number;
  tipo_medida?: string;
  insumo?: {
    id_insumo?: number;
    nombre?: string;
  };
}

export const RECETAS_CONFIG = {
  API_ENDPOINTS: {
    BASE: '/api/recetas',
    GET_ALL: '/api/recetas',
    GET_BY_ID: '/api/recetas/:id',
    CREATE: '/api/recetas',
    UPDATE: '/api/recetas/:id',
    DELETE: '/api/recetas/:id',
    SEARCH: '/api/recetas/search'
  },
  VALIDACIONES: {
    NOMBRE_MIN_LENGTH: 2,
    NOMBRE_MAX_LENGTH: 200,
    PROPORCION_MIN: 0.01,
    PROPORCION_MAX: 100000
  },
  MENSAJES: {
    CREAR_EXITOSO: 'Receta creada exitosamente',
    ACTUALIZAR_EXITOSO: 'Receta actualizada exitosamente',
    ELIMINAR_EXITOSO: 'Receta eliminada exitosamente',
    ERROR_GENERICO: 'Error al procesar la receta',
    NOMBRE_REQUERIDO: 'El nombre es obligatorio',
    NOMBRE_MUY_CORTO: 'El nombre debe tener al menos 2 caracteres',
    NOMBRE_MUY_LARGO: 'El nombre no puede tener más de 200 caracteres'
  },
  COLUMNAS_TABLA: [
    { campo: 'id_receta', titulo: 'Código', ancho: '100px' },
    { campo: 'nombre', titulo: 'Nombre', ancho: 'auto' },
    { campo: 'ingredientes', titulo: 'Ingredientes', ancho: '120px' },
    { campo: 'estado', titulo: 'Estado', ancho: '100px' },
    { campo: 'acciones', titulo: 'Acciones', ancho: '120px' }
  ]
};
