
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CashBookEntry {
  date: string;
  description: string;
  type: 'entrada' | 'saida';
  amount: number;
  balance: number;
  session: string;
  category?: string;
}

interface Church {
  id: string;
  name: string;
}

export const useCashBookData = () => {
  const [entries, setEntries] = useState<CashBookEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialBalance, setInitialBalance] = useState(0);
  const [churches, setChurches] = useState<Church[]>([]);

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
      toast.error('Erro ao carregar igrejas');
    }
  };

  const generateReport = async (startDate: string, endDate: string, selectedChurch: string) => {
    if (!startDate || !endDate || !selectedChurch) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    console.log('Gerando relatório com parâmetros:', { startDate, endDate, selectedChurch });
    setLoading(true);
    
    try {
      // Buscar transações do período
      console.log('Buscando transações...');
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select(`
          date_transaction,
          description,
          type,
          amount,
          category,
          cash_session_id,
          cash_sessions!inner(culto_evento, church_id)
        `)
        .eq('cash_sessions.church_id', selectedChurch)
        .gte('date_transaction', startDate)
        .lte('date_transaction', endDate)
        .order('date_transaction', { ascending: true });

      if (transError) {
        console.error('Erro ao buscar transações:', transError);
        throw transError;
      }

      console.log('Transações encontradas:', transactions?.length || 0);

      // Buscar entradas PIX do período
      console.log('Buscando entradas PIX...');
      const { data: pixEntries, error: pixError } = await supabase
        .from('pix_entries')
        .select(`
          amount,
          description,
          created_at,
          cash_sessions!inner(culto_evento, church_id, date_session)
        `)
        .eq('cash_sessions.church_id', selectedChurch)
        .gte('cash_sessions.date_session', startDate)
        .lte('cash_sessions.date_session', endDate)
        .order('created_at', { ascending: true });

      if (pixError) {
        console.error('Erro ao buscar PIX:', pixError);
        throw pixError;
      }

      console.log('Entradas PIX encontradas:', pixEntries?.length || 0);

      // Calcular saldo inicial (transações antes do período)
      console.log('Calculando saldo inicial...');
      const { data: prevTransactions, error: prevError } = await supabase
        .from('transactions')
        .select(`
          amount,
          type,
          cash_sessions!inner(church_id)
        `)
        .eq('cash_sessions.church_id', selectedChurch)
        .lt('date_transaction', startDate);

      if (prevError) {
        console.error('Erro ao buscar transações anteriores:', prevError);
        throw prevError;
      }

      const { data: prevPixEntries, error: prevPixError } = await supabase
        .from('pix_entries')
        .select(`
          amount,
          cash_sessions!inner(church_id, date_session)
        `)
        .eq('cash_sessions.church_id', selectedChurch)
        .lt('cash_sessions.date_session', startDate);

      if (prevPixError) {
        console.error('Erro ao buscar PIX anteriores:', prevPixError);
        throw prevPixError;
      }

      // Calcular saldo inicial
      const prevBalance = (prevTransactions || []).reduce((acc, trans) => {
        return acc + (trans.type === 'entrada' ? Number(trans.amount) : -Number(trans.amount));
      }, 0) + (prevPixEntries || []).reduce((acc, pix) => acc + Number(pix.amount), 0);

      console.log('Saldo inicial calculado:', prevBalance);
      setInitialBalance(prevBalance);

      // Processar entradas do livro caixa
      const cashBookEntries: CashBookEntry[] = [];
      let runningBalance = prevBalance;

      // Adicionar transações
      (transactions || []).forEach(trans => {
        const amount = trans.type === 'entrada' ? Number(trans.amount) : -Number(trans.amount);
        runningBalance += amount;
        
        cashBookEntries.push({
          date: trans.date_transaction,
          description: trans.description,
          type: trans.type,
          amount: Math.abs(Number(trans.amount)),
          balance: runningBalance,
          session: trans.cash_sessions?.culto_evento || 'N/A',
          category: trans.category || undefined
        });
      });

      // Adicionar entradas PIX
      (pixEntries || []).forEach(pix => {
        runningBalance += Number(pix.amount);
        
        cashBookEntries.push({
          date: pix.cash_sessions?.date_session || pix.created_at.split('T')[0],
          description: `PIX: ${pix.description || 'Entrada'}`,
          type: 'entrada',
          amount: Number(pix.amount),
          balance: runningBalance,
          session: pix.cash_sessions?.culto_evento || 'N/A'
        });
      });

      // Ordenar por data
      cashBookEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      console.log('Entradas processadas:', cashBookEntries.length);
      setEntries(cashBookEntries);
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  return {
    entries,
    loading,
    initialBalance,
    churches,
    loadChurches,
    generateReport
  };
};
