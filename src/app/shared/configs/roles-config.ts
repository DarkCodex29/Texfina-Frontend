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
            key: 'permisos_modificar',
            label: 'Permisos de Modificación',
            tipo: 'checkbox-group',
            obligatorio: false,
            opciones: [
              { value: 'modificar_maestro', label: 'Modificar Maestro' },
              { value: 'modificar_peso', label: 'Modificar Peso' },
              { value: 'modificar_precios', label: 'Modificar Precios' },
              { value: 'modificar_estado_de_lote', label: 'Modificar Estado de Lote' },
              { value: 'modificar_qca', label: 'Modificar QCA' },
            ],
          },
        ],
        [
          {
            key: 'permisos_registro_ingreso',
            label: 'Permisos de Registro e Ingreso',
            tipo: 'checkbox-group',
            obligatorio: false,
            opciones: [
              { value: 'registro_lotes', label: 'Registro de Lotes' },
              { value: 'registro_precio_local', label: 'Precio Local' },
              { value: 'registro_precio_importacion', label: 'Precio Importación' },
              { value: 'apartado_pesado', label: 'Apartado Pesado' },
              { value: 'apartado_lectura_cajas', label: 'Lectura de Cajas' },
            ],
          },
        ],
        [
          {
            key: 'permisos_apartados',
            label: 'Permisos de Lectura/Apartados',
            tipo: 'checkbox-group',
            obligatorio: false,
            opciones: [
              { value: 'lectura_maestro', label: 'Lectura Maestro' },
              { value: 'lectura_precios', label: 'Lectura Precios' },
              { value: 'lectura_reporte', label: 'Lectura Reporte' },
              { value: 'lectura_dashboard', label: 'Lectura Dashboard' },
              { value: 'lectura_descarga', label: 'Lectura Descarga' },
              { value: 'lectura_stock', label: 'Lectura Stock' },
              { value: 'lectura_pesado', label: 'Lectura Pesado' },
            ],
          },
        ],
        [
          {
            key: 'permisos_historial',
            label: 'Permisos de Historial',
            tipo: 'checkbox-group',
            obligatorio: false,
            opciones: [
              { value: 'historial_movimientos', label: 'Historial Movimientos' },
              { value: 'historial_precios', label: 'Historial Precios' },
              { value: 'historial_logs', label: 'Historial Logs' },
              { value: 'historial_auditoria', label: 'Historial Auditoría' },
              { value: 'historial_descarga', label: 'Historial Descarga' },
            ],
          },
        ],
        [
          {
            key: 'permisos_roles',
            label: 'Permisos de Gestión de Roles',
            tipo: 'checkbox-group',
            obligatorio: false,
            opciones: [
              { value: 'roles_asignacion', label: 'Asignar Roles a Usuarios' },
              { value: 'roles_modificacion', label: 'Modificar Roles y Permisos' },
            ],
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
        tooltip: 'Editar Rol y Permisos',
        icon: 'pi pi-pencil',
        color: 'success',
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