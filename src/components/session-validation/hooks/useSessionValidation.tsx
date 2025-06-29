
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
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

interface TransactionSummary {
  total_entradas: number;
  total_saidas: number;
  total_pix: number;
  saldo: number;
  count_transactions: number;
  count_pix: number;
}

interface PendingPaymentsInfo {
  hasPendingPayments: boolean;
  totalPending: number;
  details: string[];
}

export const useSessionValidation = (session: CashSession, onSessionValidated: () => void) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [canValidate, setCanValidate] = useState(false);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [creatorName, setCreatorName] = useState<string>('');
  const [validatorName, setValidatorName] = useState<string>('');
  const [pendingPaymentsInfo, setPendingPaymentsInfo] = useState<PendingPaymentsInfo>({ 
    hasPendingPayments: false, 
    totalPending: 0, 
    details: [] 
  });

  useEffect(() => {
    checkValidationPermission();
    loadTransactionSummary();
    loadCreatorName();
    loadValidatorName();
    checkPendingPayments();
  }, [session.id, profile?.id]);

  const checkValidationPermission = async () => {
    if (!profile?.id || !session.id) return;

    const { data, error } = await supabase.rpc('can_validate_session', {
      session_id: session.id,
      user_id: profile.id
    });

    if (error) {
      console.error('Erro ao verificar permissão:', error);
      return;
    }

    setCanValidate(data);
  };

  const loadTransactionSummary = async () => {
    // Carregar transações tradicionais
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('cash_session_id', session.id);

    if (transError) {
      console.error('Erro ao carregar transações:', transError);
      return;
    }

    // Carregar entradas PIX
    const { data: pixEntries, error: pixError } = await supabase
      .from('pix_entries')
      .select('amount')
      .eq('cash_session_id', session.id);

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

  const checkPendingPayments = async () => {
    // Carregar transações para verificar dinheiro vs saídas
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('type, amount, category, description')
      .eq('cash_session_id', session.id);

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

  const loadCreatorName = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', session.created_by)
      .single();

    if (error) {
      console.error('Erro ao carregar nome do criador:', error);
      return;
    }

    setCreatorName(data?.name || 'Usuário desconhecido');
  };

  const loadValidatorName = async () => {
    if (!session.validated_by) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', session.validated_by)
      .single();

    if (error) {
      console.error('Erro ao carregar nome do validador:', error);
      return;
    }

    setValidatorName(data?.name || 'Usuário desconhecido');
  };

  const validateSession = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cash_sessions')
        .update({
          status: 'validado',
          validated_by: profile.id,
          validated_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;

      toast.success('Sessão validada com sucesso! Todos os campos foram travados.');
      onSessionValidated();
    } catch (error: any) {
      console.error('Erro ao validar sessão:', error);
      toast.error('Erro ao validar sessão: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeSession = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cash_sessions')
        .update({
          status: 'fechado',
          validated_by: profile.id,
          validated_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;

      toast.success('Sessão encerrada com sucesso! Nenhuma alteração pode ser feita.');
      onSessionValidated();
    } catch (error: any) {
      console.error('Erro ao encerrar sessão:', error);
      toast.error('Erro ao encerrar sessão: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const rejectValidation = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cash_sessions')
        .update({
          status: 'aberto'
        })
        .eq('id', session.id);

      if (error) throw error;

      toast.info('Validação recusada. A sessão voltou para edição.');
      onSessionValidated();
    } catch (error: any) {
      console.error('Erro ao recusar validação:', error);
      toast.error('Erro ao recusar validação: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    canValidate,
    summary,
    creatorName,
    validatorName,
    pendingPaymentsInfo,
    validateSession,
    closeSession,
    rejectValidation
  };
};
