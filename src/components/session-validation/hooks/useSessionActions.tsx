
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSessionActions = (sessionId: string, onSessionValidated: () => void) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

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
        .eq('id', sessionId);

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
        .eq('id', sessionId);

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
        .eq('id', sessionId);

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
    validateSession,
    closeSession,
    rejectValidation
  };
};
