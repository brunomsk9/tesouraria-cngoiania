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

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'entrada' | 'saida';
  category: string;
  date_transaction: string;
  created_at: string;
}

interface CashSession {
  id: string;
  culto_evento: string;
  date_session: string;
  status: string;
  total_entries: number;
  total_exits: number;
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
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<string>('');
  const [dateRange, setDateRange] = useState('30days');
  const [customDateRange, setCustomDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [reportType, setReportType] = useState('summary');

  useEffect(() => {
    if (profile?.role === 'supervisor') {
      loadChurches();
    }
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

  const getChurchFilter = () => {
    if (profile?.role === 'supervisor' && selectedChurch) {
      return selectedChurch;
    }
    return profile?.church_id;
  };

  const loadData = async () => {
    const churchId = getChurchFilter();
    if (!churchId) return;
    
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      
      // Load transactions
      const { data: transactionsData, error: transError } = await supabase
        .from('transactions')
        .select(`
          *,
          cash_sessions!inner(church_id)
        `)
        .eq('cash_sessions.church_id', churchId)
        .gte('date_transaction', format(start, 'yyyy-MM-dd'))
        .lte('date_transaction', format(end, 'yyyy-MM-dd'))
        .order('date_transaction', { ascending: false });

      if (transError) throw transError;
      setTransactions(transactionsData || []);

      // Load cash sessions with totals
      const { data: sessionsData, error: sessError } = await supabase
        .from('cash_sessions')
        .select(`
          *,
          transactions!inner(amount, type)
        `)
        .eq('church_id', churchId)
        .gte('date_session', format(start, 'yyyy-MM-dd'))
        .lte('date_session', format(end, 'yyyy-MM-dd'))
        .order('date_session', { ascending: false });

      if (sessError) throw sessError;
      
      const processedSessions = (sessionsData || []).map(session => {
        const sessionTransactions = session.transactions || [];
        const totalEntries = sessionTransactions
          .filter((t: any) => t.type === 'entrada')
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        const totalExits = sessionTransactions
          .filter((t: any) => t.type === 'saida')
          .reduce((sum: number, t: any) => sum + Number(t.amount), 0);
        
        return {
          ...session,
          total_entries: totalEntries,
          total_exits: totalExits
        };
      });

      setSessions(processedSessions);
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
      ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor'].join(','),
      ...transactions.map(t => [
        format(new Date(t.date_transaction), 'dd/MM/yyyy'),
        `"${t.description}"`,
        t.type,
        t.category || '',
        t.amount.toString()
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

  const handleCustomDateRange = (startDate: Date, endDate: Date) => {
    setCustomDateRange({ start: startDate, end: endDate });
    setDateRange('custom');
    toast({
      title: "Período personalizado definido",
      description: `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
    });
  };

  const summary = calculateSummary();
  const churchId = getChurchFilter();

  if (!churchId && profile?.role !== 'supervisor') {
    return (
      <div className="p-4 lg:p-6">
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
      </div>
    );
  }

  if (profile?.role === 'supervisor' && !selectedChurch) {
    return (
      <div className="p-4 lg:p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Selecione uma Igreja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Selecione uma igreja para visualizar os relatórios financeiros.
            </p>
            <Select value={selectedChurch} onValueChange={setSelectedChurch}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma igreja" />
              </SelectTrigger>
              <SelectContent>
                {churches.map((church) => (
                  <SelectItem key={church.id} value={church.id}>
                    {church.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header - Melhorado para responsividade */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análises e histórico financeiro</p>
          {profile?.role === 'supervisor' && selectedChurch && (
            <p className="text-sm text-blue-600 mt-1">
              Igreja: {churches.find(c => c.id === selectedChurch)?.name}
            </p>
          )}
        </div>
        
        {/* Controls - Melhorado para mobile */}
        <div className="flex flex-col sm:flex-row gap-2 lg:flex-wrap">
          {profile?.role === 'supervisor' && (
            <Select value={selectedChurch} onValueChange={setSelectedChurch}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Selecionar Igreja" />
              </SelectTrigger>
              <SelectContent>
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

      {/* Summary Cards - Melhorado para responsividade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-green-100 text-sm">Total Entradas</p>
                <p className="text-lg lg:text-2xl font-bold truncate">
                  R$ {summary.totalEntries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  R$ {summary.totalExits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-red-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={`bg-gradient-to-r ${summary.balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className={summary.balance >= 0 ? 'text-blue-100' : 'text-orange-100'}>Saldo</p>
                <p className="text-lg lg:text-2xl font-bold truncate">
                  R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Calendar className={`h-6 w-6 lg:h-8 lg:w-8 ${summary.balance >= 0 ? 'text-blue-200' : 'text-orange-200'} flex-shrink-0`} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-purple-100 text-sm">Transações</p>
                <p className="text-lg lg:text-2xl font-bold">{summary.transactionCount}</p>
              </div>
              <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-purple-200 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions - Melhorado para mobile */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando transações...</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{transaction.description}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(transaction.date_transaction), 'dd/MM/yyyy', { locale: ptBR })}
                      {transaction.category && ` • ${transaction.category}`}
                    </p>
                  </div>
                  <div className={`text-right sm:text-right ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'} flex-shrink-0`}>
                    <p className="font-bold">
                      {transaction.type === 'entrada' ? '+' : '-'} R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs capitalize">{transaction.type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">Nenhuma transação encontrada no período selecionado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
