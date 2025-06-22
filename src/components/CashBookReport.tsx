
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
  const [selectedChurch, setSelectedChurch] = useState('');
  
  const {
    entries,
    loading,
    initialBalance,
    churches,
    loadChurches,
    generateReport
  } = useCashBookData();

  const { exportToPrint } = useCashBookPrintExport({
    entries,
    initialBalance,
    startDate,
    endDate,
    selectedChurch,
    churches
  });

  useEffect(() => {
    console.log('CashBookReport montado. Profile:', profile);
    
    if (profile?.role === 'master' || profile?.role === 'supervisor') {
      console.log('Carregando igrejas...');
      loadChurches();
    } else if (profile?.church_id) {
      console.log('Definindo igreja do usuário:', profile.church_id);
      setSelectedChurch(profile.church_id);
    }
  }, [profile, loadChurches]);

  const handleGenerateReport = () => {
    console.log('handleGenerateReport chamado com:', { startDate, endDate, selectedChurch });
    
    if (!startDate || !endDate) {
      console.log('Datas não preenchidas');
      return;
    }
    
    if (!selectedChurch) {
      console.log('Igreja não selecionada');
      return;
    }
    
    generateReport(startDate, endDate, selectedChurch);
  };

  const showChurchSelector = profile?.role === 'master' || profile?.role === 'supervisor';

  console.log('Renderizando CashBookReport:', { 
    startDate, 
    endDate, 
    selectedChurch, 
    showChurchSelector,
    churchesCount: churches.length,
    entriesCount: entries.length 
  });

  return (
    <div className="space-y-6">
      <CashBookFilters
        startDate={startDate}
        endDate={endDate}
        selectedChurch={selectedChurch}
        churches={churches}
        loading={loading}
        showChurchSelector={showChurchSelector}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onChurchChange={setSelectedChurch}
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
