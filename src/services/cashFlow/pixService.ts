
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

interface PixEntry {
  id: string;
  amount: number;
  description: string;
  data_pix: string;
}

export const savePixEntries = async (
  currentSession: CashSession,
  pixEntries: PixEntry[]
): Promise<boolean> => {
  try {
    // Salvar entradas PIX na tabela pix_entries
    if (pixEntries.length > 0) {
      const pixData = pixEntries.map(pix => ({
        cash_session_id: currentSession.id,
        amount: pix.amount,
        description: pix.description || 'Entrada PIX',
        data_pix: pix.data_pix
      }));

      const { error: pixError } = await supabase
        .from('pix_entries')
        .insert(pixData);

      if (pixError) {
        console.error('Erro ao salvar entradas PIX:', pixError);
        toast.error('Erro ao salvar entradas PIX');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar entradas PIX:', error);
    toast.error('Erro ao salvar entradas PIX');
    return false;
  }
};
