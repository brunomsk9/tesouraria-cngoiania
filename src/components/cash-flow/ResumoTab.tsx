
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

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
  saldo
}: ResumoTabProps) => {
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
