
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PendingPaymentsInfo {
  hasPendingPayments: boolean;
  totalPending: number;
  details: string[];
}

export const usePendingPayments = (sessionId: string) => {
  const [pendingPaymentsInfo, setPendingPaymentsInfo] = useState<PendingPaymentsInfo>({ 
    hasPendingPayments: false, 
    totalPending: 0, 
    details: [] 
  });

  useEffect(() => {
    if (sessionId) {
      checkPendingPayments();
    }
  }, [sessionId]);

  const checkPendingPayments = async () => {
    // Carregar transações para verificar dinheiro vs saídas
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('type, amount, category, description')
      .eq('cash_session_id', sessionId);

    if (transError) {
      console.error('Erro ao carregar transações para verificação:', transError);
      return;
    }

    const dinheiroEntrada = transactions
      ?.filter(t => t.type === 'entrada' && t.category === 'dinheiro')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const totalSaidas = transactions
      ?.filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    if (totalSaidas > dinheiroEntrada) {
      const deficit = totalSaidas - dinheiroEntrada;
      const saidasDetails = transactions
        ?.filter(t => t.type === 'saida')
        .map(t => `${t.description}: R$ ${Number(t.amount).toFixed(2)}`) || [];

      setPendingPaymentsInfo({
        hasPendingPayments: true,
        totalPending: deficit,
        details: saidasDetails
      });
    }
  };

  return { pendingPaymentsInfo };
};
