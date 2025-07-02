import {
  ConfiguracionFormulario,
  CampoFormulario,
} from '../dialogs/formulario-dialog/formulario-dialog.component';
import {
  ConfiguracionDetalle,
  CampoDetalle,
} from '../dialogs/detalle-dialog/detalle-dialog.component';
import { ConfiguracionConfirmacion } from '../dialogs/confirmacion-dialog/confirmacion-dialog.component';

export class StockConfig {
  static getConfiguracionFormulario(
    esEdicion: boolean,
    datosIniciales?: any
  ): ConfiguracionFormulario {
    return {
      titulo: {
        agregar: 'Agregar Stock',
        editar: 'Editar Stock',
      },
      entidad: 'stock',
      entidadArticulo: 'el',
      esEdicion: esEdicion,
      datosIniciales: datosIniciales,
      filas: [
        [
          {
            key: 'codigo_fox',
            label: 'Código Fox',
            tipo: 'text',
            obligatorio: true,
            maxLength: 20,
            placeholder: 'Ingrese el código Fox',
          },
          {
            key: 'nombre_material',
            label: 'Nombre del Material',
            tipo: 'text',
            obligatorio: true,
            maxLength: 200,
            placeholder: 'Ingrese el nombre del material',
          },
        ],
        [
          {
            key: 'nombre_almacen',
            label: 'Almacén',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 'Almacén Principal', label: 'Almacén Principal' },
              { value: 'Cámara Fría', label: 'Cámara Fría' },
              { value: 'Almacén Especiales', label: 'Almacén Especiales' },
            ],
          },
          {
            key: 'clase',
            label: 'Clase',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 'Materia Prima', label: 'Materia Prima' },
              { value: 'Lácteos', label: 'Lácteos' },
              { value: 'Aditivos', label: 'Aditivos' },
              { value: 'Chocolatería', label: 'Chocolatería' },
              { value: 'Condimentos', label: 'Condimentos' },
            ],
          },
        ],
        [
          {
            key: 'cantidad_actual',
            label: 'Stock Actual',
            tipo: 'number',
            obligatorio: true,
            min: 0,
            placeholder: '0',
          },
          {
            key: 'unidad',
            label: 'Unidad',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 'KG', label: 'Kilogramos (KG)' },
              { value: 'GR', label: 'Gramos (GR)' },
              { value: 'LT', label: 'Litros (LT)' },
              { value: 'UN', label: 'Unidades (UN)' },
            ],
          },
        ],
        [
          {
            key: 'stock_minimo',
            label: 'Stock Mínimo',
            tipo: 'number',
            obligatorio: false,
            min: 0,
            placeholder: '0',
          },
          {
            key: 'stock_maximo',
            label: 'Stock Máximo',
            tipo: 'number',
            obligatorio: false,
            min: 0,
            placeholder: '0',
          },
        ],
        [
          {
            key: 'precio_unitario',
            label: 'Precio Unitario',
            tipo: 'number',
            obligatorio: false,
            min: 0,
            step: 0.01,
            placeholder: '0.00',
          },
        ],
      ],
    };
  }

  static getConfiguracionDetalle(datos: any): ConfiguracionDetalle {
    return {
      entidad: 'registro de stock',
      entidadArticulo: 'del',
      datos: datos,
      filas: [
        [
          {
            key: 'id_insumo',
            label: 'ID',
            tipo: 'text',
            formateo: (valor) =>
              valor ? `#${valor.toString().padStart(5, '0')}` : '-',
          },
          {
            key: 'codigo_fox',
            label: 'Código Fox',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
        ],
        [
          {
            key: 'nombre_material',
            label: 'Material',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
          {
            key: 'nombre_almacen',
            label: 'Almacén',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
        ],
        [
          {
            key: 'clase',
            label: 'Clase',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
          {
            key: 'unidad',
            label: 'Unidad',
            tipo: 'text',
            formateo: (valor) => valor || '-',
          },
        ],
        [
          {
            key: 'cantidad_actual',
            label: 'Stock Actual',
            tipo: 'text',
            formateo: (valor) => {
              if (!valor && valor !== 0) return '-';
              return new Intl.NumberFormat('es-PE').format(valor);
            },
          },
          {
            key: 'estado',
            label: 'Estado',
            tipo: 'text',
            formateo: (valor) => {
              const estados: any = {
                CRITICO: 'Crítico',
                BAJO: 'Stock Bajo',
                NORMAL: 'Normal',
                ALTO: 'Stock Alto',
              };
              return estados[valor] || valor || '-';
            },
          },
        ],
        [
          {
            key: 'stock_minimo',
            label: 'Stock Mínimo',
            tipo: 'text',
            formateo: (valor) => {
              if (!valor && valor !== 0) return '-';
              return new Intl.NumberFormat('es-PE').format(valor);
            },
          },
          {
            key: 'stock_maximo',
            label: 'Stock Máximo',
            tipo: 'text',
            formateo: (valor) => {
              if (!valor && valor !== 0) return '-';
              return new Intl.NumberFormat('es-PE').format(valor);
            },
          },
        ],
        [
          {
            key: 'precio_unitario',
            label: 'Precio Unitario',
            tipo: 'text',
            formateo: (valor) => {
              if (!valor || valor === 0) return '-';
              return new Intl.NumberFormat('es-PE', {
                style: 'currency',
                currency: 'PEN',
              }).format(valor);
            },
          },
          {
            key: 'valor_total',
            label: 'Valor Total',
            tipo: 'text',
            formateo: (valor) => {
              if (!valor || valor === 0) return '-';
              return new Intl.NumberFormat('es-PE', {
                style: 'currency',
                currency: 'PEN',
              }).format(valor);
            },
          },
        ],
        [
          {
            key: 'fecha_ultimo_movimiento',
            label: 'Último Movimiento',
            tipo: 'text',
            formateo: (valor) => {
              if (!valor) return '-';
              const fecha = new Date(valor);
              return fecha.toLocaleDateString('es-ES');
            },
          },
        ],
      ],
    };
  }

  static eliminarStock(stock: any): ConfiguracionConfirmacion {
    return {
      titulo: 'Eliminar Stock',
      subtitulo: 'Esta acción no se puede deshacer',
      mensaje: `¿Está seguro que desea eliminar el registro de stock para "${stock.nombre_material}"?`,
      tipo: 'danger',
      textoBotonConfirmar: 'Eliminar',
      textoBotonCancelar: 'Cancelar',
    };
  }
}
