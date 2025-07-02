import {
  ConfiguracionFormulario,
  CampoFormulario,
} from '../dialogs/formulario-dialog/formulario-dialog.component';
import {
  ConfiguracionDetalle,
  CampoDetalle,
} from '../dialogs/detalle-dialog/detalle-dialog.component';
import { ConfiguracionConfirmacion } from '../dialogs/confirmacion-dialog/confirmacion-dialog.component';

export class LogsConfig {
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
            key: 'id_log',
            label: 'ID',
            tipo: 'text',
            formateo: (valor) =>
              valor ? `#${valor.toString().padStart(6, '0')}` : '-',
          },
          {
            key: 'nivel',
            label: 'Nivel',
            tipo: 'text',
            formateo: (valor) => {
              const niveles: any = {
                INFO: 'Información',
                WARNING: 'Advertencia',
                ERROR: 'Error',
                CRITICAL: 'Crítico',
              };
              return niveles[valor] || valor || '-';
            },
          },
        ],
        [
          {
            key: 'categoria',
            label: 'Categoría',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
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
        ],
        [
          {
            key: 'mensaje',
            label: 'Mensaje',
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
            key: 'detalles_adicionales',
            label: 'Detalles Adicionales',
            tipo: 'textarea',
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
      mensaje: `¿Está seguro que desea eliminar este log del ${new Date(
        log.fecha_hora
      ).toLocaleDateString('es-ES')}?`,
      tipo: 'danger',
      textoBotonConfirmar: 'Eliminar',
      textoBotonCancelar: 'Cancelar',
    };
  }
}
