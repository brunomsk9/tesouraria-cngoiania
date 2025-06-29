
import { loadSessions, createNewSession } from './cashFlow/sessionService';
import { saveTransactionEntries, saveTransactionExits } from './cashFlow/transactionService';
import { savePixEntries } from './cashFlow/pixService';
import { buildExitTransactions } from './cashFlow/exitTransactionBuilder';
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

interface SelectedVolunteer {
  id: string;
  name: string;
  amount: number;
}

// Re-export session functions
export { loadSessions, createNewSession };

export const saveEntradas = async (
  currentSession: CashSession,
  entradas: { dinheiro: number; cartao_debito: number; cartao_credito: number },
  pixEntries: PixEntry[],
  profileId: string
): Promise<boolean> => {
  try {
    // Save traditional transactions
    const transactionSuccess = await saveTransactionEntries(currentSession, entradas, profileId);
    if (!transactionSuccess) return false;

    // Save PIX entries
    const pixSuccess = await savePixEntries(currentSession, pixEntries);
    if (!pixSuccess) return false;

    toast.success('Entradas salvas com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro geral ao salvar entradas:', error);
    toast.error('Erro ao salvar entradas');
    return false;
  }
};

export const saveSaidas = async (
  currentSession: CashSession,
  selectedVolunteers: SelectedVolunteer[],
  saidas: { valor_seguranca: number; outros_gastos: number; outros_descricao: string },
  profileId: string
): Promise<boolean> => {
  const transactions = buildExitTransactions(currentSession, selectedVolunteers, saidas, profileId);
  return await saveTransactionExits(currentSession, transactions);
};
