
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, FileText } from 'lucide-react';

interface AdvancedReportSummaryProps {
  data: any[];
  reportType: string;
  loading: boolean;
}

export const AdvancedReportSummary = ({ data, reportType, loading }: AdvancedReportSummaryProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalEntradas = data.reduce((sum, item) => sum + item.entradas, 0);
  const totalSaidas = data.reduce((sum, item) => sum + item.saidas, 0);
  const saldoTotal = totalEntradas - totalSaidas;
  const totalTransactions = data.reduce((sum, item) => sum + item.count, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">
            Total de Entradas
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(totalEntradas)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800">
            Total de Saídas
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-900">
            {formatCurrency(totalSaidas)}
          </div>
        </CardContent>
      </Card>

      <Card className={`${saldoTotal >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`text-sm font-medium ${saldoTotal >= 0 ? 'text-blue-800' : 'text-yellow-800'}`}>
            Saldo Total
          </CardTitle>
          <DollarSign className={`h-4 w-4 ${saldoTotal >= 0 ? 'text-blue-600' : 'text-yellow-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${saldoTotal >= 0 ? 'text-blue-900' : 'text-yellow-900'}`}>
            {formatCurrency(saldoTotal)}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-800">
            Total de Transações
          </CardTitle>
          <FileText className="h-4 w-4 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {totalTransactions}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
