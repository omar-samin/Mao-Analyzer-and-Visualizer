
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, BarChart, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';
import DataPreview from '@/components/DataPreview';
import StatisticsPanel from '@/components/StatisticsPanel';
import VisualizationPanel from '@/components/VisualizationPanel';
import InsightsPanel from '@/components/InsightsPanel';
import ExportPanel from '@/components/ExportPanel';
import { parseCSVData } from '@/utils/csvParser';
import { DataSet, ColumnInfo } from '@/types/data';

const Index = () => {
  const [dataset, setDataset] = useState<DataSet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const parsedData = await parseCSVData(file);
      setDataset(parsedData);
      toast({
        title: "File uploaded successfully!",
        description: `Analyzed ${parsedData.rows.length} rows and ${parsedData.columns.length} columns.`,
      });
    } catch (error) {
      toast({
        title: "Error uploading file",
        description: "Please ensure you've uploaded a valid CSV file.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Mao CSV Data Analyzer & Visualizer
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Upload any CSV file to automatically generate comprehensive data analysis, 
            visualizations, and AI-powered insights. Perfect for exploring and understanding your data.
          </p>
        </div>

        {/* File Upload Section */}
        {!dataset && (
          <Card className="mb-8 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Upload className="w-6 h-6" />
                Upload Your CSV File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
            </CardContent>
          </Card>
        )}

        {/* Analysis Dashboard */}
        {dataset && (
          <div className="space-y-6">
            {/* Dataset Overview */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Dataset Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{dataset.rows.length}</div>
                    <div className="text-sm text-gray-600">Total Rows</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{dataset.columns.length}</div>
                    <div className="text-sm text-gray-600">Total Columns</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {dataset.columns.filter(col => col.type === 'numerical').length}
                    </div>
                    <div className="text-sm text-gray-600">Numerical Columns</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {dataset.columns.filter(col => col.type === 'categorical').length}
                    </div>
                    <div className="text-sm text-gray-600">Categorical Columns</div>
                  </div>
                </div>
                <Button 
                  onClick={() => setDataset(null)} 
                  variant="outline" 
                  className="mb-4"
                >
                  Upload New File
                </Button>
              </CardContent>
            </Card>

            {/* Main Analysis Tabs */}
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="preview">Data Preview</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
                <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview">
                <DataPreview dataset={dataset} />
              </TabsContent>
              
              <TabsContent value="statistics">
                <StatisticsPanel dataset={dataset} />
              </TabsContent>
              
              <TabsContent value="visualizations">
                <VisualizationPanel dataset={dataset} />
              </TabsContent>
              
              <TabsContent value="insights">
                <InsightsPanel dataset={dataset} />
              </TabsContent>
              
              <TabsContent value="export">
                <ExportPanel dataset={dataset} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
