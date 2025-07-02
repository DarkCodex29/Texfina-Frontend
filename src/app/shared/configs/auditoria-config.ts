import {
  ConfiguracionFormulario,
  CampoFormulario,
} from '../dialogs/formulario-dialog/formulario-dialog.component';
import {
  ConfiguracionDetalle,
  CampoDetalle,
} from '../dialogs/detalle-dialog/detalle-dialog.component';
import { ConfiguracionConfirmacion } from '../dialogs/confirmacion-dialog/confirmacion-dialog.component';

export class AuditoriaConfig {
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
            key: 'entidad',
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
            key: 'ip_cliente',
            label: 'IP Cliente',
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
            key: 'entidad',
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
                INSERT: 'Crear',
                UPDATE: 'Actualizar',
                DELETE: 'Eliminar',
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
            key: 'ip_cliente',
            label: 'IP Cliente',
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
            key: 'valores_anteriores',
            label: 'Valores Anteriores',
            tipo: 'textarea',
            formateo: (valor) => valor || '-',
          },
        ],
        [
          {
            key: 'valores_nuevos',
            label: 'Valores Nuevos',
            tipo: 'textarea',
            formateo: (valor) => valor || '-',
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
