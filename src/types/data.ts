
export interface ColumnInfo {
  name: string;
  type: 'numerical' | 'categorical' | 'datetime' | 'text';
  uniqueValues: number;
  nullCount: number;
  sampleValues: any[];
}

export interface DataSet {
  filename: string;
  rows: Record<string, any>[];
  columns: ColumnInfo[];
  uploadDate: Date;
}

export interface StatisticalSummary {
  column: string;
  count: number;
  mean?: number;
  median?: number;
  mode?: any;
  min?: number;
  max?: number;
  std?: number;
  q25?: number;
  q75?: number;
}

export interface ChartConfig {
  type: 'histogram' | 'bar' | 'line' | 'scatter' | 'pie' | 'box' | 'heatmap';
  title: string;
  data: any[];
  xAxis?: string;
  yAxis?: string;
  colorBy?: string;
}
