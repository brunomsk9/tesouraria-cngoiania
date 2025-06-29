
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

export const buildExitTransactions = (
  currentSession: CashSession,
  selectedVolunteers: SelectedVolunteer[],
  saidas: { valor_seguranca: number },
  otherExpenses: OtherExpense[],
  profileId: string
) => {
  const transactions = [];

  // Adicionar transações dos voluntários
  selectedVolunteers.forEach(volunteer => {
    if (volunteer.amount > 0) {
      transactions.push({
        cash_session_id: currentSession.id,
        type: 'saida' as const,
        description: `Pagamento Voluntário: ${volunteer.name}`,
        amount: volunteer.amount,
        date_transaction: currentSession.date_session,
        culto_evento: currentSession.culto_evento,
        user_id: profileId
      });
    }
  });

  // Adicionar pagamento de segurança
  if (saidas.valor_seguranca > 0) {
    transactions.push({
      cash_session_id: currentSession.id,
      type: 'saida' as const,
      description: 'Pagamento Segurança',
      amount: saidas.valor_seguranca,
      date_transaction: currentSession.date_session,
      culto_evento: currentSession.culto_evento,
      valor_seguranca: saidas.valor_seguranca,
      user_id: profileId
    });
  }

  // Adicionar outros gastos (múltiplos)
  otherExpenses.forEach(expense => {
    if (expense.amount > 0) {
      transactions.push({
        cash_session_id: currentSession.id,
        type: 'saida' as const,
        description: expense.description,
        amount: expense.amount,
        date_transaction: currentSession.date_session,
        culto_evento: currentSession.culto_evento,
        outros_gastos: expense.amount,
        user_id: profileId
      });
    }
  });

  return transactions;
};
