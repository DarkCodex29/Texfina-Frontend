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

export class LogsConfig {
  static getTableColumns(): TableColumn[] {
    return [
      {
        key: 'id',
        title: 'ID',
        type: 'badge',
        sortable: true,
        filterable: true,
        width: '90px',
        icon: 'pi pi-hashtag'
      },
      {
        key: 'timestamp',
        title: 'Fecha/Hora',
        type: 'date',
        sortable: true,
        filterable: true,
        width: '160px',
        icon: 'pi pi-calendar-clock'
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
        key: 'accion',
        title: 'Acción',
        type: 'action',
        sortable: true,
        filterable: true,
        width: '180px',
        icon: 'pi pi-bolt'
      },
      {
        key: 'modulo',
        title: 'Módulo',
        type: 'module',
        sortable: true,
        filterable: true,
        width: '140px',
        icon: 'pi pi-building'
      },
      {
        key: 'ip_origen',
        title: 'IP Origen',
        type: 'ip',
        sortable: true,
        filterable: true,
        width: '130px',
        icon: 'pi pi-server'
      },
      {
        key: 'descripcion',
        title: 'Descripción',
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
        tooltip: 'Ver detalle del log',
        action: 'view',
        color: 'primary'
      },
      {
        icon: 'pi pi-file-export',
        tooltip: 'Exportar log',
        action: 'export',
        color: 'secondary'
      },
      {
        icon: 'pi pi-trash',
        tooltip: 'Eliminar log',
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
        agregar: 'Agregar Log Manual',
        editar: 'Modificar Log',
      },
      entidad: 'log',
      entidadArticulo: 'el',
      esEdicion: esEdicion,
      datosIniciales: datosIniciales,
      filas: [
        [
          {
            key: 'nivel',
            label: 'Nivel',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 'INFO', label: 'Información' },
              { value: 'WARNING', label: 'Advertencia' },
              { value: 'ERROR', label: 'Error' },
              { value: 'CRITICAL', label: 'Crítico' },
            ],
          },
          {
            key: 'categoria',
            label: 'Categoría',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 'Sistema', label: 'Sistema' },
              { value: 'Seguridad', label: 'Seguridad' },
              { value: 'Base de Datos', label: 'Base de Datos' },
              { value: 'Usuario', label: 'Usuario' },
            ],
          },
        ],
        [
          {
            key: 'mensaje',
            label: 'Mensaje',
            tipo: 'textarea',
            obligatorio: true,
            maxLength: 500,
            placeholder: 'Descripción del evento o error',
          },
        ],
        [
          {
            key: 'usuario',
            label: 'Usuario',
            tipo: 'text',
            obligatorio: false,
            maxLength: 50,
            placeholder: 'Usuario relacionado (opcional)',
          },
          {
            key: 'ip_origen',
            label: 'IP de Origen',
            tipo: 'text',
            obligatorio: false,
            maxLength: 45,
            placeholder: '192.168.1.100',
          },
        ],
      ],
    };
  }

  static getConfiguracionDetalle(datos: any): ConfiguracionDetalle {
    return {
      entidad: 'log del sistema',
      entidadArticulo: 'del',
      datos: datos,
      filas: [
        [
          {
            key: 'id',
            label: 'ID',
            tipo: 'text',
            formateo: (valor) =>
              valor ? `#${valor.toString().padStart(6, '0')}` : '-',
          },
          {
            key: 'accion',
            label: 'Acción',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
        ],
        [
          {
            key: 'modulo',
            label: 'Módulo',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
          {
            key: 'timestamp',
            label: 'Fecha y Hora',
            tipo: 'text',
            formateo: (valor) => {
              if (!valor) return '-';
              const fecha = new Date(valor);
              return fecha.toLocaleString('es-ES');
            },
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
            key: 'usuario',
            label: 'Usuario',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
          {
            key: 'ip_origen',
            label: 'IP de Origen',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
        ],
        [
          {
            key: 'tabla_afectada',
            label: 'Tabla Afectada',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
        ],
      ],
    };
  }

  static eliminarLog(log: any): ConfiguracionConfirmacion {
    return {
      titulo: 'Eliminar Log',
      subtitulo: 'Esta acción no se puede deshacer',
      mensaje: `¿Está seguro que desea eliminar el log #${log.id} del ${new Date(
        log.timestamp
      ).toLocaleDateString('es-ES')}?`,
      tipo: 'danger',
      textoBotonConfirmar: 'Eliminar',
      textoBotonCancelar: 'Cancelar',
    };
  }
}
