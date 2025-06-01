
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataSet } from '@/types/data';
import { Eye } from 'lucide-react';

interface DataPreviewProps {
  dataset: DataSet;
}

const DataPreview: React.FC<DataPreviewProps> = ({ dataset }) => {
  const previewRows = dataset.rows.slice(0, 10);
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'numerical': return 'bg-blue-100 text-blue-800';
      case 'categorical': return 'bg-green-100 text-green-800';
      case 'datetime': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Data Preview (First 10 Rows)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Column Types */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Column Types</h3>
          <div className="flex flex-wrap gap-2">
            {dataset.columns.map(column => (
              <div key={column.name} className="flex items-center gap-2">
                <span className="font-medium">{column.name}</span>
                <Badge className={getTypeColor(column.type)}>
                  {column.type}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                {dataset.columns.map(column => (
                  <th key={column.name} className="border border-gray-200 p-3 text-left font-semibold">
                    {column.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {dataset.columns.map(column => (
                    <td key={column.name} className="border border-gray-200 p-3">
                      {row[column.name]?.toString() || 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {dataset.rows.length > 10 && (
          <p className="text-sm text-gray-600 mt-4">
            Showing 10 of {dataset.rows.length} total rows
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DataPreview;
