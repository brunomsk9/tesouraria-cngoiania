
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subMonths, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Download, CalendarIcon, FileText, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { DateRangeModal } from './DateRangeModal';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  id: string;
  date_transaction: string;
  church_name: string;
  event_name: string;
  payment_type: string;
  amount: number;
  type: 'entrada' | 'saida';
  description: string;
}

interface Church {
  id: string;
  name: string;
}

export const Reports = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportData[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<string>('all');
  const [dateRange, setDateRange] = useState('30days');
  const [customDateRange, setCustomDateRange] = useState<{ start?: Date; end?: Date }>({});

  // Load churches on component mount
  useEffect(() => {
    loadChurches();
  }, []);

  // Set default church for non-supervisor/master users
  useEffect(() => {
    if (profile?.role !== 'supervisor' && profile?.role !== 'master' && profile?.church_id) {
      setSelectedChurch(profile.church_id);
    }
  }, [profile]);

  // Load data when filters change
  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [dateRange, selectedChurch, profile, customDateRange]);

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

      // Apply church filter
      if (profile?.role === 'supervisor' || profile?.role === 'master') {
        // Supervisor and master can filter by specific church or see all
        if (selectedChurch !== 'all') {
          query = query.eq('cash_sessions.church_id', selectedChurch);
        }
      } else {
        // Non-supervisors/masters can only see their own church
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
        type: transaction.type,
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
    const headers = ['Data', 'Igreja', 'Evento/Culto', 'Tipo de Pagamento', 'Entradas', 'Saídas', 'Descrição'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        format(new Date(item.date_transaction), 'dd/MM/yyyy'),
        `"${item.church_name}"`,
        `"${item.event_name}"`,
        `"${item.payment_type}"`,
        item.type === 'entrada' ? item.amount.toString().replace('.', ',') : '0',
        item.type === 'saida' ? item.amount.toString().replace('.', ',') : '0',
        `"${item.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${format(new Date(), 'yyyy-MM-dd')}.csv`);
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
    const totalEntradas = data.filter(item => item.type === 'entrada').reduce((sum, item) => sum + item.amount, 0);
    const totalSaidas = data.filter(item => item.type === 'saida').reduce((sum, item) => sum + item.amount, 0);
    return { totalEntradas, totalSaidas };
  };

  const { totalEntradas, totalSaidas } = calculateTotals();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
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

  if (profile?.role !== 'supervisor' && profile?.role !== 'master' && !profile?.church_id) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Igreja não configurada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700">
            Você precisa estar vinculado a uma igreja para visualizar relatórios.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600 mt-2">Relatório detalhado de transações</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-green-100 text-sm">Total Entradas</p>
                <p className="text-lg lg:text-2xl font-bold truncate">
                  {formatCurrency(totalEntradas)}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-green-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-red-100 text-sm">Total Saídas</p>
                <p className="text-lg lg:text-2xl font-bold truncate">
                  {formatCurrency(totalSaidas)}
                </p>
              </div>
              <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-red-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={`bg-gradient-to-r ${(totalEntradas - totalSaidas) >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className={(totalEntradas - totalSaidas) >= 0 ? 'text-blue-100' : 'text-orange-100'}>Saldo</p>
                <p className="text-lg lg:text-2xl font-bold truncate">
                  {formatCurrency(totalEntradas - totalSaidas)}
                </p>
              </div>
              <Calendar className={`h-6 w-6 lg:h-8 lg:w-8 ${(totalEntradas - totalSaidas) >= 0 ? 'text-blue-200' : 'text-orange-200'} flex-shrink-0`} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-purple-100 text-sm">Transações</p>
                <p className="text-lg lg:text-2xl font-bold">{data.length}</p>
              </div>
              <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-purple-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            {(profile?.role === 'supervisor' || profile?.role === 'master') && (
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Igreja</label>
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
              <label className="text-sm font-medium mb-2 block">Período</label>
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
          <CardTitle>Transações Detalhadas ({data.length} registros)</CardTitle>
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
                  <TableHead className="text-right">Entradas</TableHead>
                  <TableHead className="text-right">Saídas</TableHead>
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
                      {item.type === 'entrada' ? formatCurrency(item.amount) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {item.type === 'saida' ? formatCurrency(item.amount) : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={item.description}>
                      {item.description}
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
                {data.length > 0 && (
                  <TableRow className="bg-gray-50 font-semibold">
                    <TableCell colSpan={4} className="text-right">
                      <strong>TOTAL:</strong>
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {formatCurrency(totalEntradas)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-600">
                      {formatCurrency(totalSaidas)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-600">
                      Saldo: {formatCurrency(totalEntradas - totalSaidas)}
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
