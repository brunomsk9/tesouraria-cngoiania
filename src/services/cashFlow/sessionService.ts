
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

export const loadSessions = async (churchId: string): Promise<CashSession[]> => {
  const { data, error } = await supabase
    .from('cash_sessions')
    .select('*')
    .eq('church_id', churchId)
    .order('date_session', { ascending: false });

  if (error) {
    console.error('Erro ao carregar sessões:', error);
    return [];
  }

  return data || [];
};

export const createNewSession = async (
  churchId: string,
  profileId: string,
  sessionData: { date_session: string; culto_evento: string }
): Promise<CashSession | null> => {
  console.log('=== CRIANDO SESSÃO NO BANCO ===');
  console.log('Dados recebidos:', { churchId, profileId, sessionData });
  
  if (!churchId || !sessionData.culto_evento) {
    toast.error('Preencha todos os campos obrigatórios');
    return null;
  }

  if (!sessionData.date_session) {
    toast.error('Data da sessão é obrigatória');
    return null;
  }

  try {
    // CRÍTICO: Manter a data exatamente como recebida, sem nenhuma conversão
    const sessionDateString = sessionData.date_session;
    
    console.log('Data que será salva no banco (sem conversão):', sessionDateString);
    console.log('Tipo da data:', typeof sessionDateString);
    
    const { data, error } = await supabase
      .from('cash_sessions')
      .insert({
        church_id: churchId,
        date_session: sessionDateString, // Usar string diretamente
        culto_evento: sessionData.culto_evento,
        created_by: profileId
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar sessão:', error);
      toast.error('Erro ao criar sessão de caixa: ' + error.message);
      return null;
    }

    console.log('Sessão criada no banco:', data);
    console.log('Data da sessão retornada do banco:', data.date_session);
    toast.success('Sessão criada com sucesso!');
    return data;
  } catch (error) {
    console.error('Erro inesperado ao criar sessão:', error);
    toast.error('Erro inesperado ao criar sessão');
    return null;
  }
};
