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

export class UsuariosConfig {
  static getConfiguracionFormulario(
    esEdicion: boolean,
    datosIniciales?: any
  ): ConfiguracionFormulario {
    return {
      titulo: {
        agregar: 'Agregar Usuario',
        editar: 'Editar Usuario',
      },
      entidad: 'usuario',
      entidadArticulo: 'el',
      esEdicion: esEdicion,
      datosIniciales: datosIniciales,
      filas: [
        [
          {
            key: 'username',
            label: 'Nombre de Usuario',
            tipo: 'text',
            obligatorio: true,
            maxLength: 50,
            placeholder: 'Ingrese el nombre de usuario',
          },
          {
            key: 'email',
            label: 'Correo Electrónico',
            tipo: 'text',
            obligatorio: false,
            maxLength: 100,
            placeholder: 'usuario@ejemplo.com',
          },
        ],
        [
          {
            key: 'id_rol',
            label: 'Rol',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 'ADMIN', label: 'Administrador' },
              { value: 'SUPERVISOR', label: 'Supervisor' },
              { value: 'OPERARIO', label: 'Operario' },
              { value: 'CONSULTOR', label: 'Consultor' },
            ],
            conBotonAgregar: true,
          },
          {
            key: 'id_tipo_usuario',
            label: 'Tipo de Usuario',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 1, label: 'Usuario Regular' },
              { value: 2, label: 'Usuario Temporal' },
              { value: 3, label: 'Usuario Externo' },
            ],
            conBotonAgregar: true,
          },
        ],
      ],
    };
  }

  static getConfiguracionDetalle(datos: any): ConfiguracionDetalle {
    return {
      entidad: 'usuario',
      entidadArticulo: 'del',
      datos: datos,
      filas: [
        [
          {
            key: 'id_usuario',
            label: 'ID',
            tipo: 'text',
            formateo: (valor) =>
              valor ? `#${valor.toString().padStart(3, '0')}` : '-',
          },
          {
            key: 'username',
            label: 'Nombre de Usuario',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
        ],
        [
          {
            key: 'email',
            label: 'Correo Electrónico',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
          {
            key: 'id_rol',
            label: 'Rol',
            tipo: 'text',
            formateo: (valor) => {
              const roles: any = {
                ADMIN: 'Administrador',
                SUPERVISOR: 'Supervisor',
                OPERARIO: 'Operario',
                CONSULTOR: 'Consultor',
              };
              return roles[valor] || valor || '-';
            },
          },
        ],
        [
          {
            key: 'id_tipo_usuario',
            label: 'Tipo de Usuario',
            tipo: 'text',
            formateo: (valor) => {
              const tipos: any = {
                1: 'Usuario Regular',
                2: 'Usuario Temporal',
                3: 'Usuario Externo',
              };
              return tipos[valor] || valor || '-';
            },
          },
          {
            key: 'activo',
            label: 'Estado',
            tipo: 'text',
            formateo: (valor) => (valor ? 'Activo' : 'Inactivo'),
          },
        ],
        [
          {
            key: 'created_at',
            label: 'Fecha de Creación',
            tipo: 'text',
            formateo: (valor) => {
              if (!valor) return '-';
              const fecha = new Date(valor);
              return fecha.toLocaleDateString('es-ES');
            },
          },
          {
            key: 'last_login',
            label: 'Último Acceso',
            tipo: 'text',
            formateo: (valor) => {
              if (!valor) return 'Nunca';
              const fecha = new Date(valor);
              return fecha.toLocaleDateString('es-ES');
            },
          },
        ],
      ],
    };
  }

  static eliminarUsuario(usuario: any): ConfiguracionConfirmacion {
    return {
      titulo: 'Eliminar Usuario',
      subtitulo: 'Esta acción no se puede deshacer',
      mensaje: `¿Está seguro que desea eliminar el usuario "${usuario.username}"?`,
      tipo: 'danger',
      textoBotonConfirmar: 'Eliminar',
      textoBotonCancelar: 'Cancelar',
    };
  }

  static getTableColumns(): TableColumn[] {
    return [
      {
        key: 'id_usuario',
        title: 'ID',
        sortable: true,
        filterable: true,
        width: '80px',
        type: 'badge',
        align: 'center',
        visible: true,
      },
      {
        key: 'username',
        title: 'Usuario',
        sortable: true,
        filterable: true,
        width: '200px',
        type: 'text',
        align: 'left',
        visible: true,
      },
      {
        key: 'email',
        title: 'Email',
        sortable: true,
        filterable: true,
        width: '250px',
        type: 'text',
        align: 'left',
        visible: true,
      },
      {
        key: 'id_rol',
        title: 'Rol',
        sortable: true,
        filterable: true,
        width: '150px',
        type: 'badge',
        align: 'center',
        visible: true,
      },
      {
        key: 'activo',
        title: 'Estado',
        sortable: true,
        filterable: true,
        width: '120px',
        type: 'badge',
        align: 'center',
        visible: true,
      },
      {
        key: 'last_login',
        title: 'Último Acceso',
        sortable: true,
        filterable: true,
        width: '150px',
        type: 'date',
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
        color: 'secondary',
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
