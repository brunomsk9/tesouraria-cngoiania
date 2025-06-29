
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PendingPayment {
  id: string;
  session_id: string;
  volunteer_name: string;
  amount: number;
  session_date: string;
  culto_evento: string;
  paid: boolean;
  paid_at?: string;
}

export const PendingPayments = () => {
  const { profile } = useAuth();
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.church_id) {
      loadPendingPayments();
    }
  }, [profile]);

  const loadPendingPayments = async () => {
    if (!profile?.church_id) return;
    
    setLoading(true);
    try {
      // Buscar transações de voluntários que podem ter ficado pendentes
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          description,
          date_transaction,
          culto_evento,
          cash_session_id,
          cash_sessions!inner(id, date_session, church_id)
        `)
        .eq('cash_sessions.church_id', profile.church_id)
        .eq('type', 'saida')
        .like('description', 'Pagamento Voluntário:%')
        .order('date_transaction', { ascending: false });

      if (error) throw error;

      // Simular pagamentos pendentes baseados nas transações
      // Em uma implementação real, você teria uma tabela específica para isso
      const payments: PendingPayment[] = transactions?.map(t => ({
        id: t.id,
        session_id: t.cash_session_id || '',
        volunteer_name: t.description.replace('Pagamento Voluntário: ', ''),
        amount: Number(t.amount),
        session_date: t.date_transaction,
        culto_evento: t.culto_evento || '',
        paid: false // Por enquanto, assumindo que não foi pago
      })) || [];

      setPendingPayments(payments);
    } catch (error) {
      console.error('Erro ao carregar pagamentos pendentes:', error);
      toast.error('Erro ao carregar pagamentos pendentes');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (paymentId: string) => {
    try {
      // Atualizar o status do pagamento
      // Em uma implementação real, você atualizaria uma tabela de pagamentos pendentes
      setPendingPayments(prev => 
        prev.map(p => 
          p.id === paymentId 
            ? { ...p, paid: true, paid_at: new Date().toISOString() }
            : p
        )
      );
      
      toast.success('Pagamento marcado como realizado!');
    } catch (error) {
      console.error('Erro ao marcar pagamento:', error);
      toast.error('Erro ao marcar pagamento como realizado');
    }
  };

  const unpaidPayments = pendingPayments.filter(p => !p.paid);
  const paidPayments = pendingPayments.filter(p => p.paid);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
          <CardTitle className="flex items-center gap-3">
            <Clock className="h-6 w-6" />
            Pagamentos Pendentes de Voluntários
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {unpaidPayments.length === 0 ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Nenhum pagamento pendente</AlertTitle>
              <AlertDescription className="text-green-700">
                Todos os pagamentos de voluntários estão em dia!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Pagamentos em Aberto ({unpaidPayments.length})
                </h3>
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  Total: R$ {unpaidPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
              </div>
              
              {unpaidPayments.map((payment) => (
                <Card key={payment.id} className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{payment.volunteer_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(payment.session_date).toLocaleDateString('pt-BR')}
                          </span>
                          <span>{payment.culto_evento}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-700">
                            R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <Button
                          onClick={() => markAsPaid(payment.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Marcar como Pago
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {paidPayments.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardTitle className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6" />
              Pagamentos Realizados ({paidPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {paidPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-800">{payment.volunteer_name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Sessão: {new Date(payment.session_date).toLocaleDateString('pt-BR')}</span>
                      <span>Pago em: {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('pt-BR') : ''}</span>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-green-700">
                    R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
