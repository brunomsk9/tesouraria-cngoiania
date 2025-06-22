
import { supabase } from '@/integrations/supabase/client';
import { SessionDetails } from '@/types/cashBook';

export const getSessionDetails = async (
  churchId: string, 
  startDate: string, 
  endDate: string
): Promise<SessionDetails> => {
  try {
    const { data: sessions, error } = await supabase
      .from('cash_sessions')
      .select(`
        culto_evento,
        date_session,
        created_by,
        validated_by
      `)
      .eq('church_id', churchId)
      .gte('date_session', startDate)
      .lte('date_session', endDate)
      .order('date_session', { ascending: true });

    if (error) throw error;

    // Buscar nomes dos tesoureiros separadamente
    const userIds = [...new Set([
      ...sessions?.map(s => s.created_by).filter(Boolean) || [],
      ...sessions?.map(s => s.validated_by).filter(Boolean) || []
    ])];

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', userIds);

    if (profilesError) throw profilesError;

    // Mapear nomes para IDs
    const profileMap = profiles?.reduce((acc, profile) => {
      acc[profile.id] = profile.name;
      return acc;
    }, {} as Record<string, string>) || {};

    return {
      sessions: sessions || [],
      profileMap
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes das sessões:', error);
    return {
      sessions: [],
      profileMap: {}
    };
  }
};
