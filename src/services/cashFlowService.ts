
import { loadSessions, createNewSession } from './cashFlow/sessionService';
import { saveTransactionEntries, saveTransactionExits } from './cashFlow/transactionService';
import { savePixEntries } from './cashFlow/pixService';
import { buildExitTransactions } from './cashFlow/exitTransactionBuilder';
import { saveVolunteerPayments } from './cashFlow/volunteerPaymentService';
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

interface OtherExpense {
  id: string;
  amount: number;
  description: string;
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
  saidas: { valor_seguranca: number },
  otherExpenses: OtherExpense[],
  profileId: string
): Promise<boolean> => {
  try {
    // Salvar pagamentos de voluntários na nova tabela
    const volunteerPaymentsSuccess = await saveVolunteerPayments(currentSession, selectedVolunteers, profileId);
    if (!volunteerPaymentsSuccess) return false;

    // Salvar transações tradicionais (segurança e outros gastos)
    const transactions = buildExitTransactions(currentSession, selectedVolunteers, saidas, otherExpenses, profileId);
    const transactionsSuccess = await saveTransactionExits(currentSession, transactions);
    if (!transactionsSuccess) return false;

    toast.success('Saídas salvas com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro geral ao salvar saídas:', error);
    toast.error('Erro ao salvar saídas');
    return false;
  }
};
