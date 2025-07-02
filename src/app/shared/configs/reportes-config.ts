import {
  ConfiguracionFormulario,
  CampoFormulario,
} from '../dialogs/formulario-dialog/formulario-dialog.component';
import {
  ConfiguracionDetalle,
  CampoDetalle,
} from '../dialogs/detalle-dialog/detalle-dialog.component';
import { ConfiguracionConfirmacion } from '../dialogs/confirmacion-dialog/confirmacion-dialog.component';

export class ReportesConfig {
  static getConfiguracionFormulario(
    esEdicion: boolean,
    datosIniciales?: any
  ): ConfiguracionFormulario {
    return {
      titulo: {
        agregar: 'Generar Reporte',
        editar: 'Modificar Reporte',
      },
      entidad: 'reporte',
      entidadArticulo: 'el',
      esEdicion: esEdicion,
      datosIniciales: datosIniciales,
      filas: [
        [
          {
            key: 'tipo_reporte',
            label: 'Tipo de Reporte',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 'Stock Diario', label: 'Stock Diario' },
              { value: 'Movimientos', label: 'Movimientos de Inventario' },
              { value: 'Ingresos/Salidas', label: 'Ingresos y Salidas' },
              { value: 'Costos', label: 'Análisis de Costos' },
              { value: 'Perdidas', label: 'Reportes de Pérdidas' },
            ],
          },
          {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'text',
            obligatorio: false,
            maxLength: 200,
            placeholder: 'Descripción opcional del reporte',
          },
        ],
        [
          {
            key: 'fecha_desde',
            label: 'Fecha Desde',
            tipo: 'date',
            obligatorio: true,
          },
          {
            key: 'fecha_hasta',
            label: 'Fecha Hasta',
            tipo: 'date',
            obligatorio: true,
          },
        ],
        [
          {
            key: 'formato',
            label: 'Formato de Salida',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 'PDF', label: 'PDF' },
              { value: 'Excel', label: 'Excel' },
              { value: 'CSV', label: 'CSV' },
            ],
          },
          {
            key: 'incluir_graficos',
            label: 'Incluir Gráficos',
            tipo: 'select',
            obligatorio: false,
            opciones: [
              { value: true, label: 'Sí' },
              { value: false, label: 'No' },
            ],
          },
        ],
      ],
    };
  }

  static getConfiguracionDetalle(datos: any): ConfiguracionDetalle {
    return {
      entidad: 'reporte',
      entidadArticulo: 'del',
      datos: datos,
      filas: [
        [
          {
            key: 'id_reporte',
            label: 'ID',
            tipo: 'text',
            formateo: (valor) =>
              valor ? `#${valor.toString().padStart(5, '0')}` : '-',
          },
          {
            key: 'tipo_reporte',
            label: 'Tipo de Reporte',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
        ],
        [
          {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
          {
            key: 'formato',
            label: 'Formato',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
        ],
        [
          {
            key: 'fecha_desde',
            label: 'Fecha Desde',
            tipo: 'text',
            formateo: (valor) => {
              if (!valor) return '-';
              const fecha = new Date(valor);
              return fecha.toLocaleDateString('es-ES');
            },
          },
          {
            key: 'fecha_hasta',
            label: 'Fecha Hasta',
            tipo: 'text',
            formateo: (valor) => {
              if (!valor) return '-';
              const fecha = new Date(valor);
              return fecha.toLocaleDateString('es-ES');
            },
          },
        ],
        [
          {
            key: 'estado_generacion',
            label: 'Estado',
            tipo: 'text',
            formateo: (valor) => {
              const estados: any = {
                PENDIENTE: 'Pendiente',
                GENERANDO: 'Generando...',
                COMPLETADO: 'Completado',
                ERROR: 'Error',
              };
              return estados[valor] || valor || '-';
            },
          },
          {
            key: 'incluir_graficos',
            label: 'Incluye Gráficos',
            tipo: 'text',
            formateo: (valor) => (valor ? 'Sí' : 'No'),
          },
        ],
        [
          {
            key: 'fecha_generacion',
            label: 'Fecha de Generación',
            tipo: 'text',
            formateo: (valor) => {
              if (!valor) return '-';
              const fecha = new Date(valor);
              return fecha.toLocaleDateString('es-ES');
            },
          },
          {
            key: 'usuario_generacion',
            label: 'Generado por',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
        ],
      ],
    };
  }

  static eliminarReporte(reporte: any): ConfiguracionConfirmacion {
    return {
      titulo: 'Eliminar Reporte',
      subtitulo: 'Esta acción no se puede deshacer',
      mensaje: `¿Está seguro que desea eliminar el reporte "${reporte.tipo_reporte}"?`,
      tipo: 'danger',
      textoBotonConfirmar: 'Eliminar',
      textoBotonCancelar: 'Cancelar',
    };
  }
}
