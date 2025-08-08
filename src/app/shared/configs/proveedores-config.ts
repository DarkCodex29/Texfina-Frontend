import { ConfiguracionFormulario } from '../dialogs/formulario-dialog/formulario-dialog.component';
import { ConfiguracionDetalle } from '../dialogs/detalle-dialog/detalle-dialog.component';
import { ConfiguracionConfirmacion } from '../dialogs/confirmacion-dialog/confirmacion-dialog.component';

export class ProveedoresConfig {
  static formulario(
    esEdicion: boolean,
    datosIniciales?: any
  ): ConfiguracionFormulario {
    return {
      titulo: {
        agregar: 'Registrar Proveedor',
        editar: 'Editar Proveedor',
      },
      entidad: 'Proveedor',
      entidadArticulo: 'un proveedor',
      esEdicion: esEdicion,
      datosIniciales: datosIniciales,
      filas: [
        [
          {
            key: 'empresa',
            label: 'Empresa',
            tipo: 'text',
            placeholder: 'Ej: Textiles Peruanos S.A.',
            maxLength: 200,
            obligatorio: true,
            ancho: 'completo',
          },
        ],
        [
          {
            key: 'ruc',
            label: 'RUC',
            tipo: 'text',
            placeholder: 'Ej: 20123456789',
            maxLength: 11,
            obligatorio: true,
          },
          {
            key: 'contacto',
            label: 'Persona de Contacto',
            tipo: 'text',
            placeholder: 'Ej: Juan Pérez',
            maxLength: 200,
            obligatorio: true,
          },
        ],
        [
          {
            key: 'email',
            label: 'Correo Electrónico',
            tipo: 'text',
            placeholder: 'Ej: ventas@empresa.com',
            maxLength: 100,
            obligatorio: true,
          },
          {
            key: 'telefono',
            label: 'Teléfono',
            tipo: 'text',
            placeholder: 'Ej: 01-234-5678',
            maxLength: 20,
            obligatorio: true,
          },
        ],
        [
          {
            key: 'direccion',
            label: 'Dirección',
            tipo: 'text',
            placeholder: 'Ej: Av. Industrial 123, Lima',
            maxLength: 500,
            obligatorio: false,
            ancho: 'completo',
          },
        ],
      ],
    };
  }

  static detalle(datos: any): ConfiguracionDetalle {
    return {
      entidad: 'Proveedor',
      entidadArticulo: 'del proveedor',
      datos: datos,
      filas: [
        [
          {
            key: 'id_proveedor',
            label: 'ID',
            tipo: 'number',
            ancho: 'normal',
            formateo: (valor) =>
              valor ? `#${valor.toString().padStart(5, '0')}` : '-',
          },
          {
            key: 'empresa',
            label: 'Empresa',
            tipo: 'text',
            ancho: 'normal',
          },
        ],
        [
          {
            key: 'ruc',
            label: 'RUC',
            tipo: 'text',
            ancho: 'normal',
          },
          {
            key: 'contacto',
            label: 'Contacto',
            tipo: 'text',
            ancho: 'normal',
          },
        ],
        [
          {
            key: 'email',
            label: 'Correo Electrónico',
            tipo: 'text',
            ancho: 'normal',
            formateo: (valor) => valor || 'No especificado',
          },
          {
            key: 'telefono',
            label: 'Teléfono',
            tipo: 'text',
            ancho: 'normal',
            formateo: (valor) => valor || 'No especificado',
          },
        ],
        [
          {
            key: 'direccion',
            label: 'Dirección',
            tipo: 'text',
            ancho: 'completo',
          },
        ],
      ],
    };
  }

  static eliminarProveedor(empresa: string): ConfiguracionConfirmacion {
    return {
      tipo: 'danger',
      titulo: 'Eliminar Proveedor',
      subtitulo: 'Esta acción no se puede deshacer',
      mensaje: `¿Está seguro que desea eliminar el proveedor "${empresa}"?`,
      mensajeSecundario:
        'Se eliminarán todos los datos relacionados con este proveedor.',
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
