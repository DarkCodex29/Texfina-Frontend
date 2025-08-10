import {
  ConfiguracionFormulario,
  CampoFormulario,
} from '../dialogs/formulario-dialog/formulario-dialog.component';
import {
  ConfiguracionDetalle,
  CampoDetalle,
} from '../dialogs/detalle-dialog/detalle-dialog.component';
import { ConfiguracionConfirmacion } from '../dialogs/confirmacion-dialog/confirmacion-dialog.component';
import { TableColumn, TableAction, TableButtonConfig } from '../components/prime-data-table/prime-data-table.component';

export class AuditoriaConfig {
  static getTableColumns(): TableColumn[] {
    return [
      {
        key: 'id_auditoria',
        title: 'ID',
        type: 'badge',
        sortable: true,
        filterable: true,
        width: '90px',
        icon: 'pi pi-hashtag'
      },
      {
        key: 'tipo_entidad',
        title: 'Entidad',
        type: 'text',
        sortable: true,
        filterable: true,
        width: '180px',
        icon: 'pi pi-database'
      },
      {
        key: 'accion',
        title: 'Acción',
        type: 'badge',
        sortable: true,
        filterable: true,
        width: '140px',
        icon: 'pi pi-bolt'
      },
      {
        key: 'usuario',
        title: 'Usuario',
        type: 'user',
        sortable: true,
        filterable: true,
        width: '220px',
        icon: 'pi pi-user'
      },
      {
        key: 'fecha_hora',
        title: 'Fecha/Hora',
        type: 'date',
        sortable: true,
        filterable: true,
        width: '160px',
        icon: 'pi pi-calendar-clock'
      },
      {
        key: 'campos_modificados',
        title: 'Campos Modificados',
        type: 'description',
        sortable: false,
        filterable: true,
        width: '300px',
        icon: 'pi pi-info-circle'
      }
    ];
  }

  static getTableActions(): TableAction[] {
    return [
      {
        icon: 'pi pi-eye',
        tooltip: 'Ver detalle de la auditoría',
        action: 'view',
        color: 'primary'
      },
      {
        icon: 'pi pi-arrows-h',
        tooltip: 'Comparar cambios',
        action: 'compare',
        color: 'secondary'
      },
      {
        icon: 'pi pi-trash',
        tooltip: 'Eliminar registro',
        action: 'delete',
        color: 'danger'
      }
    ];
  }

  static getTableButtons(): TableButtonConfig[] {
    return [
      {
        label: 'Agregar',
        icon: 'pi pi-plus',
        action: 'add',
        color: 'primary'
      },
      {
        label: 'Carga Masiva',
        icon: 'pi pi-upload',
        action: 'bulk-upload',
        color: 'secondary'
      }
    ];
  }
  static getConfiguracionFormulario(
    esEdicion: boolean,
    datosIniciales?: any
  ): ConfiguracionFormulario {
    return {
      titulo: {
        agregar: 'Registrar Auditoría',
        editar: 'Modificar Auditoría',
      },
      entidad: 'auditoría',
      entidadArticulo: 'la',
      esEdicion: esEdicion,
      datosIniciales: datosIniciales,
      filas: [
        [
          {
            key: 'tipo_entidad',
            label: 'Entidad',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 'Material', label: 'Material' },
              { value: 'Usuario', label: 'Usuario' },
              { value: 'Almacén', label: 'Almacén' },
              { value: 'Proveedor', label: 'Proveedor' },
              { value: 'Receta', label: 'Receta' },
            ],
          },
          {
            key: 'accion',
            label: 'Acción',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 'INSERT', label: 'Crear' },
              { value: 'UPDATE', label: 'Actualizar' },
              { value: 'DELETE', label: 'Eliminar' },
            ],
          },
        ],
        [
          {
            key: 'usuario',
            label: 'Usuario',
            tipo: 'text',
            obligatorio: true,
            maxLength: 50,
            placeholder: 'Usuario que realizó la acción',
          },
          {
            key: 'ip_address',
            label: 'IP Address',
            tipo: 'text',
            obligatorio: false,
            maxLength: 45,
            placeholder: '192.168.1.100',
          },
        ],
        [
          {
            key: 'campos_modificados',
            label: 'Campos Modificados',
            tipo: 'textarea',
            obligatorio: false,
            maxLength: 1000,
            placeholder: 'Lista de campos que fueron modificados',
          },
        ],
        [
          {
            key: 'comentarios',
            label: 'Comentarios',
            tipo: 'textarea',
            obligatorio: false,
            maxLength: 500,
            placeholder: 'Comentarios adicionales sobre la auditoría',
          },
        ],
      ],
    };
  }

  static getConfiguracionDetalle(datos: any): ConfiguracionDetalle {
    return {
      entidad: 'registro de auditoría',
      entidadArticulo: 'del',
      datos: datos,
      filas: [
        [
          {
            key: 'id_auditoria',
            label: 'ID',
            tipo: 'text',
            formateo: (valor) =>
              valor ? `#${valor.toString().padStart(6, '0')}` : '-',
          },
          {
            key: 'tipo_entidad',
            label: 'Entidad',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
        ],
        [
          {
            key: 'accion',
            label: 'Acción',
            tipo: 'text',
            formateo: (valor) => {
              const acciones: any = {
                CREATE: 'Crear',
                INSERT: 'Insertar',
                UPDATE: 'Actualizar',
                DELETE: 'Eliminar',
                LOGIN: 'Acceso',
                LOGOUT: 'Salida',
              };
              return acciones[valor] || valor || '-';
            },
          },
          {
            key: 'usuario',
            label: 'Usuario',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
        ],
        [
          {
            key: 'fecha_hora',
            label: 'Fecha y Hora',
            tipo: 'text',
            formateo: (valor) => {
              if (!valor) return '-';
              const fecha = new Date(valor);
              return fecha.toLocaleString('es-ES');
            },
          },
          {
            key: 'ip_address',
            label: 'IP Address',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
        ],
        [
          {
            key: 'campos_modificados',
            label: 'Campos Modificados',
            tipo: 'textarea',
            formateo: (valor) => valor || '-',
          },
        ],
        [
          {
            key: 'datos_anteriores',
            label: 'Datos Anteriores',
            tipo: 'textarea',
            formateo: (valor) => {
              if (!valor || valor === '{}') return '-';
              try {
                const datos = JSON.parse(valor);
                return JSON.stringify(datos, null, 2);
              } catch {
                return valor;
              }
            },
          },
        ],
        [
          {
            key: 'datos_nuevos',
            label: 'Datos Nuevos',
            tipo: 'textarea',
            formateo: (valor) => {
              if (!valor || valor === '{}') return '-';
              try {
                const datos = JSON.parse(valor);
                return JSON.stringify(datos, null, 2);
              } catch {
                return valor;
              }
            },
          },
        ],
        [
          {
            key: 'comentarios',
            label: 'Comentarios',
            tipo: 'textarea',
            formateo: (valor) => valor || '-',
          },
        ],
      ],
    };
  }

  static eliminarAuditoria(auditoria: any): ConfiguracionConfirmacion {
    return {
      titulo: 'Eliminar Auditoría',
      subtitulo: 'Esta acción no se puede deshacer',
      mensaje: `¿Está seguro que desea eliminar el registro de auditoría ${auditoria.id_auditoria}?`,
      tipo: 'danger',
      textoBotonConfirmar: 'Eliminar',
      textoBotonCancelar: 'Cancelar',
    };
  }
}
