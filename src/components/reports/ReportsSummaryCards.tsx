
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, DollarSign, TrendingUp, FileText } from 'lucide-react';

interface ReportData {
  id: string;
  date_transaction: string;
  church_name: string;
  event_name: string;
  payment_type: string;
  amount: number;
  type: 'entrada' | 'saida';
  description: string;
}

interface ReportsSummaryCardsProps {
  data: ReportData[];
}

export const ReportsSummaryCards = ({ data }: ReportsSummaryCardsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTotals = () => {
    const totalEntradas = data.filter(item => item.type === 'entrada').reduce((sum, item) => sum + item.amount, 0);
    const totalSaidas = data.filter(item => item.type === 'saida').reduce((sum, item) => sum + item.amount, 0);
    return { totalEntradas, totalSaidas };
  };

  const { totalEntradas, totalSaidas } = calculateTotals();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-green-100 text-sm">Total Entradas</p>
              <p className="text-lg lg:text-2xl font-bold truncate">
                {formatCurrency(totalEntradas)}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-green-200 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-red-100 text-sm">Total Saídas</p>
              <p className="text-lg lg:text-2xl font-bold truncate">
                {formatCurrency(totalSaidas)}
              </p>
            </div>
            <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-red-200 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
      
      <Card className={`bg-gradient-to-r ${(totalEntradas - totalSaidas) >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className={(totalEntradas - totalSaidas) >= 0 ? 'text-blue-100' : 'text-orange-100'}>Saldo</p>
              <p className="text-lg lg:text-2xl font-bold truncate">
                {formatCurrency(totalEntradas - totalSaidas)}
              </p>
            </div>
            <Calendar className={`h-6 w-6 lg:h-8 lg:w-8 ${(totalEntradas - totalSaidas) >= 0 ? 'text-blue-200' : 'text-orange-200'} flex-shrink-0`} />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-purple-100 text-sm">Transações</p>
              <p className="text-lg lg:text-2xl font-bold">{data.length}</p>
            </div>
            <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-purple-200 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
