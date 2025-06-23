
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAdvancedReportsData } from '@/hooks/useAdvancedReportsData';
import { AdvancedReportSummary } from '@/components/reports/AdvancedReportSummary';
import { AdvancedReportChart } from '@/components/reports/AdvancedReportChart';
import { AdvancedReportTable } from '@/components/reports/AdvancedReportTable';
import { exportAdvancedReportToCSV } from '@/components/reports/AdvancedReportExport';

export const AdvancedReports = () => {
  const [reportType, setReportType] = useState('resumo');
  const [groupBy, setGroupBy] = useState('month');
  const [selectedChurch, setSelectedChurch] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: subMonths(new Date(), 1),
    end: new Date()
  });

  const reportParams = {
    reportType,
    groupBy,
    selectedChurch,
    dateRange
  };

  const { loading, data, churches, profile } = useAdvancedReportsData(reportParams);

  const handleExport = () => {
    if (data.length > 0) {
      exportAdvancedReportToCSV(data, reportType, groupBy, churches);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Avançados</h1>
          <p className="text-gray-600 mt-2">Análises detalhadas para supervisão e gestão</p>
        </div>
        <Button 
          onClick={handleExport} 
          variant="outline" 
          disabled={loading || data.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo de Relatório */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tipo de Relatório
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resumo">Resumo Financeiro</SelectItem>
                  <SelectItem value="comparativo">Comparativo</SelectItem>
                  <SelectItem value="tendencia">Análise de Tendência</SelectItem>
                  <SelectItem value="detalhado">Detalhado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Agrupar Por */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Agrupar Por
              </label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="church">Igreja</SelectItem>
                  <SelectItem value="category">Categoria</SelectItem>
                  <SelectItem value="event">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Igreja */}
            {(profile?.role === 'master' || profile?.role === 'supervisor') && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Igreja
                </label>
                <Select value={selectedChurch} onValueChange={setSelectedChurch}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Igrejas</SelectItem>
                    {churches.map(church => (
                      <SelectItem key={church.id} value={church.id}>
                        {church.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Período */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Período
              </label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.start && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.start ? (
                        format(dateRange.start, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        "Data inicial"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.start}
                      onSelect={(date) => date && setDateRange({...dateRange, start: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange.end && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.end ? (
                        format(dateRange.end, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        "Data final"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.end}
                      onSelect={(date) => date && setDateRange({...dateRange, end: date})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <AdvancedReportSummary data={data} loading={loading} />

      {/* Gráfico */}
      <AdvancedReportChart 
        data={data} 
        reportType={reportType} 
        groupBy={groupBy}
        churches={churches}
        loading={loading}
      />

      {/* Tabela Detalhada */}
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
