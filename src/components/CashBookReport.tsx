
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
    if (profile?.role === 'master' || profile?.role === 'supervisor') {
      loadChurches();
    } else if (profile?.church_id) {
      setSelectedChurch(profile.church_id);
    }
  }, [profile]);

  const handleGenerateReport = () => {
    generateReport(startDate, endDate, selectedChurch);
  };

  const showChurchSelector = profile?.role === 'master' || profile?.role === 'supervisor';

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

      <CashBookTable
        entries={entries}
        initialBalance={initialBalance}
        onExportToPrint={exportToPrint}
      />
    </div>
  );
};
