
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

export const useCashBookData = () => {
  const [entries, setEntries] = useState<CashBookEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialBalance, setInitialBalance] = useState(0);

  const generateReport = async (startDate: string, endDate: string, churchId: string) => {
    console.log('generateReport chamado com:', { startDate, endDate, churchId });
    
    if (!startDate || !endDate) {
      toast.error('Preencha as datas de início e fim');
      return;
    }

    if (!churchId) {
      toast.error('Igreja não identificada');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Iniciando busca de dados...');
      
      // Buscar transações do período
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
        .eq('cash_sessions.church_id', churchId)
        .gte('date_transaction', startDate)
        .lte('date_transaction', endDate)
        .order('date_transaction', { ascending: true });

      if (transError) {
        console.error('Erro ao buscar transações:', transError);
        throw transError;
      }

      console.log('Transações encontradas:', transactions?.length || 0);

      // Buscar entradas PIX do período
      const { data: pixEntries, error: pixError } = await supabase
        .from('pix_entries')
        .select(`
          amount,
          description,
          created_at,
          cash_sessions!inner(culto_evento, church_id, date_session)
        `)
        .eq('cash_sessions.church_id', churchId)
        .gte('cash_sessions.date_session', startDate)
        .lte('cash_sessions.date_session', endDate)
        .order('created_at', { ascending: true });

      if (pixError) {
        console.error('Erro ao buscar PIX:', pixError);
        throw pixError;
      }

      console.log('Entradas PIX encontradas:', pixEntries?.length || 0);

      // Calcular saldo inicial
      const { data: prevTransactions } = await supabase
        .from('transactions')
        .select(`
          amount,
          type,
          cash_sessions!inner(church_id)
        `)
        .eq('cash_sessions.church_id', churchId)
        .lt('date_transaction', startDate);

      const { data: prevPixEntries } = await supabase
        .from('pix_entries')
        .select(`
          amount,
          cash_sessions!inner(church_id, date_session)
        `)
        .eq('cash_sessions.church_id', churchId)
        .lt('cash_sessions.date_session', startDate);

      // Calcular saldo inicial
      let prevBalance = 0;
      
      if (prevTransactions) {
        prevBalance += prevTransactions.reduce((acc, trans) => {
          const amount = Number(trans.amount) || 0;
          return acc + (trans.type === 'entrada' ? amount : -amount);
        }, 0);
      }
      
      if (prevPixEntries) {
        prevBalance += prevPixEntries.reduce((acc, pix) => {
          return acc + (Number(pix.amount) || 0);
        }, 0);
      }

      console.log('Saldo inicial calculado:', prevBalance);
      setInitialBalance(prevBalance);

      // Processar entradas do livro caixa
      const cashBookEntries: CashBookEntry[] = [];
      let runningBalance = prevBalance;

      // Adicionar transações
      if (transactions) {
        transactions.forEach(trans => {
          const amount = Number(trans.amount) || 0;
          const balanceChange = trans.type === 'entrada' ? amount : -amount;
          runningBalance += balanceChange;
          
          cashBookEntries.push({
            date: trans.date_transaction,
            description: trans.description || 'Sem descrição',
            type: trans.type,
            amount: amount,
            balance: runningBalance,
            session: trans.cash_sessions?.culto_evento || 'N/A',
            category: trans.category || undefined
          });
        });
      }

      // Adicionar entradas PIX
      if (pixEntries) {
        pixEntries.forEach(pix => {
          const amount = Number(pix.amount) || 0;
          runningBalance += amount;
          
          cashBookEntries.push({
            date: pix.cash_sessions?.date_session || pix.created_at.split('T')[0],
            description: `PIX: ${pix.description || 'Entrada'}`,
            type: 'entrada',
            amount: amount,
            balance: runningBalance,
            session: pix.cash_sessions?.culto_evento || 'N/A'
          });
        });
      }

      // Ordenar por data
      cashBookEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      console.log('Entradas processadas:', cashBookEntries.length);
      setEntries(cashBookEntries);
      
      if (cashBookEntries.length === 0) {
        toast.info('Nenhuma transação encontrada para o período selecionado');
      } else {
        toast.success(`Relatório gerado com sucesso! ${cashBookEntries.length} registros encontrados.`);
      }
      
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
    generateReport
  };
};
