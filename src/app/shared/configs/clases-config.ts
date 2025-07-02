import {
  CampoFormulario,
  ConfiguracionFormulario,
} from '../dialogs/formulario-dialog/formulario-dialog.component';
import {
  CampoDetalle,
  ConfiguracionDetalle,
} from '../dialogs/detalle-dialog/detalle-dialog.component';

export class ClasesConfig {
  // Configuración para formulario de editar/agregar
  static getConfiguracionFormulario(
    esEdicion: boolean,
    datosIniciales?: any
  ): ConfiguracionFormulario {
    return {
      titulo: {
        agregar: 'Registrar Clase',
        editar: 'Editar Clase',
      },
      entidad: 'Clase',
      entidadArticulo: 'una clase',
      esEdicion: esEdicion,
      datosIniciales: datosIniciales,
      filas: [
        // Primera fila: ID Clase y Familia
        [
          {
            key: 'id_clase',
            label: 'Código de Clase',
            tipo: 'text',
            placeholder: 'Ej: ALG',
            maxLength: 10,
            obligatorio: true,
          },
          {
            key: 'familia',
            label: 'Familia',
            tipo: 'text',
            placeholder: 'Ej: Algodón',
            maxLength: 100,
            obligatorio: true,
          },
        ],
        // Segunda fila: Subfamilia
        [
          {
            key: 'sub_familia',
            label: 'Subfamilia',
            tipo: 'text',
            placeholder: 'Ej: Algodón Peinado',
            maxLength: 100,
            obligatorio: true,
            ancho: 'completo',
          },
        ],
      ],
    };
  }

  // Configuración para modal de detalle
  static getConfiguracionDetalle(datos: any): ConfiguracionDetalle {
    return {
      entidad: 'Clase',
      entidadArticulo: 'de la clase',
      datos: datos,
      filas: [
        // Primera fila: Código
        [
          {
            key: 'id_clase',
            label: 'Código de Clase',
            tipo: 'text',
            ancho: 'completo',
          },
        ],
        // Segunda fila: Familia
        [
          {
            key: 'familia',
            label: 'Familia',
            tipo: 'text',
            ancho: 'completo',
          },
        ],
        // Tercera fila: Subfamilia
        [
          {
            key: 'sub_familia',
            label: 'Subfamilia',
            tipo: 'text',
            ancho: 'completo',
          },
        ],
      ],
    };
  }
}
