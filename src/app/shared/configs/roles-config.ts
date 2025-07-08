import {
  ConfiguracionFormulario,
  CampoFormulario,
} from '../dialogs/formulario-dialog/formulario-dialog.component';
import {
  ConfiguracionDetalle,
  CampoDetalle,
} from '../dialogs/detalle-dialog/detalle-dialog.component';
import { ConfiguracionConfirmacion } from '../dialogs/confirmacion-dialog/confirmacion-dialog.component';
import {
  TableColumn,
  TableAction,
} from '../components/prime-data-table/prime-data-table.component';

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

  static getTableColumns(): TableColumn[] {
    return [
      {
        key: 'id_rol',
        title: 'Código',
        sortable: true,
        filterable: true,
        width: '120px',
        type: 'badge',
        align: 'center',
        visible: true,
      },
      {
        key: 'nombre',
        title: 'Rol',
        sortable: true,
        filterable: true,
        width: '200px',
        type: 'text',
        align: 'left',
        visible: true,
      },
      {
        key: 'descripcion',
        title: 'Descripción',
        sortable: false,
        filterable: true,
        width: '300px',
        type: 'text',
        align: 'left',
        visible: true,
      },
      {
        key: 'usuarios_count',
        title: 'Usuarios',
        sortable: true,
        filterable: false,
        width: '100px',
        type: 'badge',
        align: 'center',
        visible: true,
      },
      {
        key: 'permisos_count',
        title: 'Permisos',
        sortable: true,
        filterable: false,
        width: '100px',
        type: 'badge',
        align: 'center',
        visible: true,
      },
      {
        key: 'activo',
        title: 'Estado',
        sortable: true,
        filterable: true,
        width: '100px',
        type: 'badge',
        align: 'center',
        visible: true,
      },
    ];
  }

  static getTableActions(): TableAction[] {
    return [
      {
        action: 'view',
        tooltip: 'Ver Detalles',
        icon: 'pi pi-eye',
        color: 'primary',
      },
      {
        action: 'edit',
        tooltip: 'Editar',
        icon: 'pi pi-pencil',
        color: 'success',
      },
      {
        action: 'permissions',
        tooltip: 'Gestionar Permisos',
        icon: 'pi pi-shield',
        color: 'warn',
      },
      {
        action: 'delete',
        tooltip: 'Eliminar',
        icon: 'pi pi-trash',
        color: 'danger',
      },
    ];
  }
}