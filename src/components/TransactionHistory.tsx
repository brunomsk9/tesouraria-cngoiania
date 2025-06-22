
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Calendar, MapPin, MessageSquare } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'entrada' | 'saida';
  category?: string;
  description: string;
  amount: number;
  date: string;
  date_transaction: string;
  culto_evento?: string;
  observacao?: string;
  valor_moeda_estrangeira?: number;
  moeda_estrangeira?: string;
  voluntarios?: number;
  valor_seguranca?: number;
  outros_gastos?: number;
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

  const getCategoryLabel = (category?: string) => {
    const labels = {
      'dinheiro': 'Dinheiro',
      'pix': 'PIX',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito'
    };
    return category ? labels[category as keyof typeof labels] || category : 'Pagamentos';
  };

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
              className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-4 flex-1">
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
                
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-gray-800">{transaction.description}</h4>
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(transaction.category)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                    <span>Registrado: {transaction.date}</span>
                    <span>• Data: {new Date(transaction.date_transaction).toLocaleDateString('pt-BR')}</span>
                    
                    {transaction.culto_evento && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{transaction.culto_evento}</span>
                      </div>
                    )}
                  </div>

                  {transaction.type === 'saida' && (
                    <div className="text-sm text-gray-600 space-y-1">
                      {transaction.voluntarios && (
                        <div>• {transaction.voluntarios} voluntário(s) - R$ {(transaction.voluntarios * 30).toFixed(2)}</div>
                      )}
                      {transaction.valor_seguranca && (
                        <div>• Segurança: R$ {transaction.valor_seguranca.toFixed(2)}</div>
                      )}
                      {transaction.outros_gastos && (
                        <div>• Outros gastos: R$ {transaction.outros_gastos.toFixed(2)}</div>
                      )}
                    </div>
                  )}

                  {transaction.valor_moeda_estrangeira && transaction.moeda_estrangeira && (
                    <div className="text-sm text-blue-600">
                      Moeda estrangeira: {transaction.moeda_estrangeira} {transaction.valor_moeda_estrangeira.toFixed(2)}
                    </div>
                  )}

                  {transaction.observacao && (
                    <div className="flex items-start gap-1 text-sm text-gray-600 bg-gray-100 p-2 rounded">
                      <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{transaction.observacao}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={`text-lg font-bold ml-4 ${
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
