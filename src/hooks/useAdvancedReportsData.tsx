
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AdvancedReportParams {
  reportType: string;
  groupBy: string;
  selectedChurch: string;
  dateRange: { start: Date; end: Date };
}

interface Church {
  id: string;
  name: string;
}

export const useAdvancedReportsData = (params: AdvancedReportParams) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);

  useEffect(() => {
    loadChurches();
  }, [profile]);

  useEffect(() => {
    if (profile) {
      generateReport();
    }
  }, [params, profile]);

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

  const generateReport = async () => {
    setLoading(true);
    try {
      const startDate = format(params.dateRange.start, 'yyyy-MM-dd');
      const endDate = format(params.dateRange.end, 'yyyy-MM-dd');

      // Base query for transactions
      let query = supabase
        .from('transactions')
        .select(`
          *,
          cash_sessions!inner(church_id, culto_evento, date_session)
        `)
        .gte('date_transaction', startDate)
        .lte('date_transaction', endDate);

      // Apply church filter
      if (params.selectedChurch !== 'all') {
        const churchFilter = profile?.role === 'master' ? params.selectedChurch : profile?.church_id;
        if (churchFilter) {
          query = query.eq('cash_sessions.church_id', churchFilter);
        }
      } else if (profile?.role !== 'master') {
        if (profile?.church_id) {
          query = query.eq('cash_sessions.church_id', profile.church_id);
        }
      }

      const { data: transactions, error } = await query;
      if (error) throw error;

      // Process data based on groupBy parameter
      const processedData = processDataByGrouping(transactions || [], params.groupBy, params.reportType);
      setData(processedData);

    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Não foi possível gerar o relatório.');
    } finally {
      setLoading(false);
    }
  };

  const processDataByGrouping = (transactions: any[], groupBy: string, reportType: string) => {
    const grouped: Record<string, any> = {};

    transactions.forEach(transaction => {
      let key = '';
      
      switch (groupBy) {
        case 'church':
          key = transaction.cash_sessions.church_id;
          break;
        case 'month':
          key = format(new Date(transaction.date_transaction), 'yyyy-MM');
          break;
        case 'category':
          key = transaction.category || 'Sem categoria';
          break;
        case 'event':
          key = transaction.cash_sessions.culto_evento || 'Sem evento';
          break;
        default:
          key = 'total';
      }

      if (!grouped[key]) {
        grouped[key] = {
          key,
          entradas: 0,
          saidas: 0,
          saldo: 0,
          count: 0,
          transactions: []
        };
      }

      const amount = Number(transaction.amount);
      if (transaction.type === 'entrada') {
        grouped[key].entradas += amount;
      } else {
        grouped[key].saidas += amount;
      }
      
      grouped[key].saldo = grouped[key].entradas - grouped[key].saidas;
      grouped[key].count += 1;
      grouped[key].transactions.push(transaction);
    });

    return Object.values(grouped);
  };

  return {
    loading,
    data,
    churches,
    profile,
    generateReport
  };
};
