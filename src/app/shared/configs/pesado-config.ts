import { ConfiguracionFormulario } from '../dialogs/formulario-dialog/formulario-dialog.component';
import { ConfiguracionDetalle } from '../dialogs/detalle-dialog/detalle-dialog.component';
import { ConfiguracionConfirmacion } from '../dialogs/confirmacion-dialog/confirmacion-dialog.component';

export class PesadoConfig {
  static formulario(
    esEdicion: boolean,
    datosIniciales?: any
  ): ConfiguracionFormulario {
    return {
      titulo: {
        agregar: 'Registrar Pesado',
        editar: 'Editar Pesado',
      },
      entidad: 'Pesado',
      entidadArticulo: 'el pesado',
      esEdicion: esEdicion,
      datosIniciales: datosIniciales,
      filas: [
        [
          {
            key: 'fecha',
            label: 'Fecha del Pesado',
            tipo: 'date',
            obligatorio: true,
            ancho: 'normal'
          },
          {
            key: 'vale',
            label: 'Número de Vale',
            tipo: 'text',
            placeholder: 'Ej: VALE-001',
            obligatorio: true,
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
            key: 'cantidadSolicitada',
            label: 'Cantidad Solicitada',
            tipo: 'number',
            placeholder: '0.00',
            obligatorio: true,
            step: 0.01,
            min: 0.01,
            ancho: 'normal'
          },
          {
            key: 'cantidadPesada',
            label: 'Cantidad Pesada (Balanza)',
            tipo: 'number',
            placeholder: 'Usar balanza...',
            obligatorio: true,
            conPesado: true,
            step: 0.001,
            min: 0.001,
            ancho: 'normal'
          }
        ],
        [
          {
            key: 'unidad',
            label: 'Unidad',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 'KG', label: 'Kilogramos (KG)' },
              { value: 'G', label: 'Gramos (G)' },
              { value: 'L', label: 'Litros (L)' },
              { value: 'ML', label: 'Mililitros (ML)' }
            ],
            ancho: 'normal'
          },
          {
            key: 'balanza',
            label: 'Balanza Utilizada',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 'Mettler MS32001L', label: 'Mettler MS32001L (32kg)' },
              { value: 'Mettler MS303TS', label: 'Mettler MS303TS (320g)' }
            ],
            ancho: 'normal'
          }
        ],
        [
          {
            key: 'operador',
            label: 'Operador',
            tipo: 'text',
            placeholder: 'Nombre del operador',
            obligatorio: true,
            ancho: 'normal'
          },
          {
            key: 'area',
            label: 'Área de Trabajo',
            tipo: 'select',
            obligatorio: true,
            opciones: [
              { value: 'Teñido Línea A', label: 'Teñido Línea A' },
              { value: 'Teñido Línea B', label: 'Teñido Línea B' },
              { value: 'Teñido Línea C', label: 'Teñido Línea C' },
              { value: 'Acabados', label: 'Acabados' },
              { value: 'Control de Calidad', label: 'Control de Calidad' },
              { value: 'Preparación', label: 'Preparación' }
            ],
            ancho: 'normal'
          }
        ],
        [
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
          },
          {
            key: 'diferencia',
            label: 'Diferencia (%)',
            tipo: 'number',
            placeholder: 'Cálculo automático',
            disabled: true,
            step: 0.01,
            ancho: 'normal'
          }
        ],
        [
          {
            key: 'observaciones',
            label: 'Observaciones del Pesado',
            tipo: 'textarea',
            placeholder: 'Observaciones del pesado, condiciones especiales...',
            obligatorio: false,
            ancho: 'completo'
          }
        ]
      ],
    };
  }

  static detalle(datos: any): ConfiguracionDetalle {
    const diferencia = datos.cantidadSolicitada && datos.cantidadPesada ? 
      (((datos.cantidadPesada - datos.cantidadSolicitada) / datos.cantidadSolicitada) * 100).toFixed(2) : '0.00';

    return {
      entidad: 'Pesado',
      entidadArticulo: 'del pesado',
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
            key: 'vale',
            label: 'N° Vale',
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
            key: 'cantidadSolicitada',
            label: 'Cantidad Solicitada',
            tipo: 'text',
            ancho: 'normal',
            formateo: (valor) => `${valor} ${datos.unidad}`
          },
          {
            key: 'cantidadPesada',
            label: 'Cantidad Pesada',
            tipo: 'text',
            ancho: 'normal',
            formateo: (valor) => `${valor} ${datos.unidad}`
          }
        ],
        [
          {
            key: 'balanza',
            label: 'Balanza Utilizada',
            tipo: 'text',
            ancho: 'normal',
          },
          {
            key: 'diferencia',
            label: 'Diferencia',
            tipo: 'text',
            ancho: 'normal',
            formateo: () => `${diferencia}%`
          }
        ],
        [
          {
            key: 'operador',
            label: 'Operador',
            tipo: 'text',
            ancho: 'normal',
          },
          {
            key: 'area',
            label: 'Área',
            tipo: 'text',
            ancho: 'normal',
          }
        ],
        [
          {
            key: 'estado',
            label: 'Estado',
            tipo: 'text',
            ancho: 'normal',
          },
          {
            key: 'created_at',
            label: 'Fecha Registro',
            tipo: 'text',
            ancho: 'normal',
            formateo: (valor) => valor ? new Date(valor).toLocaleString() : '-'
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

  static eliminarPesado(datos: any): ConfiguracionConfirmacion {
    return {
      tipo: 'danger',
      titulo: 'Eliminar Pesado',
      subtitulo: 'Esta acción no se puede deshacer',
      mensaje: `¿Está seguro que desea eliminar el pesado "${datos.vale}"?`,
      mensajeSecundario: 'Este registro de pesado será eliminado permanentemente del sistema.',
      textoBotonConfirmar: 'Eliminar',
      textoBotonCancelar: 'Cancelar',
    };
  }
}