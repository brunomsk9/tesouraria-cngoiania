
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TransactionSummary {
  total_entradas: number;
  total_saidas: number;
  total_pix: number;
  saldo: number;
  count_transactions: number;
  count_pix: number;
}

export const useTransactionSummary = (sessionId: string) => {
  const [summary, setSummary] = useState<TransactionSummary | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadTransactionSummary();
    }
  }, [sessionId]);

  const loadTransactionSummary = async () => {
    // Carregar transações tradicionais
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('cash_session_id', sessionId);

    if (transError) {
      console.error('Erro ao carregar transações:', transError);
      return;
    }

    // Carregar entradas PIX
    const { data: pixEntries, error: pixError } = await supabase
      .from('pix_entries')
      .select('amount')
      .eq('cash_session_id', sessionId);

    if (pixError) {
      console.error('Erro ao carregar PIX:', pixError);
      return;
    }

    const entradas = transactions?.filter(t => t.type === 'entrada').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const saidas = transactions?.filter(t => t.type === 'saida').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const totalPix = pixEntries?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    
    const totalEntradas = entradas + totalPix;

    setSummary({
      total_entradas: totalEntradas,
      total_saidas: saidas,
      total_pix: totalPix,
      saldo: totalEntradas - saidas,
      count_transactions: transactions?.length || 0,
      count_pix: pixEntries?.length || 0
    });
  };

  return { summary };
};
