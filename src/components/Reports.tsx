
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Calendar, DollarSign, Download, TrendingUp, Building2, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRangeModal } from './DateRangeModal';
import { ReportSummaryCards } from './ReportSummaryCards';
import { RecentTransactionsList } from './RecentTransactionsList';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'entrada' | 'saida';
  category: string;
  date_transaction: string;
  created_at: string;
  cash_sessions?: {
    church_id: string;
  };
}

interface Church {
  id: string;
  name: string;
}

export const Reports = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<string>('all');
  const [dateRange, setDateRange] = useState('30days');
  const [customDateRange, setCustomDateRange] = useState<{ start?: Date; end?: Date }>({});

  useEffect(() => {
    loadChurches();
    // Para usuários não supervisores, definir automaticamente sua igreja
    if (profile?.role !== 'supervisor' && profile?.church_id) {
      setSelectedChurch(profile.church_id);
    }
  }, [profile]);

  useEffect(() => {
    loadData();
  }, [dateRange, selectedChurch, profile?.church_id, customDateRange]);

  const loadChurches = async () => {
    try {
      const { data, error } = await supabase
        .from('churches')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setChurches(data || []);
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
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      
      let query = supabase
        .from('transactions')
        .select(`
          *,
          cash_sessions!inner(church_id)
        `)
        .gte('date_transaction', format(start, 'yyyy-MM-dd'))
        .lte('date_transaction', format(end, 'yyyy-MM-dd'))
        .order('date_transaction', { ascending: false });

      // Aplicar filtro de igreja se não for "all"
      if (selectedChurch !== 'all') {
        // Para usuários não supervisores, sempre filtrar pela sua igreja
        const churchFilter = profile?.role === 'supervisor' ? selectedChurch : profile?.church_id;
        if (churchFilter) {
          query = query.eq('cash_sessions.church_id', churchFilter);
        }
      } else if (profile?.role !== 'supervisor') {
        // Se não for supervisor, sempre filtrar pela igreja do usuário
        if (profile?.church_id) {
          query = query.eq('cash_sessions.church_id', profile.church_id);
        }
      }

      const { data: transactionsData, error: transError } = await query;

      if (transError) throw transError;
      setTransactions(transactionsData || []);
    } catch (error: any) {
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

  const calculateSummary = () => {
    const totalEntries = transactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExits = transactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    return {
      totalEntries,
      totalExits,
      balance: totalEntries - totalExits,
      transactionCount: transactions.length
    };
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor', 'Igreja'].join(','),
      ...transactions.map(t => {
        const churchName = churches.find(c => c.id === t.cash_sessions?.church_id)?.name || 'N/A';
        return [
          format(new Date(t.date_transaction), 'dd/MM/yyyy'),
          `"${t.description}"`,
          t.type,
          t.category || '',
          t.amount.toString(),
          `"${churchName}"`
        ].join(',');
      })
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

  const handleCustomDateRange = (startDate: Date, endDate: Date) => {
    setCustomDateRange({ start: startDate, end: endDate });
    setDateRange('custom');
    toast({
      title: "Período personalizado definido",
      description: `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
    });
  };

  const getSelectedChurchName = () => {
    if (selectedChurch === 'all') {
      return 'Todas as Igrejas';
    }
    if (profile?.role === 'supervisor' && selectedChurch) {
      return churches.find(c => c.id === selectedChurch)?.name || 'Igreja não encontrada';
    }
    if (profile?.church_id) {
      return churches.find(c => c.id === profile.church_id)?.name || 'Igreja não encontrada';
    }
    return '';
  };

  const summary = calculateSummary();
  const selectedChurchName = getSelectedChurchName();

  // Para usuários não supervisores, sempre mostrar dados da sua igreja
  if (profile?.role !== 'supervisor' && !profile?.church_id) {
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análises e histórico financeiro</p>
          {selectedChurchName && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Igreja: {selectedChurchName}
              </p>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-2 lg:flex-wrap">
          {profile?.role === 'supervisor' && (
            <Select value={selectedChurch} onValueChange={setSelectedChurch}>
              <SelectTrigger className="w-full sm:w-48">
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
          
          <div className="flex gap-2">
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
          </div>
          
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Exportar </span>CSV
          </Button>
        </div>
      </div>

      <ReportSummaryCards summary={summary} />
      <RecentTransactionsList transactions={transactions} loading={loading} />
    </div>
  );
};
