import { ConfiguracionFormulario } from '../dialogs/formulario-dialog/formulario-dialog.component';
import { ConfiguracionDetalle } from '../dialogs/detalle-dialog/detalle-dialog.component';
import { ConfiguracionConfirmacion } from '../dialogs/confirmacion-dialog/confirmacion-dialog.component';

export class MovimientosConfig {
  static formulario(
    esEdicion: boolean,
    datosIniciales?: any
  ): ConfiguracionFormulario {
    return {
      titulo: {
        agregar: 'Registrar Movimiento',
        editar: 'Editar Movimiento',
      },
      entidad: 'Movimiento',
      entidadArticulo: 'el movimiento',
      esEdicion: esEdicion,
      datosIniciales: datosIniciales,
      filas: [
        [
          {
            key: 'fecha',
            label: 'Fecha del Movimiento',
            tipo: 'date',
            obligatorio: true,
            ancho: 'normal'
          },
          {
            key: 'tipoMovimiento',
            label: 'Tipo de Movimiento',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 'Traslado', label: 'Traslado entre almacenes' },
              { value: 'Transferencia', label: 'Transferencia de área' },
              { value: 'Reubicación', label: 'Reubicación interna' },
              { value: 'Ajuste', label: 'Ajuste de inventario' },
              { value: 'Devolución', label: 'Devolución' }
            ],
            ancho: 'normal'
          }
        ],
        [
          {
            key: 'qca_codigo',
            label: 'Código QCA',
            tipo: 'text',
            placeholder: 'Escanear código QR...',
            obligatorio: true,
            conScanner: true,
            ancho: 'completo'
          }
        ],
        [
          {
            key: 'id_insumo',
            label: 'Insumo',
            tipo: 'autocomplete',
            placeholder: 'Buscar insumo...',
            obligatorio: true,
            opciones: [], // Se cargarán dinámicamente
            ancho: 'normal'
          },
          {
            key: 'id_lote',
            label: 'Lote',
            tipo: 'select',
            placeholder: 'Seleccionar lote',
            obligatorio: true,
            opciones: [], // Se cargarán dinámicamente
            ancho: 'normal'
          }
        ],
        [
          {
            key: 'cantidad',
            label: 'Cantidad a Mover',
            tipo: 'number',
            placeholder: '0.00',
            obligatorio: true,
            step: 0.01,
            min: 0.01,
            ancho: 'normal'
          },
          {
            key: 'unidad',
            label: 'Unidad',
            tipo: 'text',
            placeholder: 'KG, G, L, etc.',
            obligatorio: true,
            ancho: 'normal'
          }
        ],
        [
          {
            key: 'almacenOrigen',
            label: 'Almacén Origen',
            tipo: 'select',
            placeholder: 'Seleccionar almacén origen',
            obligatorio: true,
            opciones: [
              { value: 'Almacén Principal', label: 'Almacén Principal' },
              { value: 'Almacén Corpac', label: 'Almacén Corpac' },
              { value: 'Almacén Tránsito', label: 'Almacén Tránsito' },
              { value: 'Almacén Químicos', label: 'Almacén Químicos' }
            ],
            ancho: 'normal'
          },
          {
            key: 'almacenDestino',
            label: 'Almacén Destino',
            tipo: 'select',
            placeholder: 'Seleccionar almacén destino',
            obligatorio: true,
            opciones: [
              { value: 'Almacén Principal', label: 'Almacén Principal' },
              { value: 'Almacén Corpac', label: 'Almacén Corpac' },
              { value: 'Almacén Tránsito', label: 'Almacén Tránsito' },
              { value: 'Almacén Químicos', label: 'Almacén Químicos' }
            ],
            ancho: 'normal'
          }
        ],
        [
          {
            key: 'responsable',
            label: 'Responsable',
            tipo: 'text',
            placeholder: 'Nombre del responsable',
            obligatorio: true,
            ancho: 'normal'
          },
          {
            key: 'estado',
            label: 'Estado',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 'Pendiente', label: 'Pendiente' },
              { value: 'En Proceso', label: 'En Proceso' },
              { value: 'Completado', label: 'Completado' },
              { value: 'Cancelado', label: 'Cancelado' }
            ],
            ancho: 'normal'
          }
        ],
        [
          {
            key: 'observaciones',
            label: 'Observaciones',
            tipo: 'textarea',
            placeholder: 'Observaciones del movimiento...',
            obligatorio: false,
            ancho: 'completo'
          }
        ]
      ],
    };
  }

  static detalle(datos: any): ConfiguracionDetalle {
    return {
      entidad: 'Movimiento',
      entidadArticulo: 'del movimiento',
      datos: datos,
      filas: [
        [
          {
            key: 'fecha',
            label: 'Fecha',
            tipo: 'text',
            ancho: 'normal',
          },
          {
            key: 'tipoMovimiento',
            label: 'Tipo de Movimiento',
            tipo: 'text',
            ancho: 'normal',
          }
        ],
        [
          {
            key: 'qca',
            label: 'Código QCA',
            tipo: 'text',
            ancho: 'completo',
          }
        ],
        [
          {
            key: 'insumoNombre',
            label: 'Insumo',
            tipo: 'text',
            ancho: 'normal',
          },
          {
            key: 'lote',
            label: 'Lote',
            tipo: 'text',
            ancho: 'normal',
          }
        ],
        [
          {
            key: 'cantidad',
            label: 'Cantidad',
            tipo: 'text',
            ancho: 'normal',
            formateo: (valor) => `${valor} ${datos.unidad}`
          },
          {
            key: 'estado',
            label: 'Estado',
            tipo: 'text',
            ancho: 'normal',
          }
        ],
        [
          {
            key: 'almacenOrigen',
            label: 'Almacén Origen',
            tipo: 'text',
            ancho: 'normal',
          },
          {
            key: 'almacenDestino',
            label: 'Almacén Destino',
            tipo: 'text',
            ancho: 'normal',
          }
        ],
        [
          {
            key: 'responsable',
            label: 'Responsable',
            tipo: 'text',
            ancho: 'completo',
          }
        ],
        [
          {
            key: 'observaciones',
            label: 'Observaciones',
            tipo: 'text',
            ancho: 'completo',
            formateo: (valor) => valor || 'Sin observaciones'
          }
        ]
      ],
    };
  }

  static eliminarMovimiento(datos: any): ConfiguracionConfirmacion {
    return {
      tipo: 'danger',
      titulo: 'Eliminar Movimiento',
      subtitulo: 'Esta acción no se puede deshacer',
      mensaje: `¿Está seguro que desea eliminar el movimiento QCA "${datos.qca}"?`,
      mensajeSecundario: 'Este movimiento será eliminado permanentemente del sistema.',
      textoBotonConfirmar: 'Eliminar',
      textoBotonCancelar: 'Cancelar',
    };
  }
}