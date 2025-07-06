import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ConfiguracionExportacion<T> {
  entidades: T[];
  nombreArchivo: string;
  nombreEntidad: string; // "Materiales", "Proveedores", etc.
  columnas: ColumnaExportacion[];
  filtrosActivos?: any;
  metadatos?: MetadatosExportacion;
}

export interface ColumnaExportacion {
  campo: string; // Nombre del campo en el objeto
  titulo: string; // Título para la columna en la exportación
  ancho?: number; // Ancho para PDF (opcional)
  formato?: 'texto' | 'numero' | 'fecha' | 'moneda';
  transformar?: (valor: any) => string; // Función para transformar el valor
}

export interface MetadatosExportacion {
  cantidadTotal: number;
  cantidadFiltrada: number;
  fechaExportacion: Date;
  usuario?: string;
  empresa?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExportacionService {
  constructor() {}

  /**
   * Exporta datos a archivo Excel
   */
  exportarExcel<T>(config: ConfiguracionExportacion<T>): void {
    try {
      console.log(
        '📊 Iniciando exportación Excel con:',
        config.entidades.length,
        'registros'
      );

      const workbook = XLSX.utils.book_new();

      const datosParaExcel = this.prepararDatosParaExcel(config);
      console.log(
        '📋 Datos preparados para Excel:',
        datosParaExcel.length,
        'filas'
      );

      if (datosParaExcel.length === 0) {
        const hojaVacia = XLSX.utils.aoa_to_sheet([
          config.columnas.map((col) => col.titulo),
          ['No hay datos para exportar'],
        ]);
        XLSX.utils.book_append_sheet(workbook, hojaVacia, config.nombreEntidad);
      } else {
        const hojaPrincipal = XLSX.utils.json_to_sheet(datosParaExcel);
        const anchosColumnas = config.columnas.map(() => ({ width: 20 }));
        hojaPrincipal['!cols'] = anchosColumnas;
        XLSX.utils.book_append_sheet(
          workbook,
          hojaPrincipal,
          config.nombreEntidad
        );
      }

      if (config.metadatos) {
        const hojaMetadatos = this.crearHojaMetadatos(config);
        XLSX.utils.book_append_sheet(workbook, hojaMetadatos, 'Información');
      }

      const nombreArchivo = `${config.nombreArchivo}_${this.formatearFecha(
        new Date()
      )}.xlsx`;
      XLSX.writeFile(workbook, nombreArchivo);

      console.log(`✅ Archivo Excel exportado: ${nombreArchivo}`);
    } catch (error) {
      console.error('❌ Error al exportar Excel:', error);
      throw new Error('Error al generar archivo Excel');
    }
  }

  /**
   * Exporta datos a archivo PDF
   */
  exportarPDF<T>(config: ConfiguracionExportacion<T>): void {
    try {
      // Crear documento PDF
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape para más columnas

      // Configurar fuentes y colores Texfina
      doc.setFont('helvetica');

      // Título principal
      doc.setFontSize(18);
      doc.setTextColor(189, 33, 38); // Color primario Texfina
      doc.text(`Reporte de ${config.nombreEntidad}`, 20, 20);

      // Metadatos
      if (config.metadatos) {
        this.agregarMetadatosPDF(doc, config);
      }

      // Preparar datos para la tabla
      const headers = config.columnas.map((col) => col.titulo);
      const datos = config.entidades.map((entidad) =>
        config.columnas.map((col) => this.formatearValorParaPDF(entidad, col))
      );

      // Crear tabla
      autoTable(doc, {
        head: [headers],
        body: datos,
        startY: config.metadatos ? 60 : 35,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [18, 30, 102], // Color secundario Texfina
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // Background neutral Texfina
        },
        columnStyles: this.configurarEstilosColumnasPDF(config.columnas),
      });

      // Pie de página
      const totalPaginas = doc.getNumberOfPages();
      for (let i = 1; i <= totalPaginas; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(
          `Página ${i} de ${totalPaginas} - Generado el ${this.formatearFechaCompleta(
            new Date()
          )}`,
          20,
          doc.internal.pageSize.height - 10
        );
      }

      // Descargar archivo
      const nombreArchivo = `${config.nombreArchivo}_${this.formatearFecha(
        new Date()
      )}.pdf`;
      doc.save(nombreArchivo);

      console.log(`✅ Archivo PDF exportado: ${nombreArchivo}`);
    } catch (error) {
      console.error('❌ Error al exportar PDF:', error);
      throw new Error('Error al generar archivo PDF');
    }
  }

  /**
   * Prepara los datos para exportación Excel
   */
  private prepararDatosParaExcel<T>(
    config: ConfiguracionExportacion<T>
  ): any[] {
    return config.entidades.map((entidad) => {
      const fila: any = {};
      config.columnas.forEach((col) => {
        fila[col.titulo] = this.formatearValorParaExcel(entidad, col);
      });
      return fila;
    });
  }

  /**
   * Crea hoja de metadatos para Excel
   */
  private crearHojaMetadatos<T>(
    config: ConfiguracionExportacion<T>
  ): XLSX.WorkSheet {
    const metadatos = [
      { Campo: 'Entidad', Valor: config.nombreEntidad },
      {
        Campo: 'Total de registros',
        Valor: config.metadatos?.cantidadTotal || 0,
      },
      {
        Campo: 'Registros filtrados',
        Valor: config.metadatos?.cantidadFiltrada || 0,
      },
      {
        Campo: 'Fecha de exportación',
        Valor: this.formatearFechaCompleta(new Date()),
      },
      {
        Campo: 'Usuario',
        Valor: config.metadatos?.usuario || 'No especificado',
      },
      { Campo: 'Sistema', Valor: 'Texfina - Gestión de Inventarios' },
    ];

    if (config.filtrosActivos) {
      metadatos.push({
        Campo: 'Filtros aplicados',
        Valor: JSON.stringify(config.filtrosActivos),
      });
    }

    return XLSX.utils.json_to_sheet(metadatos);
  }

  /**
   * Agrega metadatos al PDF
   */
  private agregarMetadatosPDF<T>(
    doc: jsPDF,
    config: ConfiguracionExportacion<T>
  ): void {
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);

    let y = 30;
    const metadatos = [
      `Total de registros: ${config.metadatos?.cantidadTotal || 0}`,
      `Registros mostrados: ${config.metadatos?.cantidadFiltrada || 0}`,
      `Fecha: ${this.formatearFechaCompleta(new Date())}`,
    ];

    metadatos.forEach((texto) => {
      doc.text(texto, 20, y);
      y += 6;
    });
  }

  /**
   * Configura estilos de columnas para PDF
   */
  private configurarEstilosColumnasPDF(columnas: ColumnaExportacion[]): any {
    const estilos: any = {};

    columnas.forEach((col, index) => {
      estilos[index] = {};

      switch (col.formato) {
        case 'numero':
        case 'moneda':
          estilos[index].halign = 'right';
          break;
        case 'fecha':
          estilos[index].halign = 'center';
          break;
        default:
          estilos[index].halign = 'left';
      }

      if (col.ancho) {
        estilos[index].columnWidth = col.ancho;
      }
    });

    return estilos;
  }

  /**
   * Formatea valor para Excel
   */
  private formatearValorParaExcel<T>(
    entidad: T,
    columna: ColumnaExportacion
  ): any {
    const valor = this.obtenerValorCampo(entidad, columna.campo);

    if (valor === null || valor === undefined) {
      return '-';
    }

    // Si hay función de transformación, usarla
    if (columna.transformar) {
      return columna.transformar(valor);
    }

    switch (columna.formato) {
      case 'numero':
        return parseFloat(valor) || 0;
      case 'moneda':
        return parseFloat(valor) || 0;
      case 'fecha':
        return valor instanceof Date ? valor : new Date(valor);
      default:
        return valor.toString();
    }
  }

  /**
   * Formatea valor para PDF
   */
  private formatearValorParaPDF<T>(
    entidad: T,
    columna: ColumnaExportacion
  ): string {
    const valor = this.obtenerValorCampo(entidad, columna.campo);

    if (valor === null || valor === undefined) {
      return '-';
    }

    // Si hay función de transformación, usarla
    if (columna.transformar) {
      return columna.transformar(valor);
    }

    switch (columna.formato) {
      case 'numero':
        return parseFloat(valor).toLocaleString('es-ES');
      case 'moneda':
        return new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: 'PEN',
        }).format(parseFloat(valor));
      case 'fecha':
        return this.formatearFechaCompleta(new Date(valor));
      default:
        return valor.toString();
    }
  }

  /**
   * Obtiene valor de un campo anidado usando notación de punto
   */
  private obtenerValorCampo<T>(objeto: T, campo: string): any {
    return campo
      .split('.')
      .reduce((valor, propiedad) => (valor as any)?.[propiedad], objeto);
  }

  /**
   * Formatea fecha para nombres de archivo
   */
  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0].replace(/-/g, '');
  }

  /**
   * Formatea fecha completa para mostrar
   */
  private formatearFechaCompleta(fecha: Date): string {
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
