
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

interface AdvancedReportSummaryProps {
  data: any[];
  loading: boolean;
}

export const AdvancedReportSummary = ({ data, loading }: AdvancedReportSummaryProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalEntradas = data.reduce((sum, item) => sum + item.entradas, 0);
  const totalSaidas = data.reduce((sum, item) => sum + item.saidas, 0);
  const totalSaldo = totalEntradas - totalSaidas;
  const totalTransacoes = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalEntradas)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalSaidas)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
          <DollarSign className={`h-4 w-4 ${totalSaldo >= 0 ? 'text-blue-600' : 'text-yellow-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalSaldo >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
            {formatCurrency(totalSaldo)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Transações</CardTitle>
          <Activity className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {totalTransacoes}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
