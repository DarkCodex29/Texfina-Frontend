import {
  CampoFormulario,
  ConfiguracionFormulario,
} from '../dialogs/formulario-dialog/formulario-dialog.component';
import {
  CampoDetalle,
  ConfiguracionDetalle,
} from '../dialogs/detalle-dialog/detalle-dialog.component';
import {
  TableColumn,
  TableAction,
} from '../components/prime-data-table/prime-data-table.component';

export interface Receta {
  id_receta?: number;
  nombre: string;
  descripcion?: string;
  detalles?: RecetaDetalle[];
  created_at?: Date;
  updated_at?: Date;
}

export interface RecetaDetalle {
  id?: number;
  id_receta?: number;
  id_insumo?: number;
  proporcion?: number;
  orden?: number;
  tipo_medida?: string;
  insumo?: {
    id_insumo?: number;
    nombre?: string;
  };
}

export class RecetasConfig {
  static getConfiguracionFormulario(
    esEdicion: boolean,
    datosIniciales?: any
  ): ConfiguracionFormulario {
    return {
      titulo: {
        agregar: 'Registrar Receta',
        editar: 'Editar Receta',
      },
      entidad: 'Receta',
      entidadArticulo: 'una receta',
      esEdicion: esEdicion,
      datosIniciales: datosIniciales,
      filas: [
        [
          {
            key: 'nombre',
            label: 'Nombre de la Receta',
            tipo: 'text',
            placeholder: 'Ej: Mezcla Base Texfina',
            maxLength: 200,
            obligatorio: true,
          },
        ],
        [
          {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            placeholder: 'Descripción opcional de la receta...',
            maxLength: 500,
            obligatorio: false,
          },
        ],
      ],
    };
  }

  static getConfiguracionDetalle(datos: any): ConfiguracionDetalle {
    return {
      entidad: 'Receta',
      entidadArticulo: 'de la receta',
      datos: datos,
      filas: [
        [
          {
            key: 'id_receta',
            label: 'Código',
            tipo: 'text',
            ancho: 'normal',
          },
          {
            key: 'nombre',
            label: 'Nombre',
            tipo: 'text',
            ancho: 'normal',
          },
        ],
        [
          {
            key: 'descripcion',
            label: 'Descripción',
            tipo: 'textarea',
            ancho: 'completo',
          },
        ],
      ],
    };
  }

  static getTableColumns(): TableColumn[] {
    return [
      {
        key: 'id_receta',
        title: 'Código',
        sortable: true,
        filterable: true,
        width: '120px',
        type: 'badge',
        align: 'center',
        visible: true,
      },
      {
        key: 'nombre',
        title: 'Nombre',
        sortable: true,
        filterable: true,
        type: 'description',
        align: 'left',
        visible: true,
      },
      {
        key: 'ingredientes',
        title: 'Ingredientes',
        sortable: false,
        filterable: false,
        width: '130px',
        type: 'number',
        align: 'center',
        visible: true,
      },
      {
        key: 'estado',
        title: 'Estado',
        sortable: false,
        filterable: true,
        width: '120px',
        type: 'badge',
        align: 'center',
        visible: true,
      },
    ];
  }

  static getTableActions(): TableAction[] {
    return [
      {
        icon: 'pi pi-eye',
        tooltip: 'Ver detalle',
        action: 'view',
        color: 'secondary',
      },
      {
        icon: 'pi pi-pencil',
        tooltip: 'Editar',
        action: 'edit',
        color: 'primary',
      },
    ];
  }
}

export const RECETAS_CONFIG = {
  API_ENDPOINTS: {
    BASE: '/api/recetas',
    GET_ALL: '/api/recetas',
    GET_BY_ID: '/api/recetas/:id',
    CREATE: '/api/recetas',
    UPDATE: '/api/recetas/:id',
    DELETE: '/api/recetas/:id',
    SEARCH: '/api/recetas/search'
  },
  VALIDACIONES: {
    NOMBRE_MIN_LENGTH: 2,
    NOMBRE_MAX_LENGTH: 200,
    PROPORCION_MIN: 0.01,
    PROPORCION_MAX: 100000
  },
  MENSAJES: {
    CREAR_EXITOSO: 'Receta creada exitosamente',
    ACTUALIZAR_EXITOSO: 'Receta actualizada exitosamente',
    ELIMINAR_EXITOSO: 'Receta eliminada exitosamente',
    ERROR_GENERICO: 'Error al procesar la receta',
    NOMBRE_REQUERIDO: 'El nombre es obligatorio',
    NOMBRE_MUY_CORTO: 'El nombre debe tener al menos 2 caracteres',
    NOMBRE_MUY_LARGO: 'El nombre no puede tener más de 200 caracteres'
  },
  COLUMNAS_TABLA: [
    { campo: 'id_receta', titulo: 'Código', ancho: '100px' },
    { campo: 'nombre', titulo: 'Nombre', ancho: 'auto' },
    { campo: 'ingredientes', titulo: 'Ingredientes', ancho: '120px' },
    { campo: 'estado', titulo: 'Estado', ancho: '100px' },
    { campo: 'acciones', titulo: 'Acciones', ancho: '120px' }
  ]
};
