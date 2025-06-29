
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

export const buildExitTransactions = (
  currentSession: CashSession,
  selectedVolunteers: SelectedVolunteer[],
  saidas: { valor_seguranca: number; outros_gastos: number; outros_descricao: string },
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

  // Adicionar outras saídas
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

  if (saidas.outros_gastos > 0) {
    transactions.push({
      cash_session_id: currentSession.id,
      type: 'saida' as const,
      description: saidas.outros_descricao || 'Outros Gastos',
      amount: saidas.outros_gastos,
      date_transaction: currentSession.date_session,
      culto_evento: currentSession.culto_evento,
      outros_gastos: saidas.outros_gastos,
      user_id: profileId
    });
  }

  return transactions;
};
