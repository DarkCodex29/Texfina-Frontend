import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface ConfiguracionCargaMasiva<T> {
  tipoEntidad: string; // "materiales", "proveedores", etc.
  mapeoColumnas: MapeoColumna[]; // Mapeo de columnas del archivo a campos del objeto
  validaciones?: ValidacionCampo[];
  transformaciones?: TransformacionCampo[];
  permitirActualizacion?: boolean; // Si permite actualizar registros existentes
}

export interface MapeoColumna {
  columnaArchivo: string; // Nombre de la columna en el archivo
  campoEntidad: string; // Nombre del campo en la entidad
  obligatorio: boolean; // Si el campo es requerido
  tipoEsperado: 'texto' | 'numero' | 'fecha' | 'booleano';
}

export interface ValidacionCampo {
  campo: string;
  validador: (valor: any) => boolean;
  mensajeError: string;
}

export interface TransformacionCampo {
  campo: string;
  transformar: (valor: any) => any;
}

export interface ResultadoCargaMasiva<T> {
  exitosa: boolean;
  registrosProcesados: number;
  registrosValidos: number;
  registrosInvalidos: number;
  entidadesValidas: T[];
  errores: ErrorCargaMasiva[];
  advertencias: string[];
}

export interface ErrorCargaMasiva {
  fila: number;
  campo?: string;
  mensaje: string;
  valor?: any;
}

@Injectable({
  providedIn: 'root',
})
export class CargaMasivaService {
  constructor() {}

  /**
   * Procesa archivo Excel/CSV para carga masiva
   */
  procesarArchivo<T>(
    archivo: File,
    configuracion: ConfiguracionCargaMasiva<T>
  ): Promise<ResultadoCargaMasiva<T>> {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();

        reader.onload = (evento) => {
          try {
            const datos = evento.target?.result;
            const workbook = XLSX.read(datos, { type: 'binary' });

            // Obtener la primera hoja
            const nombreHoja = workbook.SheetNames[0];
            const hoja = workbook.Sheets[nombreHoja];

            // Convertir a JSON
            const datosArchivo = XLSX.utils.sheet_to_json(hoja, {
              header: 1,
            }) as any[][];

            const resultado = this.procesarDatos(datosArchivo, configuracion);
            resolve(resultado);
          } catch (error) {
            reject(new Error('Error al procesar el archivo: ' + error));
          }
        };

        reader.onerror = () => {
          reject(new Error('Error al leer el archivo'));
        };

        reader.readAsBinaryString(archivo);
      } catch (error) {
        reject(new Error('Error al cargar el archivo: ' + error));
      }
    });
  }

  /**
   * Genera plantilla Excel para carga masiva
   */
  generarPlantilla<T>(configuracion: ConfiguracionCargaMasiva<T>): void {
    try {
      // Crear workbook
      const workbook = XLSX.utils.book_new();

      // Crear hoja de datos con headers
      const headers = configuracion.mapeoColumnas.map(
        (mapeo) => mapeo.columnaArchivo
      );
      const hojaData = XLSX.utils.aoa_to_sheet([headers]);

      // Agregar fila de ejemplo
      const filaEjemplo = configuracion.mapeoColumnas.map((mapeo) =>
        this.generarEjemploParaCampo(mapeo)
      );
      XLSX.utils.sheet_add_aoa(hojaData, [filaEjemplo], { origin: 'A2' });

      // Configurar anchos de columnas
      const anchosColumnas = headers.map(() => ({ width: 20 }));
      hojaData['!cols'] = anchosColumnas;

      XLSX.utils.book_append_sheet(workbook, hojaData, 'Datos');

      // Crear hoja de instrucciones
      const hojaInstrucciones = this.crearHojaInstrucciones(configuracion);
      XLSX.utils.book_append_sheet(
        workbook,
        hojaInstrucciones,
        'Instrucciones'
      );

      // Descargar archivo
      const nombreArchivo = `plantilla_${
        configuracion.tipoEntidad
      }_${this.formatearFecha(new Date())}.xlsx`;
      XLSX.writeFile(workbook, nombreArchivo);

      console.log(`✅ Plantilla generada: ${nombreArchivo}`);
    } catch (error) {
      console.error('❌ Error al generar plantilla:', error);
      throw new Error('Error al generar plantilla');
    }
  }

  /**
   * Procesa los datos del archivo
   */
  private procesarDatos<T>(
    datosArchivo: any[][],
    configuracion: ConfiguracionCargaMasiva<T>
  ): ResultadoCargaMasiva<T> {
    const resultado: ResultadoCargaMasiva<T> = {
      exitosa: false,
      registrosProcesados: 0,
      registrosValidos: 0,
      registrosInvalidos: 0,
      entidadesValidas: [],
      errores: [],
      advertencias: [],
    };

    // Validar que hay datos
    if (!datosArchivo || datosArchivo.length < 2) {
      resultado.errores.push({
        fila: 0,
        mensaje: 'El archivo está vacío o no tiene datos válidos',
      });
      return resultado;
    }

    const headers = datosArchivo[0];
    const filasDatos = datosArchivo.slice(1);

    // Validar headers
    const erroresHeaders = this.validarHeaders(headers, configuracion);
    if (erroresHeaders.length > 0) {
      resultado.errores.push(...erroresHeaders);
      return resultado;
    }

    // Crear mapeo de índices
    const mapeoIndices = this.crearMapeoIndices(headers, configuracion);

    // Procesar cada fila
    filasDatos.forEach((fila, indice) => {
      const numeroFila = indice + 2; // +2 porque empezamos en fila 2 (1 es header)
      resultado.registrosProcesados++;

      try {
        // Convertir fila a entidad
        const entidad = this.convertirFilaAEntidad<T>(
          fila,
          mapeoIndices,
          configuracion
        );

        // Validar entidad
        const erroresValidacion = this.validarEntidad(
          entidad,
          configuracion,
          numeroFila
        );

        if (erroresValidacion.length === 0) {
          resultado.entidadesValidas.push(entidad);
          resultado.registrosValidos++;
        } else {
          resultado.errores.push(...erroresValidacion);
          resultado.registrosInvalidos++;
        }
      } catch (error) {
        resultado.errores.push({
          fila: numeroFila,
          mensaje: `Error al procesar fila: ${error}`,
        });
        resultado.registrosInvalidos++;
      }
    });

    resultado.exitosa = resultado.registrosValidos > 0;

    return resultado;
  }

  /**
   * Valida los headers del archivo
   */
  private validarHeaders<T>(
    headers: any[],
    configuracion: ConfiguracionCargaMasiva<T>
  ): ErrorCargaMasiva[] {
    const errores: ErrorCargaMasiva[] = [];

    // Verificar que existan todos los campos obligatorios
    const camposObligatorios = configuracion.mapeoColumnas
      .filter((mapeo) => mapeo.obligatorio)
      .map((mapeo) => mapeo.columnaArchivo);

    camposObligatorios.forEach((campo) => {
      if (!headers.includes(campo)) {
        errores.push({
          fila: 1,
          campo: campo,
          mensaje: `Columna obligatoria '${campo}' no encontrada en el archivo`,
        });
      }
    });

    return errores;
  }

  /**
   * Crea mapeo de índices de columnas
   */
  private crearMapeoIndices<T>(
    headers: any[],
    configuracion: ConfiguracionCargaMasiva<T>
  ): Map<string, number> {
    const mapeo = new Map<string, number>();

    configuracion.mapeoColumnas.forEach((mapeoCol) => {
      const indice = headers.indexOf(mapeoCol.columnaArchivo);
      if (indice !== -1) {
        mapeo.set(mapeoCol.campoEntidad, indice);
      }
    });

    return mapeo;
  }

  /**
   * Convierte una fila del archivo a entidad
   */
  private convertirFilaAEntidad<T>(
    fila: any[],
    mapeoIndices: Map<string, number>,
    configuracion: ConfiguracionCargaMasiva<T>
  ): T {
    const entidad: any = {};

    configuracion.mapeoColumnas.forEach((mapeoCol) => {
      const indice = mapeoIndices.get(mapeoCol.campoEntidad);

      if (indice !== undefined && indice < fila.length) {
        let valor = fila[indice];

        // Aplicar transformaciones si existen
        if (configuracion.transformaciones) {
          const transformacion = configuracion.transformaciones.find(
            (t) => t.campo === mapeoCol.campoEntidad
          );

          if (transformacion) {
            valor = transformacion.transformar(valor);
          }
        }

        // Convertir tipo de dato
        valor = this.convertirTipoDato(valor, mapeoCol.tipoEsperado);

        // Asignar al objeto usando notación de punto
        this.asignarValorCampo(entidad, mapeoCol.campoEntidad, valor);
      }
    });

    return entidad as T;
  }

  /**
   * Valida una entidad convertida
   */
  private validarEntidad<T>(
    entidad: T,
    configuracion: ConfiguracionCargaMasiva<T>,
    numeroFila: number
  ): ErrorCargaMasiva[] {
    const errores: ErrorCargaMasiva[] = [];

    // Validar campos obligatorios
    configuracion.mapeoColumnas
      .filter((mapeo) => mapeo.obligatorio)
      .forEach((mapeo) => {
        const valor = this.obtenerValorCampo(entidad, mapeo.campoEntidad);

        if (valor === null || valor === undefined || valor === '') {
          errores.push({
            fila: numeroFila,
            campo: mapeo.campoEntidad,
            mensaje: `Campo obligatorio '${mapeo.columnaArchivo}' está vacío`,
            valor: valor,
          });
        }
      });

    // Aplicar validaciones customizadas
    if (configuracion.validaciones) {
      configuracion.validaciones.forEach((validacion) => {
        const valor = this.obtenerValorCampo(entidad, validacion.campo);

        if (!validacion.validador(valor)) {
          errores.push({
            fila: numeroFila,
            campo: validacion.campo,
            mensaje: validacion.mensajeError,
            valor: valor,
          });
        }
      });
    }

    return errores;
  }

  /**
   * Convierte valor según el tipo esperado
   */
  private convertirTipoDato(
    valor: any,
    tipo: 'texto' | 'numero' | 'fecha' | 'booleano'
  ): any {
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }

    switch (tipo) {
      case 'numero':
        const numero = parseFloat(valor);
        return isNaN(numero) ? null : numero;

      case 'fecha':
        try {
          return new Date(valor);
        } catch {
          return null;
        }

      case 'booleano':
        if (typeof valor === 'boolean') return valor;
        const texto = valor.toString().toLowerCase();
        return ['true', '1', 'sí', 'si', 'yes', 'verdadero'].includes(texto);

      default:
        return valor.toString().trim();
    }
  }

  /**
   * Asigna valor a un campo usando notación de punto
   */
  private asignarValorCampo(objeto: any, campo: string, valor: any): void {
    const partes = campo.split('.');
    let actual = objeto;

    for (let i = 0; i < partes.length - 1; i++) {
      if (!actual[partes[i]]) {
        actual[partes[i]] = {};
      }
      actual = actual[partes[i]];
    }

    actual[partes[partes.length - 1]] = valor;
  }

  /**
   * Obtiene valor de un campo usando notación de punto
   */
  private obtenerValorCampo<T>(objeto: T, campo: string): any {
    return campo
      .split('.')
      .reduce((valor, propiedad) => (valor as any)?.[propiedad], objeto);
  }

  /**
   * Genera ejemplo para un campo según su tipo
   */
  private generarEjemploParaCampo(mapeo: MapeoColumna): string {
    switch (mapeo.tipoEsperado) {
      case 'numero':
        return '123.45';
      case 'fecha':
        return '2024-01-15';
      case 'booleano':
        return 'Verdadero';
      default:
        return `Ejemplo ${mapeo.columnaArchivo}`;
    }
  }

  /**
   * Crea hoja de instrucciones para la plantilla
   */
  private crearHojaInstrucciones<T>(
    configuracion: ConfiguracionCargaMasiva<T>
  ): XLSX.WorkSheet {
    const instrucciones = [
      ['INSTRUCCIONES PARA CARGA MASIVA'],
      [''],
      ['1. Complete los datos en la hoja "Datos"'],
      ['2. Respete los nombres exactos de las columnas'],
      ['3. No modifique la estructura del archivo'],
      ['4. Campos obligatorios están marcados con *'],
      [''],
      ['DESCRIPCIÓN DE CAMPOS:'],
      [''],
    ];

    // Agregar descripción de cada campo
    configuracion.mapeoColumnas.forEach((mapeo) => {
      const obligatorio = mapeo.obligatorio ? ' *' : '';
      const tipo = ` (${mapeo.tipoEsperado})`;
      instrucciones.push([`${mapeo.columnaArchivo}${obligatorio}${tipo}`]);
    });

    instrucciones.push(['']);
    instrucciones.push(['TIPOS DE DATOS:']);
    instrucciones.push(['- texto: Cualquier texto']);
    instrucciones.push([
      '- numero: Números decimales (use punto como separador)',
    ]);
    instrucciones.push(['- fecha: Formato YYYY-MM-DD']);
    instrucciones.push(['- booleano: Verdadero/Falso, Sí/No, 1/0']);

    return XLSX.utils.aoa_to_sheet(instrucciones);
  }

  /**
   * Formatea fecha para nombres de archivo
   */
  private formatearFecha(fecha: Date): string {
    return fecha.toISOString().split('T')[0].replace(/-/g, '');
  }
}
