
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
}

interface SelectedVolunteer {
  id: string;
  name: string;
  amount: number;
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
  if (!churchId || !sessionData.culto_evento) {
    toast.error('Preencha todos os campos obrigatórios');
    return null;
  }

  const { data, error } = await supabase
    .from('cash_sessions')
    .insert({
      church_id: churchId,
      date_session: sessionData.date_session,
      culto_evento: sessionData.culto_evento,
      created_by: profileId
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar sessão:', error);
    toast.error('Erro ao criar sessão de caixa');
    return null;
  }

  toast.success('Sessão criada com sucesso!');
  return data;
};

export const saveEntradas = async (
  currentSession: CashSession,
  entradas: { dinheiro: number; cartao_debito: number; cartao_credito: number },
  pixEntries: PixEntry[],
  profileId: string
): Promise<boolean> => {
  try {
    // Salvar transações tradicionais (dinheiro, cartão débito, cartão crédito)
    const transactions = [
      {
        cash_session_id: currentSession.id,
        type: 'entrada' as const,
        category: 'dinheiro' as const,
        description: 'Entrada em Dinheiro',
        amount: entradas.dinheiro,
        date_transaction: currentSession.date_session,
        culto_evento: currentSession.culto_evento,
        user_id: profileId
      },
      {
        cash_session_id: currentSession.id,
        type: 'entrada' as const,
        category: 'cartao_debito' as const,
        description: 'Entrada Cartão Débito',
        amount: entradas.cartao_debito,
        date_transaction: currentSession.date_session,
        culto_evento: currentSession.culto_evento,
        user_id: profileId
      },
      {
        cash_session_id: currentSession.id,
        type: 'entrada' as const,
        category: 'cartao_credito' as const,
        description: 'Entrada Cartão Crédito',
        amount: entradas.cartao_credito,
        date_transaction: currentSession.date_session,
        culto_evento: currentSession.culto_evento,
        user_id: profileId
      }
    ].filter(t => t.amount > 0);

    if (transactions.length > 0) {
      const { error: transError } = await supabase
        .from('transactions')
        .insert(transactions);

      if (transError) {
        console.error('Erro ao salvar transações:', transError);
        toast.error('Erro ao salvar transações tradicionais');
        return false;
      }
    }

    // Salvar entradas PIX na tabela pix_entries
    if (pixEntries.length > 0) {
      const pixData = pixEntries.map(pix => ({
        cash_session_id: currentSession.id,
        amount: pix.amount,
        description: pix.description || 'Entrada PIX'
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

  if (transactions.length === 0) {
    toast.error('Adicione pelo menos uma saída');
    return false;
  }

  const { error } = await supabase
    .from('transactions')
    .insert(transactions);

  if (error) {
    console.error('Erro ao salvar saídas:', error);
    toast.error('Erro ao salvar saídas');
    return false;
  }

  toast.success('Saídas salvas com sucesso!');
  return true;
};
