import { ConfiguracionConfirmacion } from '../dialogs/confirmacion-dialog/confirmacion-dialog.component';

export const LOTES_CONFIG = {
  API_ENDPOINTS: {
    BASE: '/api/lotes',
    GET_ALL: '/api/lotes',
    GET_BY_ID: '/api/lotes/:id',
    CREATE: '/api/lotes',
    UPDATE: '/api/lotes/:id',
    DELETE: '/api/lotes/:id',
    SEARCH: '/api/lotes/search',
  },
  VALIDACIONES: {
    LOTE_MIN_LENGTH: 1,
    LOTE_MAX_LENGTH: 100,
    UBICACION_MAX_LENGTH: 200,
    STOCK_MIN: 0,
    PRECIO_MIN: 0,
    ESTADO_LOTE_MAX_LENGTH: 50,
  },
  MENSAJES: {
    CREAR_EXITOSO: 'Lote creado exitosamente',
    ACTUALIZAR_EXITOSO: 'Lote actualizado exitosamente',
    ELIMINAR_EXITOSO: 'Lote eliminado exitosamente',
    ERROR_GENERICO: 'Error al procesar el lote',
    LOTE_REQUERIDO: 'El código de lote es obligatorio',
    LOTE_MUY_LARGO: 'El código de lote no puede exceder 100 caracteres',
    INSUMO_REQUERIDO: 'Debe seleccionar un insumo',
    STOCK_INICIAL_REQUERIDO: 'El stock inicial es obligatorio',
    STOCK_ACTUAL_REQUERIDO: 'El stock actual es obligatorio',
    STOCK_NEGATIVO: 'El stock no puede ser negativo',
    PRECIO_NEGATIVO: 'El precio no puede ser negativo',
    UBICACION_MUY_LARGA: 'La ubicación no puede exceder 200 caracteres',
    ESTADO_REQUERIDO: 'El estado es obligatorio',
    FECHA_INVALIDA: 'Fecha de vencimiento inválida',
  },
  ESTADOS: [
    { valor: 'ACTIVO', nombre: 'Activo', color: '#16a34a' },
    { valor: 'AGOTADO', nombre: 'Agotado', color: '#dc2626' },
    { valor: 'VENCIDO', nombre: 'Vencido', color: '#ea580c' },
    { valor: 'RESERVADO', nombre: 'Reservado', color: '#ca8a04' },
    { valor: 'INACTIVO', nombre: 'Inactivo', color: '#6b7280' },
  ],
  FORMATEO: {
    FECHA_DISPLAY: 'dd/MM/yyyy',
    FECHA_API: 'yyyy-MM-dd',
    CODIGO_PREFIX: 'LT-',
    CODIGO_PADDING: 4,
  },
};

export class LotesConfig {
  static eliminarLote(lote: any): ConfiguracionConfirmacion {
    return {
      titulo: 'Eliminar Lote',
      subtitulo: 'Esta acción no se puede deshacer',
      mensaje: `¿Está seguro que desea eliminar el lote "${lote.lote}"?`,
      mensajeSecundario: `Stock actual: ${lote.stock_actual} | Estado: ${lote.estado_lote}`,
      tipo: 'danger',
      textoBotonConfirmar: 'Eliminar',
      textoBotonCancelar: 'Cancelar',
    };
  }
}
