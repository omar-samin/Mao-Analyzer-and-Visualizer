
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DataSet } from '@/types/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { BarChart as BarChartIcon } from 'lucide-react';

interface VisualizationPanelProps {
  dataset: DataSet;
}

const VisualizationPanel: React.FC<VisualizationPanelProps> = ({ dataset }) => {
  const [selectedChart, setSelectedChart] = useState<string>('histogram');
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [selectedColumn2, setSelectedColumn2] = useState<string>('');

  const numericalColumns = dataset.columns.filter(col => col.type === 'numerical');
  const categoricalColumns = dataset.columns.filter(col => col.type === 'categorical');
  
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  // Generate histogram data
  const generateHistogramData = (columnName: string) => {
    const values = dataset.rows
      .map(row => row[columnName])
      .filter(val => typeof val === 'number' && !isNaN(val));
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.min(20, Math.ceil(Math.sqrt(values.length)));
    const binWidth = (max - min) / binCount;
    
    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`,
      count: 0,
      midpoint: min + (i + 0.5) * binWidth
    }));
    
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
      bins[binIndex].count++;
    });
    
    return bins;
  };

  // Generate bar chart data for categorical columns
  const generateBarChartData = (columnName: string) => {
    const counts: Record<string, number> = {};
    dataset.rows.forEach(row => {
      const value = row[columnName]?.toString() || 'N/A';
      counts[value] = (counts[value] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15); // Limit to top 15 categories
  };

  // Generate scatter plot data
  const generateScatterData = (xColumn: string, yColumn: string) => {
    return dataset.rows
      .filter(row => 
        typeof row[xColumn] === 'number' && 
        typeof row[yColumn] === 'number' && 
        !isNaN(row[xColumn]) && 
        !isNaN(row[yColumn])
      )
      .map(row => ({
        x: row[xColumn],
        y: row[yColumn]
      }));
  };

  const renderChart = () => {
    if (!selectedColumn) return null;

    switch (selectedChart) {
      case 'histogram':
        if (numericalColumns.find(col => col.name === selectedColumn)) {
          const data = generateHistogramData(selectedColumn);
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          );
        }
        break;

      case 'bar':
        if (categoricalColumns.find(col => col.name === selectedColumn)) {
          const data = generateBarChartData(selectedColumn);
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          );
        }
        break;

      case 'pie':
        if (categoricalColumns.find(col => col.name === selectedColumn)) {
          const data = generateBarChartData(selectedColumn).slice(0, 8);
          return (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          );
        }
        break;

      case 'scatter':
        if (selectedColumn2 && numericalColumns.find(col => col.name === selectedColumn) && numericalColumns.find(col => col.name === selectedColumn2)) {
          const data = generateScatterData(selectedColumn, selectedColumn2);
          return (
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" name={selectedColumn} />
                <YAxis dataKey="y" name={selectedColumn2} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Data Points" data={data} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          );
        }
        break;

      default:
        return <div className="text-center text-gray-500 py-8">Select a chart type and column to visualize</div>;
    }

    return <div className="text-center text-gray-500 py-8">Invalid column type for selected chart</div>;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChartIcon className="w-5 h-5" />
          Data Visualizations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Chart Type</label>
            <Select value={selectedChart} onValueChange={setSelectedChart}>
              <SelectTrigger>
                <SelectValue placeholder="Select chart type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="histogram">Histogram</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="scatter">Scatter Plot</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Primary Column</label>
            <Select value={selectedColumn} onValueChange={setSelectedColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {dataset.columns.map(column => (
                  <SelectItem key={column.name} value={column.name}>
                    {column.name} ({column.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedChart === 'scatter' && (
            <div>
              <label className="block text-sm font-medium mb-2">Secondary Column</label>
              <Select value={selectedColumn2} onValueChange={setSelectedColumn2}>
                <SelectTrigger>
                  <SelectValue placeholder="Select second column" />
                </SelectTrigger>
                <SelectContent>
                  {numericalColumns.map(column => (
                    <SelectItem key={column.name} value={column.name}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-end">
            <Button 
              onClick={() => {
                setSelectedColumn('');
                setSelectedColumn2('');
              }}
              variant="outline"
              className="w-full"
            >
              Clear Selection
            </Button>
          </div>
        </div>

        {/* Chart Display */}
        <div className="border rounded-lg p-4 bg-white">
          {renderChart()}
        </div>

        {/* Chart Description */}
        {selectedColumn && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Chart Information</h4>
            <p className="text-sm text-gray-700">
              {selectedChart === 'histogram' && `Distribution of ${selectedColumn} values across ${generateHistogramData(selectedColumn).length} bins.`}
              {selectedChart === 'bar' && `Frequency count of categories in ${selectedColumn}.`}
              {selectedChart === 'pie' && `Proportional distribution of categories in ${selectedColumn}.`}
              {selectedChart === 'scatter' && selectedColumn2 && `Relationship between ${selectedColumn} and ${selectedColumn2}.`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisualizationPanel;
