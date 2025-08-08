import { Insumo } from '../models/insumo.model';

export const INSUMOS_MOCK_DATA: Partial<Insumo>[] = [
  // Primeros 50 productos químicos de Texfina
  { 
    id_insumo: 1, 
    codigo_insumo: 'CC-0000001', 
    id_fox: '0003686', 
    nombre: 'BASICO AMARILLO X-8GL 250%', 
    id_clase: 'CC', 
    familia: 'COLORANTE', 
    subfamilia: 'CATIONICO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 2, 
    codigo_insumo: 'CA-000002', 
    id_fox: '0003622', 
    nombre: 'BEMACID AMARILLO E-TL', 
    id_clase: 'CA', 
    familia: 'COLORANTE', 
    subfamilia: 'ACIDO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 3, 
    codigo_insumo: 'CA-0000003', 
    id_fox: '0003506', 
    nombre: 'BEMACID AMARILLO F-G', 
    id_clase: 'CA', 
    familia: 'COLORANTE', 
    subfamilia: 'ACIDO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 4, 
    codigo_insumo: 'CA-0000004', 
    id_fox: '0003532', 
    nombre: 'BEMACID AMARILLO FT', 
    id_clase: 'CA', 
    familia: 'COLORANTE', 
    subfamilia: 'ACIDO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 5, 
    codigo_insumo: 'CA-0000005', 
    id_fox: '0003624', 
    nombre: 'BEMACID AZUL E-TL', 
    id_clase: 'CA', 
    familia: 'COLORANTE', 
    subfamilia: 'ACIDO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 6, 
    codigo_insumo: 'CA-0000006', 
    id_fox: '0003550', 
    nombre: 'BEMACID AZUL F-2R', 
    id_clase: 'CA', 
    familia: 'COLORANTE', 
    subfamilia: 'ACIDO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 7, 
    codigo_insumo: 'CA-0000007', 
    id_fox: '0003526', 
    nombre: 'BEMACID AZUL FT', 
    id_clase: 'CA', 
    familia: 'COLORANTE', 
    subfamilia: 'ACIDO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 8, 
    codigo_insumo: 'CA-0000008', 
    id_fox: '0003623', 
    nombre: 'BEMACID ROJO E-TL', 
    id_clase: 'CA', 
    familia: 'COLORANTE', 
    subfamilia: 'ACIDO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 9, 
    codigo_insumo: 'CA-0000009', 
    id_fox: '0003549', 
    nombre: 'BEMACID ROJO F-4B', 
    id_clase: 'CA', 
    familia: 'COLORANTE', 
    subfamilia: 'ACIDO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 10, 
    codigo_insumo: 'CA-0000010', 
    id_fox: '0003531', 
    nombre: 'BEMACID ROJO FT', 
    id_clase: 'CA', 
    familia: 'COLORANTE', 
    subfamilia: 'ACIDO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 11, 
    codigo_insumo: 'CA-0000011', 
    id_fox: '0003548', 
    nombre: 'BEMACID TURQUEZA F-G', 
    id_clase: 'CA', 
    familia: 'COLORANTE', 
    subfamilia: 'ACIDO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 12, 
    codigo_insumo: 'CD-0000012', 
    id_fox: '0003641', 
    nombre: 'BEMACRON AZUL HP-LTD', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 13, 
    codigo_insumo: 'CD-0000013', 
    id_fox: '0002978', 
    nombre: 'BEMACRON AZUL OSCURO HP-LTD 01', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 14, 
    codigo_insumo: 'CD-0000014', 
    id_fox: '0001563', 
    nombre: 'BEMACRON AZUL S-BB', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 15, 
    codigo_insumo: 'CD-0000015', 
    id_fox: '0001937', 
    nombre: 'BEMACRON CYAN HP-G', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 16, 
    codigo_insumo: 'CD-0000016', 
    id_fox: '0003649', 
    nombre: 'BEMACRON MARINO HP-S', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 17, 
    codigo_insumo: 'CD-0000017', 
    id_fox: '0002979', 
    nombre: 'BEMACRON MARINO S-2GL', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 18, 
    codigo_insumo: 'CD-0000018', 
    id_fox: '0003615', 
    nombre: 'BEMACRON NEGRO HP-LTD', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 19, 
    codigo_insumo: 'CD-0000019', 
    id_fox: '0003659', 
    nombre: 'BEMACRON NEGRO HP-S', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 20, 
    codigo_insumo: 'CD-0000020', 
    id_fox: '0003648', 
    nombre: 'BEMACRON NOCHE NEGRA HP-S', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 21, 
    codigo_insumo: 'CD-0000021', 
    id_fox: '0001562', 
    nombre: 'BEMACRON PARDO AMARILLO S-2RFL', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 22, 
    codigo_insumo: 'CD-0000022', 
    id_fox: '0003669', 
    nombre: 'BEMACRON ROJO HP-FS', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 23, 
    codigo_insumo: 'CD-0000023', 
    id_fox: '0002974', 
    nombre: 'BEMACRON ROJO HP-LTD 01', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 24, 
    codigo_insumo: 'CD-0000024', 
    id_fox: '0003657', 
    nombre: 'BEMACRON ROJO SE-LF', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 25, 
    codigo_insumo: 'CD-0000025', 
    id_fox: '0002977', 
    nombre: 'BEMACRON RUBI HP-LTD 01', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 26, 
    codigo_insumo: 'CD-0000026', 
    id_fox: '0002382', 
    nombre: 'BEMACRON RUBI S-2GFL', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 27, 
    codigo_insumo: 'CD-0000027', 
    id_fox: '0003662', 
    nombre: 'BEMACRON TURQUESA HP-B', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 28, 
    codigo_insumo: 'CD-0000028', 
    id_fox: '0003663', 
    nombre: 'BEMACRON TURQUESA S-GF', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 29, 
    codigo_insumo: 'CD-0000029', 
    id_fox: '0003658', 
    nombre: 'BEMACRON YELLOW S-6GF', 
    id_clase: 'CD', 
    familia: 'COLORANTE', 
    subfamilia: 'DISPERSO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 30, 
    codigo_insumo: 'CA-0000030', 
    id_fox: '0003514', 
    nombre: 'BEMAPLEX AMARILLO MT', 
    id_clase: 'CA', 
    familia: 'COLORANTE', 
    subfamilia: 'ACIDO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 31, 
    codigo_insumo: 'CA-0000031', 
    id_fox: '0003513', 
    nombre: 'BEMAPLEX MARINO MT', 
    id_clase: 'CA', 
    familia: 'COLORANTE', 
    subfamilia: 'ACIDO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 32, 
    codigo_insumo: 'CA-0000032', 
    id_fox: '0003508', 
    nombre: 'BEMAPLEX NEGRO D-HF', 
    id_clase: 'CA', 
    familia: 'COLORANTE', 
    subfamilia: 'ACIDO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 33, 
    codigo_insumo: 'CA-0000033', 
    id_fox: '0003515', 
    nombre: 'BEMAPLEX ROJO MT', 
    id_clase: 'CA', 
    familia: 'COLORANTE', 
    subfamilia: 'ACIDO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 34, 
    codigo_insumo: 'CA-0000034', 
    id_fox: '0003507', 
    nombre: 'BEMAPLEX RUBI D-B', 
    id_clase: 'CA', 
    familia: 'COLORANTE', 
    subfamilia: 'ACIDO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 35, 
    codigo_insumo: 'CR-0000035', 
    id_fox: '0002402', 
    nombre: 'BEZAKTIV AMARILLO HP-NP', 
    id_clase: 'CR', 
    familia: 'COLORANTE', 
    subfamilia: 'REACTIVO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 36, 
    codigo_insumo: 'CR-0000036', 
    id_fox: '0002448', 
    nombre: 'BEZAKTIV AZUL S-RN', 
    id_clase: 'CR', 
    familia: 'COLORANTE', 
    subfamilia: 'REACTIVO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 37, 
    codigo_insumo: 'CR-0000037', 
    id_fox: '0002911', 
    nombre: 'BEZAKTIV ROJO HP-3B', 
    id_clase: 'CR', 
    familia: 'COLORANTE', 
    subfamilia: 'REACTIVO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 38, 
    codigo_insumo: 'CR-0000038', 
    id_fox: '0002149', 
    nombre: 'BEZAKTIV TURQUESA S-BF 150%', 
    id_clase: 'CR', 
    familia: 'COLORANTE', 
    subfamilia: 'REACTIVO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 39, 
    codigo_insumo: 'CR-0000039', 
    id_fox: '0001977', 
    nombre: 'BEZAKTIV VERDE V-6B', 
    id_clase: 'CR', 
    familia: 'COLORANTE', 
    subfamilia: 'REACTIVO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 40, 
    codigo_insumo: 'CC-0000040', 
    id_fox: '0002569', 
    nombre: 'CATIONIC BLACK X-O 300% (CH)', 
    id_clase: 'CC', 
    familia: 'COLORANTE', 
    subfamilia: 'CATIONICO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 41, 
    codigo_insumo: 'CC-0000041', 
    id_fox: '0002570', 
    nombre: 'CATIONIC BLUE X-GRRL 250%', 
    id_clase: 'CC', 
    familia: 'COLORANTE', 
    subfamilia: 'CATIONICO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 42, 
    codigo_insumo: 'CC-0000042', 
    id_fox: '0003614', 
    nombre: 'CATIONIC GOLDEN YELLOW TF-GL', 
    id_clase: 'CC', 
    familia: 'COLORANTE', 
    subfamilia: 'CATIONICO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 43, 
    codigo_insumo: 'CC-0000043', 
    id_fox: '0002736', 
    nombre: 'CATIONIC GOLDEN YELLOW X-GL 250%', 
    id_clase: 'CC', 
    familia: 'COLORANTE', 
    subfamilia: 'CATIONICO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 44, 
    codigo_insumo: 'CC-0000044', 
    id_fox: '0002571', 
    nombre: 'CATIONIC RED 3R 300%', 
    id_clase: 'CC', 
    familia: 'COLORANTE', 
    subfamilia: 'CATIONICO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 45, 
    codigo_insumo: 'CC-0000045', 
    id_fox: '0003457', 
    nombre: 'CATIONIC RED BTE X-5GN 250%', 
    id_clase: 'CC', 
    familia: 'COLORANTE', 
    subfamilia: 'CATIONICO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 46, 
    codigo_insumo: 'CC-0000046', 
    id_fox: '0002572', 
    nombre: 'CATIONIC RED GTL 200%', 
    id_clase: 'CC', 
    familia: 'COLORANTE', 
    subfamilia: 'CATIONICO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 47, 
    codigo_insumo: 'CC-0000047', 
    id_fox: '0003613', 
    nombre: 'CATIONIC RED TF-GRL', 
    id_clase: 'CC', 
    familia: 'COLORANTE', 
    subfamilia: 'CATIONICO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 48, 
    codigo_insumo: 'CC-0000048', 
    id_fox: '0003411', 
    nombre: 'CATIONIC RED X-5GN 250% (CH)', 
    id_clase: 'CC', 
    familia: 'COLORANTE', 
    subfamilia: 'CATIONICO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 49, 
    codigo_insumo: 'CC-0000049', 
    id_fox: '0002053', 
    nombre: 'CATIONIC ROJO 3R 300%', 
    id_clase: 'CC', 
    familia: 'COLORANTE', 
    subfamilia: 'CATIONICO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  },
  { 
    id_insumo: 50, 
    codigo_insumo: 'CC-0000050', 
    id_fox: '0003301', 
    nombre: 'CATIONIC TURQUOISE BLUE GB 250%', 
    id_clase: 'CC', 
    familia: 'COLORANTE', 
    subfamilia: 'CATIONICO', 
    id_unidad: 'KG', 
    presentacion: 'CAJA', 
    created_at: new Date('2024-01-01'), 
    updated_at: new Date('2024-01-01') 
  }
];

// Función helper para obtener el último precio unitario del último lote
export function obtenerUltimoPrecioUnitario(id_insumo: number, lotes: any[]): number | undefined {
  const lotesDelInsumo = lotes
    .filter(l => l.id_insumo === id_insumo)
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  
  if (lotesDelInsumo.length > 0) {
    return lotesDelInsumo[0].precio_unitario;
  }
  
  return undefined;
}

// Función para generar descripción completa de clase
export function generarDescripcionClase(familia: string, subfamilia: string): string {
  return `${familia} ${subfamilia}`;
}

// Función para obtener el nombre de la clase según el código
export function obtenerNombreClase(idClase: string): string {
  const clases: { [key: string]: string } = {
    'CA': 'COLORANTE ÁCIDO',
    'CC': 'COLORANTE CATIÓNICO',
    'CD': 'COLORANTE DISPERSO',
    'CR': 'COLORANTE REACTIVO',
    'CO': 'COLORANTE ÓPTICO',
    'CI': 'COLORANTE DIRECTO'
  };
  return clases[idClase] || idClase;
}

// Resumen de datos cargados
export const RESUMEN_INSUMOS = {
  total: INSUMOS_MOCK_DATA.length,
  porTipo: {
    CATIONICO: INSUMOS_MOCK_DATA.filter(i => i.subfamilia === 'CATIONICO').length,
    ACIDO: INSUMOS_MOCK_DATA.filter(i => i.subfamilia === 'ACIDO').length,
    DISPERSO: INSUMOS_MOCK_DATA.filter(i => i.subfamilia === 'DISPERSO').length,
    REACTIVO: INSUMOS_MOCK_DATA.filter(i => i.subfamilia === 'REACTIVO').length,
    OPTICO: INSUMOS_MOCK_DATA.filter(i => i.subfamilia === 'OPTICO').length,
    DIRECTO: INSUMOS_MOCK_DATA.filter(i => i.subfamilia === 'DIRECTO').length
  },
  porClase: {
    CA: INSUMOS_MOCK_DATA.filter(i => i.id_clase === 'CA').length,
    CC: INSUMOS_MOCK_DATA.filter(i => i.id_clase === 'CC').length,
    CD: INSUMOS_MOCK_DATA.filter(i => i.id_clase === 'CD').length,
    CR: INSUMOS_MOCK_DATA.filter(i => i.id_clase === 'CR').length,
    CO: INSUMOS_MOCK_DATA.filter(i => i.id_clase === 'CO').length,
    CI: INSUMOS_MOCK_DATA.filter(i => i.id_clase === 'CI').length
  }
};