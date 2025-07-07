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

  static getTableColumns(): TableColumn[] {
    return [
      {
        key: 'id_unidad',
        title: 'Código',
        sortable: true,
        filterable: true,
        width: '150px',
        type: 'badge',
        align: 'center',
        visible: true,
      },
      {
        key: 'nombre',
        title: 'Descripción',
        sortable: true,
        filterable: true,
        type: 'text',
        align: 'left',
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
