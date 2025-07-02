import {
  CampoFormulario,
  ConfiguracionFormulario,
} from '../dialogs/formulario-dialog/formulario-dialog.component';
import {
  CampoDetalle,
  ConfiguracionDetalle,
} from '../dialogs/detalle-dialog/detalle-dialog.component';

export class UnidadesConfig {
  static getConfiguracionFormulario(
    esEdicion: boolean,
    datosIniciales?: any
  ): ConfiguracionFormulario {
    return {
      titulo: {
        agregar: 'Registrar Unidad',
        editar: 'Editar Unidad',
      },
      entidad: 'Unidad',
      entidadArticulo: 'una unidad',
      esEdicion: esEdicion,
      datosIniciales: datosIniciales,
      filas: [
        [
          {
            key: 'id_unidad',
            label: 'Código de Unidad',
            tipo: 'text',
            placeholder: 'Ej: KG, LT, MT',
            maxLength: 10,
            obligatorio: true,
          },
          {
            key: 'nombre',
            label: 'Nombre de la Unidad',
            tipo: 'text',
            placeholder: 'Ej: Kilogramos, Litros, Metros',
            maxLength: 50,
            obligatorio: true,
          },
        ],
      ],
    };
  }

  static getConfiguracionDetalle(datos: any): ConfiguracionDetalle {
    return {
      entidad: 'Unidad',
      entidadArticulo: 'de la unidad',
      datos: datos,
      filas: [
        [
          {
            key: 'id_unidad',
            label: 'Código de Unidad',
            tipo: 'text',
            ancho: 'normal',
          },
          {
            key: 'nombre',
            label: 'Nombre de la Unidad',
            tipo: 'text',
            ancho: 'normal',
          },
        ],
      ],
    };
  }
}
