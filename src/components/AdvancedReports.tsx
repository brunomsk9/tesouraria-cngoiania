
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Download, FileText, TrendingUp } from 'lucide-react';
import { DateRangeModal } from './DateRangeModal';
import { useAdvancedReportsData } from '@/hooks/useAdvancedReportsData';
import { AdvancedReportSummary } from './reports/AdvancedReportSummary';
import { AdvancedReportChart } from './reports/AdvancedReportChart';
import { AdvancedReportTable } from './reports/AdvancedReportTable';
import { exportAdvancedReportToCSV } from './reports/AdvancedReportExport';

export const AdvancedReports = () => {
  const [reportType, setReportType] = useState('summary');
  const [groupBy, setGroupBy] = useState('church');
  const [selectedChurch, setSelectedChurch] = useState('all');
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() });

  const {
    loading,
    data,
    churches,
    profile,
    generateReport
  } = useAdvancedReportsData({
    reportType,
    groupBy,
    selectedChurch,
    dateRange
  });

  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    setDateRange({ start: startDate, end: endDate });
  };

  const handleExportCSV = () => {
    exportAdvancedReportToCSV(data, reportType, groupBy, churches);
  };

  if (profile?.role !== 'master' && profile?.role !== 'supervisor') {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Acesso Restrito</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700">
            Este relatório está disponível apenas para Masters e Supervisors.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Avançados</h1>
          <p className="text-gray-600">Análises detalhadas por período, igreja e categoria</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Resumo Geral</SelectItem>
              <SelectItem value="comparison">Comparativo</SelectItem>
              <SelectItem value="trends">Tendências</SelectItem>
              <SelectItem value="detailed">Detalhado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="church">Por Igreja</SelectItem>
              <SelectItem value="month">Por Mês</SelectItem>
              <SelectItem value="category">Por Categoria</SelectItem>
              <SelectItem value="event">Por Evento</SelectItem>
            </SelectContent>
          </Select>

          {profile?.role === 'master' && (
            <Select value={selectedChurch} onValueChange={setSelectedChurch}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecionar Igreja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Igrejas</SelectItem>
                {churches.map((church) => (
                  <SelectItem key={church.id} value={church.id}>
                    {church.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <DateRangeModal 
            onDateRangeSelect={handleDateRangeSelect}
            trigger={
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            }
          />

          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <AdvancedReportSummary data={data} reportType={reportType} loading={loading} />

      {/* Chart */}
      {(reportType === 'comparison' || reportType === 'trends') && (
        <AdvancedReportChart 
          data={data} 
          reportType={reportType} 
          groupBy={groupBy}
          loading={loading}
        />
      )}

      {/* Detailed Table */}
      <AdvancedReportTable 
        data={data} 
        reportType={reportType} 
        groupBy={groupBy}
        churches={churches}
        loading={loading}
      />
    </div>
  );
};
