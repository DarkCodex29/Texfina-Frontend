import { ConfiguracionConfirmacion } from '../dialogs/confirmacion-dialog/confirmacion-dialog.component';

export class ConfirmacionConfig {
  static eliminar(
    entidad: string,
    nombre: string,
    entidadArticulo: string = 'la'
  ): ConfiguracionConfirmacion {
    return {
      titulo: `Eliminar ${entidad}`,
      subtitulo: `Esta acción no se puede deshacer`,
      mensaje: `¿Está seguro que desea eliminar ${entidadArticulo} ${entidad.toLowerCase()} "${nombre}"?`,
      mensajeSecundario:
        'Todos los datos relacionados también se eliminarán permanentemente.',
      tipo: 'danger',
      textoBotonConfirmar: 'Sí, eliminar',
      textoBotonCancelar: 'Cancelar',
    };
  }

  static eliminarClase(clase: any): ConfiguracionConfirmacion {
    const nombre = clase.familia || clase.id_clase || 'Sin nombre';
    return this.eliminar('Clase', nombre, 'la');
  }

  static eliminarUnidad(unidad: any): ConfiguracionConfirmacion {
    const nombre = unidad.nombre || unidad.id_unidad || 'Sin nombre';
    return this.eliminar('Unidad', nombre, 'la');
  }

  static eliminarAlmacen(almacen: any): ConfiguracionConfirmacion {
    const nombre = almacen.nombre || `ID ${almacen.id_almacen}` || 'Sin nombre';
    return this.eliminar('Almacén', nombre, 'el');
  }

  static eliminarUsuario(usuario: any): ConfiguracionConfirmacion {
    const nombre = usuario.username || usuario.email || 'Sin nombre';
    return this.eliminar('Usuario', nombre, 'el');
  }

  static eliminarProveedor(proveedor: any): ConfiguracionConfirmacion {
    const nombre = proveedor.empresa || proveedor.contacto || 'Sin nombre';
    return this.eliminar('Proveedor', nombre, 'el');
  }

  static eliminarLote(lote: any): ConfiguracionConfirmacion {
    const nombre = lote.lote || `ID ${lote.id_lote}` || 'Sin nombre';
    return this.eliminar('Lote', nombre, 'el');
  }

  static eliminarReceta(receta: any): ConfiguracionConfirmacion {
    const nombre = receta.nombre || `ID ${receta.id_receta}` || 'Sin nombre';
    return this.eliminar('Receta', nombre, 'la');
  }

  static advertencia(
    titulo: string,
    mensaje: string,
    mensajeSecundario?: string
  ): ConfiguracionConfirmacion {
    return {
      titulo: titulo,
      subtitulo: 'Confirme esta acción',
      mensaje: mensaje,
      mensajeSecundario: mensajeSecundario,
      tipo: 'warning',
      textoBotonConfirmar: 'Continuar',
      textoBotonCancelar: 'Cancelar',
    };
  }

  static informacion(
    titulo: string,
    mensaje: string,
    mensajeSecundario?: string
  ): ConfiguracionConfirmacion {
    return {
      titulo: titulo,
      subtitulo: 'Información importante',
      mensaje: mensaje,
      mensajeSecundario: mensajeSecundario,
      tipo: 'info',
      textoBotonConfirmar: 'Entendido',
      textoBotonCancelar: 'Cerrar',
    };
  }
}
