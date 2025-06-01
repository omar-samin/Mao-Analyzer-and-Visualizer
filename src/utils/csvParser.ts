
import Papa from 'papaparse';
import { DataSet, ColumnInfo } from '@/types/data';

export const parseCSVData = async (file: File): Promise<DataSet> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string) => {
        // Try to parse as number
        const num = parseFloat(value);
        if (!isNaN(num) && value.trim() !== '') {
          return num;
        }
        // Try to parse as date
        const date = new Date(value);
        if (!isNaN(date.getTime()) && value.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/)) {
          return date;
        }
        return value;
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error('Error parsing CSV'));
          return;
        }

        const rows = results.data as Record<string, any>[];
        const columnNames = Object.keys(rows[0] || {});
        
        const columns: ColumnInfo[] = columnNames.map(name => {
          const values = rows.map(row => row[name]).filter(val => val !== null && val !== undefined && val !== '');
          const uniqueValues = new Set(values).size;
          const nullCount = rows.length - values.length;
          const sampleValues = Array.from(new Set(values)).slice(0, 10);
          
          let type: ColumnInfo['type'] = 'text';
          
          // Determine column type
          const numericCount = values.filter(val => typeof val === 'number').length;
          const dateCount = values.filter(val => val instanceof Date).length;
          
          if (numericCount > values.length * 0.8) {
            type = 'numerical';
          } else if (dateCount > values.length * 0.8) {
            type = 'datetime';
          } else if (uniqueValues <= Math.min(10, values.length * 0.5)) {
            type = 'categorical';
          }
          
          return {
            name,
            type,
            uniqueValues,
            nullCount,
            sampleValues
          };
        });

        resolve({
          filename: file.name,
          rows,
          columns,
          uploadDate: new Date()
        });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const calculateStatistics = (data: number[]): any => {
  const sorted = [...data].sort((a, b) => a - b);
  const n = sorted.length;
  
  if (n === 0) return {};
  
  const sum = sorted.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const median = n % 2 === 0 ? (sorted[n/2 - 1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)];
  
  // Mode calculation
  const frequency: Record<number, number> = {};
  sorted.forEach(val => frequency[val] = (frequency[val] || 0) + 1);
  const mode = Object.keys(frequency).reduce((a, b) => frequency[Number(a)] > frequency[Number(b)] ? a : b);
  
  // Standard deviation
  const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const std = Math.sqrt(variance);
  
  // Quartiles
  const q25 = sorted[Math.floor(n * 0.25)];
  const q75 = sorted[Math.floor(n * 0.75)];
  
  return {
    count: n,
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    mode: Number(mode),
    min: sorted[0],
    max: sorted[n - 1],
    std: Number(std.toFixed(2)),
    q25,
    q75
  };
};
