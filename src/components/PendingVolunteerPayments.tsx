
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, CheckCircle, Clock, DollarSign, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { loadVolunteerPayments, updateVolunteerPaymentStatus } from '@/services/cashFlow/volunteerPaymentService';
import { toast } from 'sonner';

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

export const PendingVolunteerPayments = () => {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<VolunteerPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.church_id) {
      loadPayments();
    }
  }, [profile]);

  const loadPayments = async () => {
    if (!profile?.church_id) return;
    
    setLoading(true);
    try {
      const paymentsData = await loadVolunteerPayments(profile.church_id);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      toast.error('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (paymentId: string, newStatus: 'pendente' | 'pago') => {
    const success = await updateVolunteerPaymentStatus(paymentId, newStatus);
    if (success) {
      await loadPayments(); // Recarregar dados
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pendente');
  const paidPayments = payments.filter(p => p.status === 'pago');
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaidAmount = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);

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
        <div className="flex gap-2">
          <Badge variant="destructive" className="text-sm px-3 py-1">
            Pendentes: {pendingPayments.length}
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            Pagos: {paidPayments.length}
          </Badge>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Total Pendente</p>
                <p className="text-2xl font-bold text-orange-800">
                  R$ {totalPendingAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Total Pago</p>
                <p className="text-2xl font-bold text-green-800">
                  R$ {totalPaidAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pagamentos Pendentes */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
          <CardTitle className="flex items-center gap-3">
            <Clock className="h-6 w-6" />
            Pagamentos Pendentes ({pendingPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {pendingPayments.length === 0 ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Nenhum pagamento pendente</AlertTitle>
              <AlertDescription className="text-green-700">
                Todos os pagamentos de voluntários estão em dia!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
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
                            {new Date(payment.cash_sessions.date_session).toLocaleDateString('pt-BR')}
                          </span>
                          {payment.cash_sessions.culto_evento && (
                            <span className="text-gray-500">{payment.cash_sessions.culto_evento}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xl font-bold text-orange-600">
                            R$ {Number(payment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <Badge variant="outline" className="mt-1 text-xs text-orange-600">
                            Pendente
                          </Badge>
                        </div>
                        <Button
                          onClick={() => handleStatusUpdate(payment.id, 'pago')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
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

      {/* Pagamentos Realizados */}
      {paidPayments.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardTitle className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6" />
              Pagamentos Realizados ({paidPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {paidPayments.map((payment) => (
                <Card key={payment.id} className="border-green-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-green-600" />
                          {payment.volunteer_name}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(payment.cash_sessions.date_session).toLocaleDateString('pt-BR')}
                          </span>
                          {payment.cash_sessions.culto_evento && (
                            <span className="text-gray-500">{payment.cash_sessions.culto_evento}</span>
                          )}
                          {payment.paid_at && (
                            <span className="text-green-600 text-xs">
                              Pago em {new Date(payment.paid_at).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            R$ {Number(payment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <Badge variant="outline" className="mt-1 text-xs text-green-600">
                            Pago
                          </Badge>
                        </div>
                        <Button
                          onClick={() => handleStatusUpdate(payment.id, 'pendente')}
                          variant="outline"
                          size="sm"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Marcar como Pendente
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
