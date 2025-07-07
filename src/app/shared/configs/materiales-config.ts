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
        agregar: 'Registrar Material',
        editar: 'Editar Material',
      },
      entidad: 'Material',
      entidadArticulo: 'un material',
      esEdicion: esEdicion,
      datosIniciales: datosIniciales,
      filas: [
        [
          {
            key: 'id_fox',
            label: 'Código Fox',
            tipo: 'text',
            placeholder: 'Ej: MAT001',
            maxLength: 50,
            obligatorio: true,
          },
          {
            key: 'nombre',
            label: 'Nombre',
            tipo: 'text',
            placeholder: 'Ej: Algodón Pima',
            maxLength: 200,
            obligatorio: true,
          },
        ],
        [
          {
            key: 'clase_id',
            label: 'Clase',
            tipo: 'select',
            placeholder: 'Seleccionar clase',
            obligatorio: true,
            opciones: [], // Se cargarán dinámicamente
          },
          {
            key: 'unidad_id',
            label: 'Unidad',
            tipo: 'select',
            placeholder: 'Seleccionar unidad',
            obligatorio: true,
            opciones: [], // Se cargarán dinámicamente
          },
        ],
        [
          {
            key: 'presentacion',
            label: 'Presentación',
            tipo: 'text',
            placeholder: 'Ej: Rollo de 50kg',
            maxLength: 100,
            obligatorio: false,
          },
          {
            key: 'peso_unitario',
            label: 'Peso Unitario (kg)',
            tipo: 'number',
            placeholder: '0.00',
            step: 0.01,
            min: 0,
            obligatorio: false,
          },
        ],
        [
          {
            key: 'precio_unitario',
            label: 'Precio Unitario (S/)',
            tipo: 'number',
            placeholder: '0.00',
            step: 0.01,
            min: 0,
            obligatorio: false,
            ancho: 'completo',
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
            label: 'Presentación',
            tipo: 'text',
            ancho: 'normal',
          },
          {
            key: 'peso_unitario',
            label: 'Peso Unitario',
            tipo: 'number',
            ancho: 'normal',
            formateo: (valor) => valor ? `${valor} kg` : '-',
          },
        ],
        [
          {
            key: 'precio_unitario',
            label: 'Precio Unitario',
            tipo: 'number',
            ancho: 'completo',
            formateo: (valor) => valor ? `S/ ${valor.toFixed(2)}` : '-',
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