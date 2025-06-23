
import { format } from 'date-fns';

interface Church {
  id: string;
  name: string;
}

export const exportAdvancedReportToCSV = (
  data: any[], 
  reportType: string, 
  groupBy: string, 
  churches: Church[]
) => {
  const getDisplayName = (key: string) => {
    if (groupBy === 'church') {
      const church = churches.find(c => c.id === key);
      return church?.name || key;
    }
    return key;
  };

  const headers = [
    groupBy === 'church' ? 'Igreja' : 
    groupBy === 'month' ? 'Mês' :
    groupBy === 'category' ? 'Categoria' : 'Evento',
    'Entradas',
    'Saídas', 
    'Saldo',
    'Transações'
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      `"${getDisplayName(item.key)}"`,
      item.entradas.toString(),
      item.saidas.toString(),
      item.saldo.toString(),
      item.count.toString()
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_avancado_${reportType}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
