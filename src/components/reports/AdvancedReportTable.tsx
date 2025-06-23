
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AdvancedReportTableProps {
  data: any[];
  reportType: string;
  groupBy: string;
  churches: Array<{ id: string; name: string }>;
  loading: boolean;
}

export const AdvancedReportTable = ({ data, reportType, groupBy, churches, loading }: AdvancedReportTableProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dados Detalhados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getDisplayName = (key: string) => {
    if (groupBy === 'church') {
      const church = churches.find(c => c.id === key);
      return church?.name || key;
    }
    return key;
  };

  const sortedData = [...data].sort((a, b) => b.saldo - a.saldo);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados Detalhados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {groupBy === 'church' ? 'Igreja' : 
                   groupBy === 'month' ? 'Mês' :
                   groupBy === 'category' ? 'Categoria' : 'Evento'}
                </TableHead>
                <TableHead className="text-right">Entradas</TableHead>
                <TableHead className="text-right">Saídas</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-right">Transações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => (
                <TableRow key={item.key}>
                  <TableCell className="font-medium">
                    {getDisplayName(item.key)}
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-medium">
                    {formatCurrency(item.entradas)}
                  </TableCell>
                  <TableCell className="text-right text-red-600 font-medium">
                    {formatCurrency(item.saidas)}
                  </TableCell>
                  <TableCell className={`text-right font-bold ${
                    item.saldo >= 0 ? 'text-blue-600' : 'text-yellow-600'
                  }`}>
                    {formatCurrency(item.saldo)}
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {item.count}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
