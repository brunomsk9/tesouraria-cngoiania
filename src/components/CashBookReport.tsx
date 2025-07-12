import { useState } from 'react';
import { CashBookFilters } from './CashBookFilters';
import { CashBookTable } from './CashBookTable';
import { useCashBookPrintExport } from '@/hooks/useCashBookPrintExport';
import { useCashBookData } from '@/hooks/useCashBookData';

export const CashBookReport = () => {
  const [selectedChurch, setSelectedChurch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  const {
    entries,
    loading,
    initialBalance,
    churches,
    generateReport
  } = useCashBookData();

  const { exportToPrint } = useCashBookPrintExport({
    entries,
    initialBalance,
    startDate: selectedDate,
    endDate: selectedDate,
    selectedChurch,
    churches
  });

  const handleGenerateReport = () => {
    console.log('handleGenerateReport chamado com:', { selectedDate, churchId: selectedChurch });
    
    if (!selectedDate) {
      console.log('Data não preenchida');
      return;
    }
    
    if (!selectedChurch) {
      console.log('Igreja não selecionada');
      return;
    }
    
    generateReport(selectedDate, selectedDate, selectedChurch);
  };

  console.log('Renderizando CashBookReport:', { 
    selectedDate, 
    churchId: selectedChurch,
    entriesCount: entries.length 
  });

  return (
    <div className="space-y-6">
      <CashBookFilters
        selectedChurch={selectedChurch}
        selectedDate={selectedDate}
        loading={loading}
        onChurchChange={setSelectedChurch}
        onDateChange={setSelectedDate}
        onGenerateReport={handleGenerateReport}
      />

      <CashBookTable
        entries={entries}
        initialBalance={initialBalance}
        onExportToPrint={exportToPrint}
      />
    </div>
  );
};
