
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
    <Card>
      <CardHeader>
        <CardTitle>Transações Detalhadas ({data.length} registros)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Igreja</TableHead>
                <TableHead>Evento/Culto</TableHead>
                <TableHead>Tipo de Pagamento</TableHead>
                <TableHead className="text-right">Entradas</TableHead>
                <TableHead className="text-right">Saídas</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {format(new Date(item.date_transaction), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.church_name}
                  </TableCell>
                  <TableCell>
                    {item.event_name}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {item.payment_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {item.type === 'entrada' ? formatCurrency(item.amount) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    {item.type === 'saida' ? formatCurrency(item.amount) : '-'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={item.description}>
                    {item.description}
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    Nenhuma transação encontrada para o período selecionado
                  </TableCell>
                </TableRow>
              )}
              {data.length > 0 && (
                <TableRow className="bg-gray-50 font-semibold">
                  <TableCell colSpan={4} className="text-right">
                    <strong>TOTAL:</strong>
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(totalEntradas)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {formatCurrency(totalSaidas)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-blue-600">
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
