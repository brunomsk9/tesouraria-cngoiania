
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Calendar, DollarSign, TrendingUp } from 'lucide-react';

interface SummaryData {
  totalEntries: number;
  totalExits: number;
  balance: number;
  transactionCount: number;
}

interface ReportSummaryCardsProps {
  summary: SummaryData;
}

export const ReportSummaryCards = ({ summary }: ReportSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-green-100 text-sm">Total Entradas</p>
              <p className="text-lg lg:text-2xl font-bold truncate">
                R$ {summary.totalEntries.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                R$ {summary.totalExits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-red-200 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
      
      <Card className={`bg-gradient-to-r ${summary.balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} text-white`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className={summary.balance >= 0 ? 'text-blue-100' : 'text-orange-100'}>Saldo</p>
              <p className="text-lg lg:text-2xl font-bold truncate">
                R$ {summary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Calendar className={`h-6 w-6 lg:h-8 lg:w-8 ${summary.balance >= 0 ? 'text-blue-200' : 'text-orange-200'} flex-shrink-0`} />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-purple-100 text-sm">Transações</p>
              <p className="text-lg lg:text-2xl font-bold">{summary.transactionCount}</p>
            </div>
            <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-purple-200 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
