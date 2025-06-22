
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

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

export const useReportsData = () => {
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

  return {
    loading,
    transactions,
    churches,
    selectedChurch,
    setSelectedChurch,
    dateRange,
    setDateRange,
    customDateRange,
    handleCustomDateRange,
    calculateSummary,
    getSelectedChurchName,
    profile
  };
};
