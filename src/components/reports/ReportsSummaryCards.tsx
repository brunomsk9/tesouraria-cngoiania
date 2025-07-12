
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-emerald-100 text-sm font-medium tracking-wide">Total Entradas</p>
              <p className="text-2xl lg:text-3xl font-bold truncate mt-2">
                {formatCurrency(totalEntradas)}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <TrendingUp className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-rose-100 text-sm font-medium tracking-wide">Total Saídas</p>
              <p className="text-2xl lg:text-3xl font-bold truncate mt-2">
                {formatCurrency(totalSaidas)}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <DollarSign className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className={`bg-gradient-to-br ${(totalEntradas - totalSaidas) >= 0 ? 'from-blue-500 via-blue-600 to-blue-700' : 'from-amber-500 via-amber-600 to-amber-700'} text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className={(totalEntradas - totalSaidas) >= 0 ? 'text-blue-100' : 'text-amber-100'}>
                <span className="text-sm font-medium tracking-wide">Saldo Final</span>
              </p>
              <p className="text-2xl lg:text-3xl font-bold truncate mt-2">
                {formatCurrency(totalEntradas - totalSaidas)}
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <Calendar className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-violet-500 via-violet-600 to-violet-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-violet-100 text-sm font-medium tracking-wide">Transações</p>
              <p className="text-2xl lg:text-3xl font-bold mt-2">{data.length}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <FileText className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
