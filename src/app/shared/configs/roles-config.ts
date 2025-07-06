import {
  ConfiguracionFormulario,
  CampoFormulario,
} from '../dialogs/formulario-dialog/formulario-dialog.component';
import {
  ConfiguracionDetalle,
  CampoDetalle,
} from '../dialogs/detalle-dialog/detalle-dialog.component';
import { ConfiguracionConfirmacion } from '../dialogs/confirmacion-dialog/confirmacion-dialog.component';

export class RolesConfig {
  static getConfiguracionFormulario(
    esEdicion: boolean,
    datosIniciales?: any
  ): ConfiguracionFormulario {
    return {
      titulo: {
        agregar: 'Agregar Rol',
        editar: 'Editar Rol',
      },
      entidad: 'rol',
      entidadArticulo: 'el',
      esEdicion: esEdicion,
      datosIniciales: datosIniciales,
      filas: [
        [
          {
            key: 'id_rol',
            label: 'Código del Rol',
            tipo: 'text',
            obligatorio: true,
            maxLength: 20,
            placeholder: 'Ej: OPERARIO, SUPERVISOR',
          },
          {
            key: 'nombre',
            label: 'Nombre del Rol',
            tipo: 'text',
            obligatorio: true,
            maxLength: 100,
            placeholder: 'Ej: Operario de Producción',
          },
        ],
        [
          {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            obligatorio: true,
            maxLength: 500,
            placeholder: 'Describe las responsabilidades y permisos de este rol',
          },
        ],
        [
          {
            key: 'activo',
            label: 'Estado',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: true, label: 'Activo' },
              { value: false, label: 'Inactivo' },
            ],
          },
        ],
      ],
    };
  }

  static getConfiguracionDetalle(datos: any): ConfiguracionDetalle {
    return {
      entidad: 'rol',
      entidadArticulo: 'del',
      datos: datos,
      filas: [
        [
          {
            key: 'id_rol',
            label: 'Código',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
          {
            key: 'nombre',
            label: 'Nombre',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
        ],
        [
          {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            formateo: (valor) => valor || '-',
          },
        ],
        [
          {
            key: 'activo',
            label: 'Estado',
            tipo: 'text',
            formateo: (valor) => (valor ? 'Activo' : 'Inactivo'),
          },
          {
            key: 'usuarios_count',
            label: 'Usuarios Asignados',
            tipo: 'text',
            formateo: (valor) => valor?.toString() || '0',
          },
        ],
        [
          {
            key: 'permisos_count',
            label: 'Permisos Configurados',
            tipo: 'text',
            formateo: (valor) => valor?.toString() || '0',
          },
        ],
      ],
    };
  }

  static eliminarRol(rol: any): ConfiguracionConfirmacion {
    return {
      titulo: 'Eliminar Rol',
      subtitulo: 'Esta acción no se puede deshacer',
      mensaje: `¿Está seguro que desea eliminar el rol "${rol.nombre}"? 

Los usuarios asignados a este rol perderán sus permisos hasta que se les asigne un nuevo rol.`,
      tipo: 'danger',
      textoBotonConfirmar: 'Eliminar Rol',
      textoBotonCancelar: 'Cancelar',
    };
  }
}