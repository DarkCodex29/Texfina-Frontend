import {
  CampoFormulario,
  ConfiguracionFormulario,
} from '../dialogs/formulario-dialog/formulario-dialog.component';
import {
  CampoDetalle,
  ConfiguracionDetalle,
} from '../dialogs/detalle-dialog/detalle-dialog.component';

export class AlmacenesConfig {
  static getConfiguracionFormulario(
    esEdicion: boolean,
    datosIniciales?: any
  ): ConfiguracionFormulario {
    return {
      entidad: 'Almacén',
      entidadArticulo: 'un almacén',
      esEdicion: esEdicion,
      datosIniciales: datosIniciales,
      filas: [
        [
          {
            key: 'nombre',
            label: 'Nombre del Almacén',
            tipo: 'text',
            placeholder: 'Ej: Almacén Principal',
            maxLength: 200,
            obligatorio: true,
          },
          {
            key: 'ubicacion',
            label: 'Ubicación',
            tipo: 'text',
            placeholder: 'Ej: Planta Baja - Sector A',
            maxLength: 500,
            obligatorio: true,
          },
        ],
      ],
    };
  }

  static getConfiguracionDetalle(datos: any): ConfiguracionDetalle {
    return {
      entidad: 'Almacén',
      entidadArticulo: 'del almacén',
      datos: datos,
      filas: [
        [
          {
            key: 'id_almacen',
            label: 'ID',
            tipo: 'number',
            ancho: 'normal',
            formateo: (valor) =>
              valor ? `#${valor.toString().padStart(3, '0')}` : '-',
          },
          {
            key: 'nombre',
            label: 'Nombre del Almacén',
            tipo: 'text',
            ancho: 'normal',
          },
        ],
        [
          {
            key: 'ubicacion',
            label: 'Ubicación',
            tipo: 'text',
            ancho: 'completo',
          },
        ],
      ],
    };
  }
}
