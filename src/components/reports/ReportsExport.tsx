
import { format } from 'date-fns';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'entrada' | 'saida';
  category: string;
  date_transaction: string;
  cash_sessions?: {
    church_id: string;
  };
}

interface Church {
  id: string;
  name: string;
}

export const exportTransactionsToCSV = (transactions: Transaction[], churches: Church[]) => {
  const csvContent = [
    ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor', 'Igreja'].join(','),
    ...transactions.map(t => {
      const churchName = churches.find(c => c.id === t.cash_sessions?.church_id)?.name || 'N/A';
      return [
        format(new Date(t.date_transaction), 'dd/MM/yyyy'),
        `"${t.description}"`,
        t.type,
        t.category || '',
        t.amount.toString(),
        `"${churchName}"`
      ].join(',');
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `relatorio_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
