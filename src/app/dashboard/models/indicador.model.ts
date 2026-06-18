export interface DataPoint {
  pais: string;
  anio: number;
  valor: number | null;
}

export interface Indicador {
  id: string;
  nombre: string;
  datos: DataPoint[];
}

export interface DashboardStorage {
  fileName: string;
  uploadedAt: string;
  indicadores: Indicador[];
}
