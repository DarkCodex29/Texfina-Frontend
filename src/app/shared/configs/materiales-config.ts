import { ConfiguracionFormulario } from '../dialogs/formulario-dialog/formulario-dialog.component';
import { ConfiguracionDetalle } from '../dialogs/detalle-dialog/detalle-dialog.component';
import { ConfiguracionConfirmacion } from '../dialogs/confirmacion-dialog/confirmacion-dialog.component';

export class MaterialesConfig {
  static formulario(
    esEdicion: boolean,
    datosIniciales?: any
  ): ConfiguracionFormulario {
    return {
      titulo: {
        agregar: 'Registro de Insumo',
        editar: 'Editar Insumo',
      },
      entidad: 'Insumo',
      entidadArticulo: 'un insumo',
      esEdicion: esEdicion,
      datosIniciales: datosIniciales,
      filas: [
        [
          {
            key: 'id_fox',
            label: 'Código Fox',
            tipo: 'text',
            placeholder: 'Ej: 0003686',
            maxLength: 50,
            obligatorio: true,
          },
          {
            key: 'nombre',
            label: 'Nombre del Insumo',
            tipo: 'text',
            placeholder: 'Ej: BASICO AMARILLO X-8GL 250%',
            maxLength: 200,
            obligatorio: true,
          },
        ],
        [
          {
            key: 'id_clase',
            label: 'Clase',
            tipo: 'select',
            placeholder: 'Buscar y seleccionar clase...',
            obligatorio: true,
            opciones: [], // Se cargarán dinámicamente
            conBotonAgregar: true,
          },
          {
            key: 'id_proveedor',
            label: 'Proveedor *',
            tipo: 'select',
            placeholder: 'Seleccionar proveedor',
            obligatorio: true,
            opciones: [], // Se cargarán dinámicamente
            conBotonAgregar: true,
          },
        ],
        [
          {
            key: 'familia',
            label: 'Familia',
            tipo: 'text',
            placeholder: 'Ej: COLORANTE',
            obligatorio: true,
            ancho: 'normal',
          },
          {
            key: 'subfamilia',
            label: 'Subfamilia',
            tipo: 'text',
            placeholder: 'Ej: CATIONICO',
            obligatorio: true,
            ancho: 'normal',
          },
        ],
        [
          {
            key: 'id_unidad',
            label: 'Unidad de Medida',
            tipo: 'select',
            placeholder: 'Seleccionar unidad',
            obligatorio: true,
            opciones: [], // Se cargarán dinámicamente
            ancho: 'normal',
          },
          {
            key: 'presentacion',
            label: 'Presentación',
            tipo: 'select',
            placeholder: 'Seleccionar presentación',
            obligatorio: true,
            opciones: [
              { value: 'CAJA', label: 'CAJA' },
              { value: 'BOLSA', label: 'BOLSA' },
              { value: 'SACO', label: 'SACO' },
              { value: 'TAMBOR', label: 'TAMBOR' },
              { value: 'BIDÓN', label: 'BIDÓN' },
              { value: 'GALONERA', label: 'GALONERA' },
              { value: 'PALLET', label: 'PALLET' },
              { value: 'GRANEL', label: 'GRANEL' }
            ],
            ancho: 'normal',
          },
        ],
      ],
    };
  }

  static detalle(datos: any): ConfiguracionDetalle {
    return {
      entidad: 'Material',
      entidadArticulo: 'del material',
      datos: datos,
      filas: [
        [
          {
            key: 'id_fox',
            label: 'Código Fox',
            tipo: 'text',
            ancho: 'normal',
          },
          {
            key: 'nombre',
            label: 'Nombre',
            tipo: 'text',
            ancho: 'normal',
          },
        ],
        [
          {
            key: 'clase.nombre',
            label: 'Clase',
            tipo: 'text',
            ancho: 'normal',
          },
          {
            key: 'unidad.nombre',
            label: 'Unidad',
            tipo: 'text',
            ancho: 'normal',
          },
        ],
        [
          {
            key: 'presentacion',
            label: 'Presentación Predeterminada',
            tipo: 'text',
            ancho: 'completo',
            formateo: (valor) => valor || 'No especificada',
          },
        ],
      ],
    };
  }

  static eliminarMaterial(nombre: string): ConfiguracionConfirmacion {
    return {
      tipo: 'danger',
      titulo: 'Eliminar Material',
      subtitulo: 'Esta acción no se puede deshacer',
      mensaje: `¿Está seguro que desea eliminar el material "${nombre}"?`,
      mensajeSecundario:
        'Se eliminarán todos los registros relacionados con este material.',
      textoBotonConfirmar: 'Eliminar',
      textoBotonCancelar: 'Cancelar',
    };
  }

  static advertencia(mensaje: string): ConfiguracionConfirmacion {
    return {
      tipo: 'warning',
      titulo: 'Advertencia',
      subtitulo: 'Confirme la acción antes de continuar',
      mensaje: mensaje,
      textoBotonConfirmar: 'Continuar',
      textoBotonCancelar: 'Cancelar',
    };
  }

  static informacion(mensaje: string): ConfiguracionConfirmacion {
    return {
      tipo: 'info',
      titulo: 'Información',
      subtitulo: 'Información del sistema',
      mensaje: mensaje,
      textoBotonConfirmar: 'Entendido',
      textoBotonCancelar: 'Cerrar',
    };
  }
}