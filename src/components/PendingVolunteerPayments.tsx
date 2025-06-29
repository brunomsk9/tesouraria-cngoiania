
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, CheckCircle, Clock, DollarSign, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PendingVolunteerPayment {
  id: string;
  session_id: string;
  volunteer_name: string;
  amount: number;
  session_date: string;
  culto_evento: string;
  transaction_id: string;
}

export const PendingVolunteerPayments = () => {
  const { profile } = useAuth();
  const [pendingPayments, setPendingPayments] = useState<PendingVolunteerPayment[]>([]);
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
      // Buscar transações de voluntários das últimas sessões
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          id,
          amount,
          description,
          date_transaction,
          culto_evento,
          cash_session_id,
          cash_sessions!inner(id, date_session, church_id, status)
        `)
        .eq('cash_sessions.church_id', profile.church_id)
        .eq('type', 'saida')
        .like('description', 'Pagamento Voluntário:%')
        .gte('date_transaction', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // últimos 30 dias
        .order('date_transaction', { ascending: false });

      if (error) throw error;

      // Transformar em formato de pagamentos pendentes
      const payments: PendingVolunteerPayment[] = transactions?.map(t => ({
        id: `${t.cash_session_id}-${t.id}`,
        session_id: t.cash_session_id || '',
        volunteer_name: t.description.replace('Pagamento Voluntário: ', ''),
        amount: Number(t.amount),
        session_date: t.date_transaction,
        culto_evento: t.culto_evento || '',
        transaction_id: t.id
      })) || [];

      setPendingPayments(payments);
    } catch (error) {
      console.error('Erro ao carregar pagamentos de voluntários:', error);
      toast.error('Erro ao carregar pagamentos de voluntários');
    } finally {
      setLoading(false);
    }
  };

  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Pagamentos de Voluntários</h1>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          Últimos 30 dias
        </Badge>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
          <CardTitle className="flex items-center gap-3">
            <Users className="h-6 w-6" />
            Registros de Pagamentos ({pendingPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {pendingPayments.length === 0 ? (
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Nenhum pagamento registrado</AlertTitle>
              <AlertDescription className="text-blue-700">
                Não há registros de pagamentos para voluntários nos últimos 30 dias.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                  <span className="text-lg font-semibold text-gray-800">
                    Total: R$ {totalPendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Badge variant="outline" className="text-sm">
                  {pendingPayments.length} pagamento{pendingPayments.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Informação Importante</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Esta lista mostra os pagamentos de voluntários registrados no sistema. 
                  Para controlar se foram efetivamente pagos, você pode usar a funcionalidade de 
                  "Pagamentos Pendentes" no menu principal.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4">
                {pendingPayments.map((payment) => (
                  <Card key={payment.id} className="border-orange-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-orange-600" />
                            {payment.volunteer_name}
                          </h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(payment.session_date).toLocaleDateString('pt-BR')}
                            </span>
                            {payment.culto_evento && (
                              <span className="text-gray-500">{payment.culto_evento}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-orange-600">
                            R$ {payment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <Badge variant="outline" className="mt-1 text-xs">
                            Sessão: {new Date(payment.session_date).toLocaleDateString('pt-BR')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Como usar esta informação:
                </h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Esta lista mostra todos os pagamentos de voluntários registrados no sistema</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Para marcar pagamentos como "realizados", use a funcionalidade "Pagamentos Pendentes"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Você pode exportar estas informações através dos relatórios</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
