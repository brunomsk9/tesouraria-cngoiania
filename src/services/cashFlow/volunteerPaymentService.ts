
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

interface SelectedVolunteer {
  id: string;
  name: string;
  amount: number;
}

interface VolunteerPayment {
  id: string;
  cash_session_id: string;
  volunteer_id: string;
  volunteer_name: string;
  amount: number;
  status: 'pendente' | 'pago';
  paid_at: string | null;
  paid_by: string | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
  cash_sessions: {
    id: string;
    date_session: string;
    culto_evento: string;
    church_id: string;
  };
}

export const saveVolunteerPayments = async (
  currentSession: CashSession,
  selectedVolunteers: SelectedVolunteer[],
  profileId: string
): Promise<boolean> => {
  if (selectedVolunteers.length === 0) {
    return true; // Nada para salvar
  }

  try {
    console.log('Salvando pagamentos de voluntários:', selectedVolunteers);

    // Preparar dados dos pagamentos
    const volunteerPayments = selectedVolunteers.map(volunteer => ({
      cash_session_id: currentSession.id,
      volunteer_id: volunteer.id,
      volunteer_name: volunteer.name,
      amount: volunteer.amount,
      status: 'pendente' as const
    }));

    // Usar rpc ou query direta para contornar problema de tipos
    const { data: payments, error: paymentsError } = await supabase
      .from('volunteer_payments' as any)
      .insert(volunteerPayments)
      .select();

    if (paymentsError) {
      console.error('Erro ao salvar pagamentos de voluntários:', paymentsError);
      toast.error('Erro ao salvar pagamentos de voluntários');
      return false;
    }

    console.log('Pagamentos de voluntários salvos:', payments);
    return true;
  } catch (error) {
    console.error('Erro geral ao salvar pagamentos de voluntários:', error);
    toast.error('Erro ao salvar pagamentos de voluntários');
    return false;
  }
};

export const updateVolunteerPaymentStatus = async (
  paymentId: string,
  status: 'pendente' | 'pago'
): Promise<boolean> => {
  try {
    const currentUser = await supabase.auth.getUser();
    
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (status === 'pago') {
      updateData.paid_at = new Date().toISOString();
      updateData.paid_by = currentUser.data.user?.id;
    } else {
      updateData.paid_at = null;
      updateData.paid_by = null;
    }

    const { error } = await supabase
      .from('volunteer_payments' as any)
      .update(updateData)
      .eq('id', paymentId);

    if (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
      toast.error('Erro ao atualizar status do pagamento');
      return false;
    }

    toast.success(`Pagamento marcado como ${status === 'pago' ? 'pago' : 'pendente'}`);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status do pagamento:', error);
    toast.error('Erro ao atualizar status do pagamento');
    return false;
  }
};

export const loadVolunteerPayments = async (churchId: string): Promise<VolunteerPayment[]> => {
  try {
    // Fazer query manual para contornar problema de tipos
    const { data: payments, error } = await supabase
      .from('volunteer_payments' as any)
      .select(`
        *,
        cash_sessions!inner(
          id,
          date_session,
          culto_evento,
          church_id
        )
      `)
      .eq('cash_sessions.church_id', churchId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar pagamentos de voluntários:', error);
      return [];
    }

    return (payments || []) as VolunteerPayment[];
  } catch (error) {
    console.error('Erro ao carregar pagamentos de voluntários:', error);
    return [];
  }
};
