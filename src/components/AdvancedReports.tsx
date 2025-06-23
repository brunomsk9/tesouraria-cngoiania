
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subMonths, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Download, CalendarIcon } from 'lucide-react';
import { DateRangeModal } from './DateRangeModal';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  id: string;
  date_transaction: string;
  church_name: string;
  event_name: string;
  payment_type: string;
  amount: number;
  description: string;
}

interface Church {
  id: string;
  name: string;
}

export const AdvancedReports = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportData[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<string>('all');
  const [dateRange, setDateRange] = useState('30days');
  const [customDateRange, setCustomDateRange] = useState<{ start?: Date; end?: Date }>({});

  useEffect(() => {
    loadChurches();
    if (profile?.role !== 'supervisor' && profile?.church_id) {
      setSelectedChurch(profile.church_id);
    }
  }, [profile]);

  useEffect(() => {
    loadData();
  }, [dateRange, selectedChurch, profile?.church_id, customDateRange]);

  const loadChurches = async () => {
    try {
      const { data: churchesData, error } = await supabase
        .from('churches')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setChurches(churchesData || []);
    } catch (error) {
      console.error('Erro ao carregar igrejas:', error);
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
    if (!profile) return;
    
    setLoading(true);
    try {
      const { start, end } = getDateRange();

      let query = supabase
        .from('transactions')
        .select(`
          id,
          date_transaction,
          description,
          amount,
          type,
          category,
          cash_sessions!inner(
            church_id,
            culto_evento,
            churches!inner(name)
          )
        `)
        .gte('date_transaction', format(start, 'yyyy-MM-dd'))
        .lte('date_transaction', format(end, 'yyyy-MM-dd'))
        .order('date_transaction', { ascending: false });

      // Filter by church based on profile
      if (selectedChurch !== 'all') {
        const churchFilter = profile?.role === 'supervisor' ? selectedChurch : profile?.church_id;
        if (churchFilter) {
          query = query.eq('cash_sessions.church_id', churchFilter);
        }
      } else if (profile?.role !== 'supervisor') {
        if (profile?.church_id) {
          query = query.eq('cash_sessions.church_id', profile.church_id);
        }
      }

      const { data: transactions, error } = await query;
      
      if (error) throw error;

      // Transform data for the table
      const transformedData: ReportData[] = (transactions || []).map(transaction => ({
        id: transaction.id,
        date_transaction: transaction.date_transaction,
        church_name: transaction.cash_sessions?.churches?.name || 'N/A',
        event_name: transaction.cash_sessions?.culto_evento || 'N/A',
        payment_type: transaction.category || 'Não especificado',
        amount: Number(transaction.amount),
        description: transaction.description
      }));

      setData(transformedData);
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

  const exportToCSV = () => {
    const headers = ['Data', 'Igreja', 'Evento/Culto', 'Tipo de Pagamento', 'Valor', 'Descrição'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        format(new Date(item.date_transaction), 'dd/MM/yyyy'),
        `"${item.church_name}"`,
        `"${item.event_name}"`,
        `"${item.payment_type}"`,
        item.amount.toString().replace('.', ','),
        `"${item.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_avancado_${format(new Date(), 'yyyy-MM-dd')}.csv`);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Avançados</h1>
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
        <h1 className="text-3xl font-bold text-gray-900">Relatórios Avançados</h1>
        <p className="text-gray-600 mt-2">Relatório detalhado de transações</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            {profile?.role === 'supervisor' && (
              <div className="flex-1">
                <label className="text-sm font-medium">Igreja</label>
                <Select value={selectedChurch} onValueChange={setSelectedChurch}>
                  <SelectTrigger>
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
              </div>
            )}
            
            <div className="flex-1">
              <label className="text-sm font-medium">Período</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
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
            </div>

            <DateRangeModal 
              onDateRangeSelect={handleCustomDateRange}
              trigger={
                <Button variant="outline">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Data Personalizada
                </Button>
              }
            />

            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Igreja</TableHead>
                  <TableHead>Evento/Culto</TableHead>
                  <TableHead>Tipo de Pagamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {format(new Date(item.date_transaction), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.church_name}
                    </TableCell>
                    <TableCell>
                      {item.event_name}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {item.payment_type}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={item.description}>
                      {item.description}
                    </TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
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
