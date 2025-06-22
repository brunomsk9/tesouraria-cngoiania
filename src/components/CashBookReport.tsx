
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CashBookFilters } from './CashBookFilters';
import { CashBookTable } from './CashBookTable';
import { useCashBookPrintExport } from './CashBookPrintExport';
import { useCashBookData } from '@/hooks/useCashBookData';

export const CashBookReport = () => {
  const { profile } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const {
    entries,
    loading,
    initialBalance,
    generateReport
  } = useCashBookData();

  const { exportToPrint } = useCashBookPrintExport({
    entries,
    initialBalance,
    startDate,
    endDate,
    selectedChurch: profile?.church_id || '',
    churches: []
  });

  const handleGenerateReport = () => {
    console.log('handleGenerateReport chamado com:', { startDate, endDate, churchId: profile?.church_id });
    
    if (!startDate || !endDate) {
      console.log('Datas não preenchidas');
      return;
    }
    
    if (!profile?.church_id) {
      console.log('Igreja do usuário não encontrada');
      return;
    }
    
    generateReport(startDate, endDate, profile.church_id);
  };

  console.log('Renderizando CashBookReport:', { 
    startDate, 
    endDate, 
    churchId: profile?.church_id,
    entriesCount: entries.length 
  });

  return (
    <div className="space-y-6">
      <CashBookFilters
        startDate={startDate}
        endDate={endDate}
        loading={loading}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onGenerateReport={handleGenerateReport}
      />

      {entries.length > 0 && (
        <CashBookTable
          entries={entries}
          initialBalance={initialBalance}
          onExportToPrint={exportToPrint}
        />
      )}
    </div>
  );
};
