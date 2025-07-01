export interface Consumo {
  id_consumo?: number;
  fecha?: Date;
  id_insumo?: number;
  area?: string;
  cantidad?: number;
  id_lote?: number;
  estado?: string;
  responsable?: string;
  observaciones?: string;
  created_at?: Date;
  updated_at?: Date;
}
