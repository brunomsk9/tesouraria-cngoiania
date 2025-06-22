
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CashBookEntry {
  date: string;
  description: string;
  type: 'entrada' | 'saida';
  amount: number;
  balance: number;
  session: string;
  category?: string;
}

interface Church {
  id: string;
  name: string;
}

interface CashBookPrintExportProps {
  entries: CashBookEntry[];
  initialBalance: number;
  startDate: string;
  endDate: string;
  selectedChurch: string;
  churches: Church[];
}

export const useCashBookPrintExport = ({
  entries,
  initialBalance,
  startDate,
  endDate,
  selectedChurch,
  churches
}: CashBookPrintExportProps) => {
  const exportToPrint = () => {
    const churchName = churches.find(c => c.id === selectedChurch)?.name || 'Igreja';
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Livro Caixa - ${churchName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .period { text-align: center; margin-bottom: 20px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .amount { text-align: right; }
            .entrada { color: #059669; }
            .saida { color: #dc2626; }
            .balance { font-weight: bold; }
            .summary { margin-top: 20px; padding: 15px; background-color: #f9f9f9; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LIVRO CAIXA</h1>
            <h2>${churchName}</h2>
          </div>
          
          <div class="period">
            Período: ${format(new Date(startDate), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(endDate), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
          
          <div class="summary">
            <strong>Saldo Inicial: R$ ${initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Sessão/Evento</th>
                <th>Categoria</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              ${entries.map(entry => `
                <tr>
                  <td>${format(new Date(entry.date), 'dd/MM/yyyy', { locale: ptBR })}</td>
                  <td>${entry.description}</td>
                  <td>${entry.session}</td>
                  <td>${entry.category || '-'}</td>
                  <td class="amount ${entry.type === 'entrada' ? 'entrada' : ''}">
                    ${entry.type === 'entrada' ? `R$ ${entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td class="amount ${entry.type === 'saida' ? 'saida' : ''}">
                    ${entry.type === 'saida' ? `R$ ${entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td class="amount balance">R$ ${entry.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <strong>Saldo Final: R$ ${entries.length > 0 ? entries[entries.length - 1].balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
          
          <div style="margin-top: 50px; text-align: center; color: #666;">
            Relatório gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return { exportToPrint };
};
