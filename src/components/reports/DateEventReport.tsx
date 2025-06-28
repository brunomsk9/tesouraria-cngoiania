
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Download, X } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DateRangeModal } from '../DateRangeModal';

interface DateEventReportData {
  date: string;
  event_name: string;
  total_entradas: number;
  total_saidas: number;
  saldo: number;
  churches_count: number;
  churches_names: string[];
}

export const DateEventReport = () => {
  const [data, setData] = useState<DateEventReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('30days');
  const [customDateRange, setCustomDateRange] = useState<{ start?: Date; end?: Date }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [dateRange, customDateRange]);

  const getDateRange = () => {
    if (customDateRange.start && customDateRange.end) {
      return { start: customDateRange.start, end: customDateRange.end };
    }
    
    const now = new Date();
    switch (dateRange) {
      case '7days':
        return { start: subDays(now, 7), end: now };
      case '30days':
        return { start: subDays(now, 30), end: now };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();

      // Buscar todas as transações
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          type,
          cash_sessions!inner(
            culto_evento,
            date_session,
            churches!inner(name)
          )
        `)
        .gte('cash_sessions.date_session', format(start, 'yyyy-MM-dd'))
        .lte('cash_sessions.date_session', format(end, 'yyyy-MM-dd'));

      if (error) throw error;

      // Buscar entradas PIX
      const { data: pixEntries, error: pixError } = await supabase
        .from('pix_entries')
        .select(`
          amount,
          cash_sessions!inner(
            culto_evento,
            date_session,
            churches!inner(name)
          )
        `)
        .gte('cash_sessions.date_session', format(start, 'yyyy-MM-dd'))
        .lte('cash_sessions.date_session', format(end, 'yyyy-MM-dd'));

      if (pixError) throw pixError;

      // Processar e agrupar dados por data e evento
      const groupedData: Record<string, DateEventReportData> = {};

      // Processar transações
      transactions?.forEach((transaction) => {
        const key = `${transaction.cash_sessions?.date_session}-${transaction.cash_sessions?.culto_evento}`;
        const churchName = transaction.cash_sessions?.churches?.name || '';
        
        if (!groupedData[key]) {
          groupedData[key] = {
            date: transaction.cash_sessions?.date_session || '',
            event_name: transaction.cash_sessions?.culto_evento || '',
            total_entradas: 0,
            total_saidas: 0,
            saldo: 0,
            churches_count: 0,
            churches_names: []
          };
        }

        // Adicionar igreja se não estiver na lista
        if (!groupedData[key].churches_names.includes(churchName)) {
          groupedData[key].churches_names.push(churchName);
          groupedData[key].churches_count = groupedData[key].churches_names.length;
        }

        if (transaction.type === 'entrada') {
          groupedData[key].total_entradas += Number(transaction.amount);
        } else {
          groupedData[key].total_saidas += Number(transaction.amount);
        }
      });

      // Processar entradas PIX
      pixEntries?.forEach((pix) => {
        const key = `${pix.cash_sessions?.date_session}-${pix.cash_sessions?.culto_evento}`;
        const churchName = pix.cash_sessions?.churches?.name || '';
        
        if (!groupedData[key]) {
          groupedData[key] = {
            date: pix.cash_sessions?.date_session || '',
            event_name: pix.cash_sessions?.culto_evento || '',
            total_entradas: 0,
            total_saidas: 0,
            saldo: 0,
            churches_count: 0,
            churches_names: []
          };
        }

        // Adicionar igreja se não estiver na lista
        if (!groupedData[key].churches_names.includes(churchName)) {
          groupedData[key].churches_names.push(churchName);
          groupedData[key].churches_count = groupedData[key].churches_names.length;
        }

        groupedData[key].total_entradas += Number(pix.amount);
      });

      // Calcular saldos e ordenar por data
      const processedData = Object.values(groupedData).map(item => ({
        ...item,
        saldo: item.total_entradas - item.total_saidas
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setData(processedData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados do relatório."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateRange = (startDate: Date, endDate: Date) => {
    setCustomDateRange({ start: startDate, end: endDate });
    setDateRange('custom');
    toast({
      title: "Período personalizado definido",
      description: `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
    });
  };

  const handleClearFilters = () => {
    setDateRange('30days');
    setCustomDateRange({});
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram resetados para os valores padrão."
    });
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Evento/Culto', 'Entradas', 'Saídas', 'Saldo', 'Qtd Igrejas', 'Igrejas'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        format(new Date(item.date), 'dd/MM/yyyy'),
        `"${item.event_name}"`,
        item.total_entradas.toString().replace('.', ','),
        item.total_saidas.toString().replace('.', ','),
        item.saldo.toString().replace('.', ','),
        item.churches_count.toString(),
        `"${item.churches_names.join(', ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_data_evento_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTotals = () => {
    const totalEntradas = data.reduce((sum, item) => sum + item.total_entradas, 0);
    const totalSaidas = data.reduce((sum, item) => sum + item.total_saidas, 0);
    const totalSaldo = totalEntradas - totalSaidas;
    return { totalEntradas, totalSaidas, totalSaldo };
  };

  const { totalEntradas, totalSaidas, totalSaldo } = calculateTotals();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatório por Data e Evento</h1>
          <p className="text-gray-600 mt-2">Carregando dados...</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatório por Data e Evento</h1>
        <p className="text-gray-600 mt-2">Consolidação de dados por data e evento/culto</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="thisMonth">Este mês</SelectItem>
                  {customDateRange.start && customDateRange.end && (
                    <SelectItem value="custom">
                      {format(customDateRange.start, 'dd/MM')} - {format(customDateRange.end, 'dd/MM')}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <DateRangeModal 
                onDateRangeSelect={handleCustomDateRange}
                trigger={
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                }
              />
              
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleClearFilters} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Total de Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradas)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Total de Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSaidas)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Saldo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalSaldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalSaldo)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório por Data e Evento ({data.length} registros)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Evento/Culto</TableHead>
                  <TableHead className="text-right">Entradas</TableHead>
                  <TableHead className="text-right">Saídas</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-center">Qtd Igrejas</TableHead>
                  <TableHead>Igrejas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {format(new Date(item.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.event_name}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(item.total_entradas)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {formatCurrency(item.total_saidas)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${item.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.saldo)}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.churches_count}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.churches_names.join(', ')}
                    </TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      Nenhuma transação encontrada para o período selecionado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
