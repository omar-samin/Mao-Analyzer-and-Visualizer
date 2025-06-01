
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataSet } from '@/types/data';
import { calculateStatistics } from '@/utils/csvParser';
import { Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react';

interface InsightsPanelProps {
  dataset: DataSet;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ dataset }) => {
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    generateInsights();
  }, [dataset]);

  const generateInsights = () => {
    const generatedInsights = [];
    
    // Dataset overview insights
    generatedInsights.push({
      type: 'overview',
      icon: <Target className="w-5 h-5" />,
      title: 'Dataset Overview',
      content: `Your dataset contains ${dataset.rows.length} records with ${dataset.columns.length} features. The data includes ${dataset.columns.filter(c => c.type === 'numerical').length} numerical columns and ${dataset.columns.filter(c => c.type === 'categorical').length} categorical columns, providing a good mix for comprehensive analysis.`,
      severity: 'info'
    });

    // Numerical column insights
    dataset.columns.filter(col => col.type === 'numerical').forEach(column => {
      const values = dataset.rows
        .map(row => row[column.name])
        .filter(val => typeof val === 'number' && !isNaN(val));
      
      if (values.length > 0) {
        const stats = calculateStatistics(values);
        
        // Skewness insight
        const skewness = (3 * (stats.mean - stats.median)) / stats.std;
        let skewnessText = '';
        if (Math.abs(skewness) < 0.5) {
          skewnessText = 'approximately normal distribution';
        } else if (skewness > 0.5) {
          skewnessText = 'right-skewed distribution (tail extends to the right)';
        } else {
          skewnessText = 'left-skewed distribution (tail extends to the left)';
        }

        generatedInsights.push({
          type: 'distribution',
          icon: <TrendingUp className="w-5 h-5" />,
          title: `${column.name} Distribution`,
          content: `Column '${column.name}' shows a ${skewnessText}. The mean (${stats.mean}) ${stats.mean > stats.median ? 'exceeds' : 'is below'} the median (${stats.median}), with values ranging from ${stats.min} to ${stats.max}. Standard deviation is ${stats.std}.`,
          severity: 'info'
        });

        // Outlier detection
        const iqr = stats.q75 - stats.q25;
        const lowerBound = stats.q25 - 1.5 * iqr;
        const upperBound = stats.q75 + 1.5 * iqr;
        const outliers = values.filter(val => val < lowerBound || val > upperBound);
        
        if (outliers.length > 0) {
          generatedInsights.push({
            type: 'outliers',
            icon: <AlertTriangle className="w-5 h-5" />,
            title: `${column.name} Outliers Detected`,
            content: `Found ${outliers.length} potential outliers (${((outliers.length / values.length) * 100).toFixed(1)}% of data) in '${column.name}'. These values fall outside the range [${lowerBound.toFixed(2)}, ${upperBound.toFixed(2)}]. Consider investigating these data points.`,
            severity: 'warning'
          });
        }
      }
    });

    // Categorical column insights
    dataset.columns.filter(col => col.type === 'categorical').forEach(column => {
      const values = dataset.rows.map(row => row[column.name]).filter(val => val !== null && val !== undefined);
      const uniqueRatio = column.uniqueValues / values.length;
      
      if (uniqueRatio > 0.8) {
        generatedInsights.push({
          type: 'cardinality',
          icon: <AlertTriangle className="w-5 h-5" />,
          title: `High Cardinality in ${column.name}`,
          content: `Column '${column.name}' has very high cardinality with ${column.uniqueValues} unique values out of ${values.length} records (${(uniqueRatio * 100).toFixed(1)}%). This might indicate the column is more like an identifier than a true categorical variable.`,
          severity: 'warning'
        });
      } else if (column.uniqueValues <= 10) {
        generatedInsights.push({
          type: 'categories',
          icon: <TrendingUp className="w-5 h-5" />,
          title: `${column.name} Categories`,
          content: `Column '${column.name}' contains ${column.uniqueValues} distinct categories: ${column.sampleValues.slice(0, 5).join(', ')}${column.sampleValues.length > 5 ? '...' : ''}. This is well-suited for categorical analysis and visualization.`,
          severity: 'info'
        });
      }
    });

    // Data quality insights
    const columnsWithNulls = dataset.columns.filter(col => col.nullCount > 0);
    if (columnsWithNulls.length > 0) {
      generatedInsights.push({
        type: 'quality',
        icon: <AlertTriangle className="w-5 h-5" />,
        title: 'Missing Data Detected',
        content: `${columnsWithNulls.length} columns contain missing values: ${columnsWithNulls.map(col => `${col.name} (${col.nullCount} missing)`).join(', ')}. Consider data imputation or removal strategies.`,
        severity: 'warning'
      });
    }

    // Correlation insights (if multiple numerical columns)
    const numericalCols = dataset.columns.filter(col => col.type === 'numerical');
    if (numericalCols.length >= 2) {
      generatedInsights.push({
        type: 'correlation',
        icon: <Brain className="w-5 h-5" />,
        title: 'Correlation Analysis Opportunity',
        content: `With ${numericalCols.length} numerical columns (${numericalCols.map(c => c.name).join(', ')}), you can explore relationships between variables using correlation analysis and scatter plots. This may reveal interesting patterns and dependencies in your data.`,
        severity: 'info'
      });
    }

    // Recommendations
    if (dataset.rows.length > 1000) {
      generatedInsights.push({
        type: 'recommendation',
        icon: <Brain className="w-5 h-5" />,
        title: 'Large Dataset Recommendations',
        content: `With ${dataset.rows.length} rows, your dataset is substantial enough for advanced analytics. Consider implementing data sampling for faster visualization, clustering analysis for pattern discovery, or time-series analysis if temporal columns are present.`,
        severity: 'success'
      });
    }

    setInsights(generatedInsights);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI-Powered Data Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className={`border rounded-lg p-4 ${getSeverityColor(insight.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {insight.type}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed">{insight.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Analysis Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Analysis Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Total Insights</div>
              <div className="text-2xl font-bold text-blue-600">{insights.length}</div>
            </div>
            <div>
              <div className="font-medium">Warnings</div>
              <div className="text-2xl font-bold text-yellow-600">
                {insights.filter(i => i.severity === 'warning').length}
              </div>
            </div>
            <div>
              <div className="font-medium">Recommendations</div>
              <div className="text-2xl font-bold text-green-600">
                {insights.filter(i => i.type === 'recommendation').length}
              </div>
            </div>
            <div>
              <div className="font-medium">Data Quality</div>
              <div className="text-2xl font-bold text-purple-600">
                {((dataset.columns.filter(col => col.nullCount === 0).length / dataset.columns.length) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;
