
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TrendingUp, AlertTriangle } from 'lucide-react';

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

interface PendingPayment {
  id: string;
  name: string;
  amount: number;
  type: 'volunteer' | 'security' | 'others';
}

interface ResumoTabProps {
  entradas: {
    dinheiro: number;
    cartao_debito: number;
    cartao_credito: number;
  };
  pixEntries: PixEntry[];
  selectedVolunteers: SelectedVolunteer[];
  saidas: {
    valor_seguranca: number;
    outros_gastos: number;
    outros_descricao: string;
  };
  totalPix: number;
  totalEntradas: number;
  totalVolunteers: number;
  totalSaidas: number;
  saldo: number;
  pendingPayments: PendingPayment[];
  availableCash: number;
}

export const ResumoTab = ({
  entradas,
  pixEntries,
  selectedVolunteers,
  saidas,
  totalPix,
  totalEntradas,
  totalVolunteers,
  totalSaidas,
  saldo,
  pendingPayments,
  availableCash
}: ResumoTabProps) => {
  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'volunteer':
        return 'Voluntário';
      case 'security':
        return 'Segurança';
      case 'others':
        return 'Outros Gastos';
      default:
        return 'Pagamento';
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <TrendingUp className="h-5 w-5" />
          Resumo da Sessão
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-800 text-lg">ENTRADAS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Dinheiro:</span>
                  <span className="font-medium">R$ {entradas.dinheiro.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cartão Débito:</span>
                  <span className="font-medium">R$ {entradas.cartao_debito.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cartão Crédito:</span>
                  <span className="font-medium">R$ {entradas.cartao_credito.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PIX ({pixEntries.length} entradas):</span>
                  <span className="font-medium">R$ {totalPix.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold text-green-700">
                  <span>Total Entradas:</span>
                  <span>R$ {totalEntradas.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-800 text-lg">SAÍDAS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Voluntários ({selectedVolunteers.length}):</span>
                  <span className="font-medium">R$ {totalVolunteers.toFixed(2)}</span>
                </div>
                {selectedVolunteers.map(volunteer => (
                  <div key={volunteer.id} className="flex justify-between text-xs pl-4 text-gray-600">
                    <span>• {volunteer.name}:</span>
                    <span>R$ {volunteer.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span>Segurança:</span>
                  <span className="font-medium">R$ {saidas.valor_seguranca.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Outros:</span>
                  <span className="font-medium">R$ {saidas.outros_gastos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold text-red-700">
                  <span>Total Saídas:</span>
                  <span>R$ {totalSaidas.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Análise de Pagamentos */}
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-800 text-lg">ANÁLISE DE PAGAMENTOS (Apenas Dinheiro)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Dinheiro Disponível:</span>
                <span className="font-medium">R$ {entradas.dinheiro.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total de Saídas:</span>
                <span className="font-medium">R$ {totalSaidas.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Dinheiro Restante:</span>
                <span className={`font-medium ${availableCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {availableCash.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerta de Pagamentos Pendentes */}
        {pendingPayments.length > 0 && (
          <Alert className="mt-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">Pagamentos Pendentes</AlertTitle>
            <AlertDescription className="text-orange-700">
              <p className="mb-3">
                O dinheiro disponível (R$ {entradas.dinheiro.toFixed(2)}) não é suficiente para cobrir todas as saídas. 
                Os seguintes pagamentos ficaram pendentes:
              </p>
              <div className="space-y-2">
                {pendingPayments.map((payment, index) => (
                  <div key={payment.id} className="flex justify-between bg-white p-2 rounded border">
                    <span>
                      <span className="font-medium">{payment.name}</span>
                      <span className="text-sm text-gray-600 ml-2">({getPaymentTypeLabel(payment.type)})</span>
                    </span>
                    <span className="font-medium text-red-600">R$ {payment.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between bg-red-100 p-2 rounded border border-red-200 font-bold">
                  <span>Total Pendente:</span>
                  <span className="text-red-600">
                    R$ {pendingPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm">
                <strong>Nota:</strong> Estes pagamentos pendentes não impedem a validação da sessão, 
                mas devem ser resolvidos posteriormente.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <Card className={`mt-6 ${saldo >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <CardContent className="p-6 text-center">
            <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              Saldo Final: R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};
