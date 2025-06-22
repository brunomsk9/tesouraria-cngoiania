
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'entrada' | 'saida';
  category: string;
  date_transaction: string;
}

interface RecentTransactionsListProps {
  transactions: Transaction[];
  loading: boolean;
}

export const RecentTransactionsList = ({ transactions, loading }: RecentTransactionsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando transações...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 rounded-lg gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{transaction.description}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(transaction.date_transaction), 'dd/MM/yyyy', { locale: ptBR })}
                    {transaction.category && ` • ${transaction.category}`}
                  </p>
                </div>
                <div className={`text-right sm:text-right ${transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'} flex-shrink-0`}>
                  <p className="font-bold">
                    {transaction.type === 'entrada' ? '+' : '-'} R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs capitalize">{transaction.type}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">Nenhuma transação encontrada no período selecionado.</p>
        )}
      </CardContent>
    </Card>
  );
};
