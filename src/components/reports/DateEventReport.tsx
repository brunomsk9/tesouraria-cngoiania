
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ReportsFilters } from './ReportsFilters';

interface DateEventReportData {
  date: string;
  event_name: string;
  total_entradas: number;
  total_saidas: number;
  saldo: number;
}

interface Church {
  id: string;
  name: string;
}

export const DateEventReport = () => {
  const [data, setData] = useState<DateEventReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [customDateRange, setCustomDateRange] = useState<{ start?: Date; end?: Date }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadChurches();
  }, []);

  useEffect(() => {
    loadData();
  }, [dateRange, customDateRange, selectedChurch]);

  const loadChurches = async () => {
    try {
      const { data: churchesData, error } = await supabase
        .from('churches')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setChurches(churchesData || []);
    } catch (error) {
      console.error('Error loading churches:', error);
    }
  };

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
      const startDate = format(start, 'yyyy-MM-dd');
      const endDate = format(end, 'yyyy-MM-dd');

      console.log('Date range for query:', { startDate, endDate });

      let transactionsQuery = supabase
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
        .gte('cash_sessions.date_session', startDate)
        .lte('cash_sessions.date_session', endDate);

      let pixQuery = supabase
        .from('pix_entries')
        .select(`
          amount,
          cash_sessions!inner(
            culto_evento,
            date_session,
            churches!inner(name)
          )
        `)
        .gte('cash_sessions.date_session', startDate)
        .lte('cash_sessions.date_session', endDate);

      // Aplicar filtro de igreja se não for "all"
      if (selectedChurch !== 'all') {
        transactionsQuery = transactionsQuery.eq('cash_sessions.churches.id', selectedChurch);
        pixQuery = pixQuery.eq('cash_sessions.churches.id', selectedChurch);
      }

      const [{ data: transactions, error: transError }, { data: pixEntries, error: pixError }] = await Promise.all([
        transactionsQuery,
        pixQuery
      ]);

      if (transError) {
        console.error('Error fetching transactions:', transError);
        throw transError;
      }

      if (pixError) {
        console.error('Error fetching PIX entries:', pixError);
        throw pixError;
      }

      console.log('Raw transactions:', transactions);
      console.log('Raw PIX entries:', pixEntries);

      // Processar e agrupar dados por data e evento (sem considerar igreja)
      const groupedData: Record<string, DateEventReportData> = {};

      // Processar transações - usar date_session como data do evento
      transactions?.forEach((transaction) => {
        const eventDate = transaction.cash_sessions?.date_session || '';
        const key = `${eventDate}-${transaction.cash_sessions?.culto_evento}`;
        
        if (!groupedData[key]) {
          groupedData[key] = {
            date: eventDate,
            event_name: transaction.cash_sessions?.culto_evento || '',
            total_entradas: 0,
            total_saidas: 0,
            saldo: 0
          };
        }

        if (transaction.type === 'entrada') {
          groupedData[key].total_entradas += Number(transaction.amount);
        } else {
          groupedData[key].total_saidas += Number(transaction.amount);
        }
      });

      // Processar entradas PIX - usar date_session como data do evento
      pixEntries?.forEach((pix) => {
        const eventDate = pix.cash_sessions?.date_session || '';
        const key = `${eventDate}-${pix.cash_sessions?.culto_evento}`;
        
        if (!groupedData[key]) {
          groupedData[key] = {
            date: eventDate,
            event_name: pix.cash_sessions?.culto_evento || '',
            total_entradas: 0,
            total_saidas: 0,
            saldo: 0
          };
        }

        groupedData[key].total_entradas += Number(pix.amount);
      });

      // Calcular saldos e ordenar por data
      const processedData = Object.values(groupedData).map(item => ({
        ...item,
        saldo: item.total_entradas - item.total_saidas
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log('Final processed data:', processedData);
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
    setSelectedChurch('all');
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram resetados para os valores padrão."
    });
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Evento/Culto', 'Entradas', 'Saídas', 'Saldo'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        format(new Date(item.date), 'dd/MM/yyyy'),
        `"${item.event_name}"`,
        item.total_entradas.toString().replace('.', ','),
        item.total_saidas.toString().replace('.', ','),
        item.saldo.toString().replace('.', ',')
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
          <ReportsFilters
            churches={churches}
            selectedChurch={selectedChurch}
            onChurchChange={setSelectedChurch}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            customDateRange={customDateRange}
            onCustomDateRange={handleCustomDateRange}
            onExportCSV={exportToCSV}
            onClearFilters={handleClearFilters}
            isSuper={true}
          />
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
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
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
