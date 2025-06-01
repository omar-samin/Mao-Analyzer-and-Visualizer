
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataSet } from '@/types/data';
import { calculateStatistics } from '@/utils/csvParser';
import { BarChart } from 'lucide-react';

interface StatisticsPanelProps {
  dataset: DataSet;
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ dataset }) => {
  const numericalColumns = dataset.columns.filter(col => col.type === 'numerical');
  
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Statistical Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {numericalColumns.length === 0 ? (
            <p className="text-gray-600">No numerical columns found in the dataset.</p>
          ) : (
            <div className="space-y-6">
              {numericalColumns.map(column => {
                const values = dataset.rows
                  .map(row => row[column.name])
                  .filter(val => typeof val === 'number' && !isNaN(val));
                const stats = calculateStatistics(values);
                
                return (
                  <div key={column.name} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">{column.name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="text-sm text-gray-600">Count</div>
                        <div className="text-xl font-bold text-blue-600">{stats.count}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-sm text-gray-600">Mean</div>
                        <div className="text-xl font-bold text-green-600">{stats.mean}</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="text-sm text-gray-600">Median</div>
                        <div className="text-xl font-bold text-purple-600">{stats.median}</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <div className="text-sm text-gray-600">Std Dev</div>
                        <div className="text-xl font-bold text-orange-600">{stats.std}</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded">
                        <div className="text-sm text-gray-600">Min</div>
                        <div className="text-xl font-bold text-red-600">{stats.min}</div>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded">
                        <div className="text-sm text-gray-600">Max</div>
                        <div className="text-xl font-bold text-indigo-600">{stats.max}</div>
                      </div>
                      <div className="bg-pink-50 p-3 rounded">
                        <div className="text-sm text-gray-600">Mode</div>
                        <div className="text-xl font-bold text-pink-600">{stats.mode}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categorical Statistics */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Categorical Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {dataset.columns.filter(col => col.type === 'categorical').map(column => (
            <div key={column.name} className="mb-6 last:mb-0">
              <h3 className="text-lg font-semibold mb-3">{column.name}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Unique Values</div>
                  <div className="text-xl font-bold">{column.uniqueValues}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Null Count</div>
                  <div className="text-xl font-bold">{column.nullCount}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Sample Values</div>
                  <div className="text-sm">{column.sampleValues.slice(0, 3).join(', ')}</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsPanel;
