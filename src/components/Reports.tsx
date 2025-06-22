
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Calendar, DollarSign, Download, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export const Reports = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [dateRange, setDateRange] = useState('30days');
  const [reportType, setReportType] = useState('summary');

  useEffect(() => {
    loadData();
  }, [dateRange, profile?.church_id]);

  const getDateRange = () => {
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
    if (!profile?.church_id) return;
    
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      
      // Load transactions
      const { data: transactionsData, error: transError } = await supabase
        .from('transactions')
        .select('*')
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
        .eq('church_id', profile.church_id)
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

  const summary = calculateSummary();

  if (!profile?.church_id && profile?.role !== 'supervisor') {
    return (
      <div className="p-6">
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análises e histórico financeiro</p>
        </div>
        
        <div className="flex space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="thisMonth">Este mês</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Entradas</p>
                <p className="text-2xl font-bold">
                  R$ {summary.totalEntries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Total Saídas</p>
                <p className="text-2xl font-bold">
                  R$ {summary.totalExits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={`bg-gradient-to-r ${summary.balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={summary.balance >= 0 ? 'text-blue-100' : 'text-orange-100'}>Saldo</p>
                <p className="text-2xl font-bold">
                  R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Calendar className={`h-8 w-8 ${summary.balance >= 0 ? 'text-blue-200' : 'text-orange-200'}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Transações</p>
                <p className="text-2xl font-bold">{summary.transactionCount}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
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
                <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(transaction.date_transaction), 'dd/MM/yyyy', { locale: ptBR })}
                      {transaction.category && ` • ${transaction.category}`}
                    </p>
                  </div>
                  <div className={`text-right ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
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
