
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CashSession {
  id: string;
  date_session: string;
  culto_evento: string;
  status: string;
  church_id: string;
  created_by: string;
  validated_by: string | null;
  validated_at: string | null;
}

export const saveTransactionEntries = async (
  currentSession: CashSession,
  entradas: { dinheiro: number; cartao_debito: number; cartao_credito: number },
  profileId: string
): Promise<boolean> => {
  try {
    // Salvar transações tradicionais (dinheiro, cartão débito, cartão crédito)
    const transactions = [
      {
        cash_session_id: currentSession.id,
        type: 'entrada' as const,
        category: 'dinheiro' as const,
        description: 'Entrada em Dinheiro',
        amount: entradas.dinheiro,
        date_transaction: currentSession.date_session,
        culto_evento: currentSession.culto_evento,
        user_id: profileId
      },
      {
        cash_session_id: currentSession.id,
        type: 'entrada' as const,
        category: 'cartao_debito' as const,
        description: 'Entrada Cartão Débito',
        amount: entradas.cartao_debito,
        date_transaction: currentSession.date_session,
        culto_evento: currentSession.culto_evento,
        user_id: profileId
      },
      {
        cash_session_id: currentSession.id,
        type: 'entrada' as const,
        category: 'cartao_credito' as const,
        description: 'Entrada Cartão Crédito',
        amount: entradas.cartao_credito,
        date_transaction: currentSession.date_session,
        culto_evento: currentSession.culto_evento,
        user_id: profileId
      }
    ].filter(t => t.amount > 0);

    if (transactions.length > 0) {
      const { error: transError } = await supabase
        .from('transactions')
        .insert(transactions);

      if (transError) {
        console.error('Erro ao salvar transações:', transError);
        toast.error('Erro ao salvar transações tradicionais');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar transações:', error);
    toast.error('Erro ao salvar transações');
    return false;
  }
};

export const saveTransactionExits = async (
  currentSession: CashSession,
  transactions: Array<{
    cash_session_id: string;
    type: 'saida';
    description: string;
    amount: number;
    date_transaction: string;
    culto_evento: string;
    user_id: string;
    valor_seguranca?: number;
    outros_gastos?: number;
  }>
): Promise<boolean> => {
  if (transactions.length === 0) {
    toast.error('Adicione pelo menos uma saída');
    return false;
  }

  const { error } = await supabase
    .from('transactions')
    .insert(transactions);

  if (error) {
    console.error('Erro ao salvar saídas:', error);
    toast.error('Erro ao salvar saídas');
    return false;
  }

  toast.success('Saídas salvas com sucesso!');
  return true;
};
