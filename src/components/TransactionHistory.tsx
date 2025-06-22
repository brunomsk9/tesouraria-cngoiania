
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'entrada' | 'saida';
  category: string;
  description: string;
  amount: number;
  date: string;
  voluntarios?: number;
  valorSeguranca?: number;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  if (transactions.length === 0) {
    return (
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma transação registrada ainda.</p>
            <p className="text-sm">Comece registrando uma entrada ou saída acima.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Histórico de Transações ({transactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'entrada' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {transaction.type === 'entrada' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800">{transaction.description}</h4>
                    <Badge variant="outline" className="text-xs">
                      {transaction.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{transaction.date}</span>
                    {transaction.type === 'saida' && transaction.voluntarios && (
                      <span>• {transaction.voluntarios} voluntário(s)</span>
                    )}
                    {transaction.type === 'saida' && transaction.valorSeguranca && (
                      <span>• Segurança: R$ {transaction.valorSeguranca.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className={`text-lg font-bold ${
                transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'entrada' ? '+' : '-'}R$ {transaction.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
