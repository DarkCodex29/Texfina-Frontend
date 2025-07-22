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
            label: 'Presentación Predeterminada',
            tipo: 'select',
            placeholder: 'Seleccionar presentación',
            obligatorio: false,
            opciones: [
              { value: 'Bolsa 25kg', label: 'Bolsa de 25 kg' },
              { value: 'Bolsa 50kg', label: 'Bolsa de 50 kg' },
              { value: 'Saco 25kg', label: 'Saco de 25 kg' },
              { value: 'Saco 50kg', label: 'Saco de 50 kg' },
              { value: 'Tambor 200L', label: 'Tambor de 200 L' },
              { value: 'Bidón 20L', label: 'Bidón de 20 L' },
              { value: 'Caja 12 unidades', label: 'Caja de 12 unidades' },
              { value: 'Pallet 1000kg', label: 'Pallet de 1000 kg' },
              { value: 'Granel', label: 'A granel' }
            ],
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