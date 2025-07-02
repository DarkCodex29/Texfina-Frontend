import { ConfiguracionConfirmacion } from '../dialogs/confirmacion-dialog/confirmacion-dialog.component';

export const CONSUMOS_CONFIG = {
  API_ENDPOINTS: {
    BASE: '/api/consumos',
    GET_ALL: '/api/consumos',
    GET_BY_ID: '/api/consumos/:id',
    CREATE: '/api/consumos',
    UPDATE: '/api/consumos/:id',
    DELETE: '/api/consumos/:id',
    SEARCH: '/api/consumos/search',
  },
  VALIDACIONES: {
    CANTIDAD_MIN: 0.01,
    AREA_MAX_LENGTH: 100,
    ESTADO_MAX_LENGTH: 50,
  },
  MENSAJES: {
    CREAR_EXITOSO: 'Consumo registrado exitosamente',
    ACTUALIZAR_EXITOSO: 'Consumo actualizado exitosamente',
    ELIMINAR_EXITOSO: 'Consumo eliminado exitosamente',
    ERROR_GENERICO: 'Error al procesar el consumo',
    INSUMO_REQUERIDO: 'El insumo es requerido',
    FECHA_REQUERIDA: 'La fecha es requerida',
    CANTIDAD_REQUERIDA: 'La cantidad es requerida',
    CANTIDAD_MINIMA: 'La cantidad debe ser mayor a 0',
    AREA_REQUERIDA: 'El área es requerida',
  },
  ESTADOS: {
    PENDIENTE: { texto: 'Pendiente', color: 'warning' },
    COMPLETADO: { texto: 'Completado', color: 'success' },
    CANCELADO: { texto: 'Cancelado', color: 'danger' },
    EN_PROCESO: { texto: 'En Proceso', color: 'info' },
    ANULADO: { texto: 'Anulado', color: 'secondary' },
  },
  CAMPOS_EXPORTACION: [
    { campo: 'id_consumo', titulo: 'ID', formato: 'numero' },
    { campo: 'fecha', titulo: 'Fecha', formato: 'fecha' },
    { campo: 'insumo_nombre', titulo: 'Insumo', formato: 'texto' },
    { campo: 'area', titulo: 'Área', formato: 'texto' },
    { campo: 'cantidad', titulo: 'Cantidad', formato: 'numero' },
    { campo: 'lote_codigo', titulo: 'Lote', formato: 'texto' },
    { campo: 'estado', titulo: 'Estado', formato: 'texto' },
    { campo: 'created_at', titulo: 'Fecha Creación', formato: 'fecha' },
    { campo: 'updated_at', titulo: 'Última Actualización', formato: 'fecha' },
  ],
};

export class ConsumosConfig {
  static eliminarConsumo(consumo: any): ConfiguracionConfirmacion {
    return {
      titulo: 'Confirmar Eliminación',
      subtitulo: 'Esta acción no se puede deshacer',
      mensaje: `¿Está seguro que desea eliminar el consumo del ${this.formatearFecha(
        consumo.fecha
      )}?`,
      mensajeSecundario: `Insumo: ${
        consumo.insumo_nombre || 'N/A'
      } | Área: ${this.formatearTexto(
        consumo.area
      )} | Cantidad: ${this.formatearCantidad(consumo.cantidad)}`,
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

  static formatearCodigo(id?: number): string {
    if (!id) return 'CON-00001';
    return `CON-${id.toString().padStart(5, '0')}`;
  }

  static formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  static formatearEstado(estado?: string): { texto: string; color: string } {
    const estadoInfo =
      CONSUMOS_CONFIG.ESTADOS[estado as keyof typeof CONSUMOS_CONFIG.ESTADOS];
    return estadoInfo || { texto: estado || 'Sin Estado', color: 'secondary' };
  }
}
