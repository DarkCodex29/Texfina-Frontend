export interface Consumo {
  id_consumo?: number;
  fecha?: Date;
  id_insumo?: number;
  cantidad?: number;
  id_unidad?: string;
  id_lote?: number;
  area?: string;
  area_consumo?: string;
  motivo_consumo?: string;
  responsable?: string;
  usuario_registro?: string;
  observaciones?: string;
  estado?: string;
  created_at?: Date;
  updated_at?: Date;
}
