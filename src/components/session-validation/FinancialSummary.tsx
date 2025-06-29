
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, StopCircle } from 'lucide-react';

interface TransactionSummary {
  total_entradas: number;
  total_saidas: number;
  total_pix: number;
  saldo: number;
  count_transactions: number;
  count_pix: number;
}

interface FinancialSummaryProps {
  summary: TransactionSummary;
  status: string;
}

export const FinancialSummary = ({ summary, status }: FinancialSummaryProps) => {
  const isValidated = status === 'validado';
  const isClosed = status === 'fechado';

  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-purple-800 text-lg flex items-center gap-2">
          {isValidated ? (
            <>
              <CheckCircle className="h-5 w-5" />
              Resumo Financeiro Final
            </>
          ) : isClosed ? (
            <>
              <StopCircle className="h-5 w-5" />
              Resumo Financeiro no Encerramento
            </>
          ) : (
            "Resumo Financeiro"
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-green-600 font-bold text-xl">
              R$ {summary.total_entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-gray-600">Total Entradas</div>
            {summary.total_pix > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                (incluindo R$ {summary.total_pix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em PIX)
              </div>
            )}
          </div>
          <div className="text-center">
            <div className="text-red-600 font-bold text-xl">
              R$ {summary.total_saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-gray-600">Total Saídas</div>
          </div>
          <div className="text-center">
            <div className={`font-bold text-xl ${summary.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {summary.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-gray-600">Saldo Final</div>
          </div>
        </div>
        <div className="text-center text-sm text-gray-600 pt-2 border-t">
          Total de {summary.count_transactions} transações{summary.count_pix > 0 && ` e ${summary.count_pix} PIX`} registradas
        </div>
      </CardContent>
    </Card>
  );
};
