
import { CashBookPrintExportProps } from '@/types/cashBook';
import { getSessionDetails } from '@/services/cashBookService';
import { generateCashBookHtml } from '@/utils/cashBookHtmlGenerator';

export const useCashBookPrintExport = ({
  entries,
  initialBalance,
  startDate,
  endDate,
  selectedChurch,
  churches
}: CashBookPrintExportProps) => {
  
  const exportToPrint = async () => {
    // Buscar o nome correto da igreja da lista de igrejas cadastradas
    const churchName = churches.find(c => c.id === selectedChurch)?.name || 'Igreja não encontrada';
    const logoUrl = localStorage.getItem(`church-logo-${selectedChurch}`);
    
    // Buscar detalhes das sessões
    const { sessions, profileMap } = await getSessionDetails(selectedChurch, startDate, endDate);
    
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) return;

    const htmlContent = generateCashBookHtml({
      churchName,
      logoUrl,
      sessions,
      profileMap,
      startDate,
      endDate,
      entries,
      initialBalance
    });

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return { exportToPrint };
};
