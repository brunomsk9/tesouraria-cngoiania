
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

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

interface ReportsTableProps {
  data: ReportData[];
}

export const ReportsTable = ({ data }: ReportsTableProps) => {
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
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <CardTitle className="text-slate-800 text-xl">
          Transações Detalhadas 
          <span className="ml-2 text-sm font-normal bg-slate-200 text-slate-600 px-3 py-1 rounded-full">
            {data.length} registros
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Data</TableHead>
                <TableHead className="font-semibold text-slate-700">Igreja</TableHead>
                <TableHead className="font-semibold text-slate-700">Evento/Culto</TableHead>
                <TableHead className="font-semibold text-slate-700">Tipo de Pagamento</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Entradas</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Saídas</TableHead>
                <TableHead className="font-semibold text-slate-700">Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50/50 transition-colors`}>
                  <TableCell className="font-medium text-slate-700">
                    {format(new Date(item.date_transaction), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">
                    {item.church_name}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {item.event_name}
                  </TableCell>
                  <TableCell>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {item.payment_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-emerald-600">
                    {item.type === 'entrada' ? formatCurrency(item.amount) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-rose-600">
                    {item.type === 'saida' ? formatCurrency(item.amount) : '-'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-slate-600" title={item.description}>
                    {item.description}
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-12">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                      </div>
                      <p className="font-medium">Nenhuma transação encontrada</p>
                      <p className="text-sm">Altere os filtros para ver os dados</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {data.length > 0 && (
                <TableRow className="bg-gradient-to-r from-slate-100 to-slate-200 font-semibold border-t-2 border-slate-300">
                  <TableCell colSpan={4} className="text-right text-slate-800 font-bold">
                    TOTAIS:
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-700 text-lg">
                    {formatCurrency(totalEntradas)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-rose-700 text-lg">
                    {formatCurrency(totalSaidas)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-blue-700 text-lg">
                    Saldo: {formatCurrency(totalEntradas - totalSaidas)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
