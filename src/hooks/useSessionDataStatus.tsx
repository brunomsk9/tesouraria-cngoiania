
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SessionDataStatus {
  entriesSaved: boolean;
  pixSaved: boolean;
  exitsSaved: boolean;
  loading: boolean;
}

export const useSessionDataStatus = (sessionId: string | null): SessionDataStatus => {
  const [status, setStatus] = useState<SessionDataStatus>({
    entriesSaved: false,
    pixSaved: false,
    exitsSaved: false,
    loading: true
  });

  useEffect(() => {
    if (!sessionId) {
      setStatus({
        entriesSaved: false,
        pixSaved: false,
        exitsSaved: false,
        loading: false
      });
      return;
    }

    checkDataStatus();
  }, [sessionId]);

  const checkDataStatus = async () => {
    if (!sessionId) return;

    try {
      setStatus(prev => ({ ...prev, loading: true }));

      // Verificar se existem transações de entrada salvas
      const { data: entriesData, error: entriesError } = await supabase
        .from('transactions')
        .select('id')
        .eq('cash_session_id', sessionId)
        .eq('type', 'entrada')
        .in('category', ['dinheiro', 'cartao_debito', 'cartao_credito']);

      if (entriesError) {
        console.error('Erro ao verificar entradas:', entriesError);
      }

      // Verificar se existem entradas PIX salvas
      const { data: pixData, error: pixError } = await supabase
        .from('pix_entries')
        .select('id')
        .eq('cash_session_id', sessionId);

      if (pixError) {
        console.error('Erro ao verificar PIX:', pixError);
      }

      // Verificar se existem saídas salvas (verificar tanto transactions quanto volunteer_payments)
      const { data: exitsData, error: exitsError } = await supabase
        .from('transactions')
        .select('id')
        .eq('cash_session_id', sessionId)
        .eq('type', 'saida');

      if (exitsError) {
        console.error('Erro ao verificar saídas:', exitsError);
      }

      const { data: volunteerPaymentsData, error: volunteerError } = await supabase
        .from('volunteer_payments')
        .select('id')
        .eq('cash_session_id', sessionId);

      if (volunteerError) {
        console.error('Erro ao verificar pagamentos de voluntários:', volunteerError);
      }

      setStatus({
        entriesSaved: (entriesData?.length || 0) > 0,
        pixSaved: (pixData?.length || 0) > 0,
        exitsSaved: (exitsData?.length || 0) > 0 || (volunteerPaymentsData?.length || 0) > 0,
        loading: false
      });

    } catch (error) {
      console.error('Erro ao verificar status dos dados:', error);
      setStatus({
        entriesSaved: false,
        pixSaved: false,
        exitsSaved: false,
        loading: false
      });
    }
  };

  return status;
};
