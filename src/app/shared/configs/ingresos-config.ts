import { ConfiguracionConfirmacion } from '../dialogs/confirmacion-dialog/confirmacion-dialog.component';

export const INGRESOS_CONFIG = {
  API_ENDPOINTS: {
    BASE: '/api/ingresos',
    GET_ALL: '/api/ingresos',
    GET_BY_ID: '/api/ingresos/:id',
    CREATE: '/api/ingresos',
    UPDATE: '/api/ingresos/:id',
    DELETE: '/api/ingresos/:id',
    SEARCH: '/api/ingresos/search',
  },
  VALIDACIONES: {
    CANTIDAD_MIN: 0.01,
    PRECIO_MIN: 0,
    NUMERO_REMISION_MAX_LENGTH: 50,
    ORDEN_COMPRA_MAX_LENGTH: 50,
    PRESENTACION_MAX_LENGTH: 100,
    ESTADO_MAX_LENGTH: 50,
  },
  MENSAJES: {
    CREAR_EXITOSO: 'Ingreso registrado exitosamente',
    ACTUALIZAR_EXITOSO: 'Ingreso actualizado exitosamente',
    ELIMINAR_EXITOSO: 'Ingreso eliminado exitosamente',
    ERROR_GENERICO: 'Error al procesar el ingreso',
    INSUMO_REQUERIDO: 'El insumo es requerido',
    FECHA_REQUERIDA: 'La fecha es requerida',
    CANTIDAD_REQUERIDA: 'La cantidad es requerida',
    CANTIDAD_MINIMA: 'La cantidad debe ser mayor a 0',
  },
  ESTADOS: {
    PENDIENTE: { texto: 'Pendiente', color: 'warning' },
    RECIBIDO: { texto: 'Recibido', color: 'success' },
    PARCIAL: { texto: 'Parcial', color: 'primary' },
    CANCELADO: { texto: 'Cancelado', color: 'danger' },
    EN_PROCESO: { texto: 'En Proceso', color: 'info' },
  },
  CAMPOS_EXPORTACION: [
    { campo: 'id_ingreso', titulo: 'ID', formato: 'numero' },
    { campo: 'fecha', titulo: 'Fecha', formato: 'fecha' },
    { campo: 'insumo_nombre', titulo: 'Insumo', formato: 'texto' },
    { campo: 'cantidad', titulo: 'Cantidad', formato: 'numero' },
    { campo: 'presentacion', titulo: 'Presentación', formato: 'texto' },
    { campo: 'lote_codigo', titulo: 'Lote', formato: 'texto' },
    {
      campo: 'precio_total_formula',
      titulo: 'Precio Total',
      formato: 'moneda',
    },
    { campo: 'numero_remision', titulo: 'N° Remisión', formato: 'texto' },
    { campo: 'orden_compra', titulo: 'Orden Compra', formato: 'texto' },
    { campo: 'estado', titulo: 'Estado', formato: 'texto' },
  ],
};

export class IngresosConfig {
  static eliminarIngreso(ingreso: any): ConfiguracionConfirmacion {
    return {
      titulo: 'Confirmar Eliminación',
      subtitulo: 'Esta acción no se puede deshacer',
      mensaje: `¿Está seguro que desea eliminar el ingreso del ${this.formatearFecha(
        ingreso.fecha
      )}?`,
      mensajeSecundario: `Insumo: ${
        ingreso.insumo_nombre || 'N/A'
      } | Cantidad: ${this.formatearCantidad(
        ingreso.cantidad
      )} | Precio Total: ${this.formatearPrecio(ingreso.precio_total_formula)}`,
      tipo: 'danger',
      textoBotonConfirmar: 'Eliminar',
      textoBotonCancelar: 'Cancelar',
    };
  }

  static formatearFecha(fecha?: Date | string): string {
    if (!fecha) return '-';
    try {
      const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
      return fechaObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  }

  static formatearCantidad(cantidad?: number): string {
    return (
      cantidad?.toLocaleString('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }) + ' unidades' || '0 unidades'
    );
  }

  static formatearPrecio(precio?: number): string {
    if (!precio || precio === 0) return 'S/ 0.00';
    return `S/ ${precio.toFixed(2)}`;
  }

  static formatearCodigo(id?: number): string {
    if (!id) return 'ING-00001';
    return `ING-${id.toString().padStart(5, '0')}`;
  }

  static formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  static formatearEstado(estado?: string): { texto: string; color: string } {
    const estadoInfo =
      INGRESOS_CONFIG.ESTADOS[estado as keyof typeof INGRESOS_CONFIG.ESTADOS];
    return estadoInfo || { texto: estado || 'Sin Estado', color: 'secondary' };
  }
}
