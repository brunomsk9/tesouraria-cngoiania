
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportSummaryCards } from './ReportSummaryCards';
import { RecentTransactionsList } from './RecentTransactionsList';
import { ReportsHeader } from './reports/ReportsHeader';
import { ReportsFilters } from './reports/ReportsFilters';
import { useReportsData } from './reports/useReportsData';
import { exportTransactionsToCSV } from './reports/ReportsExport';

export const Reports = () => {
  const {
    loading,
    transactions,
    churches,
    selectedChurch,
    setSelectedChurch,
    dateRange,
    setDateRange,
    customDateRange,
    handleCustomDateRange,
    calculateSummary,
    getSelectedChurchName,
    profile
  } = useReportsData();

  const handleExportCSV = () => {
    exportTransactionsToCSV(transactions, churches);
  };

  const summary = calculateSummary();
  const selectedChurchName = getSelectedChurchName();

  if (profile?.role !== 'supervisor' && !profile?.church_id) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Igreja não configurada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700">
            Você precisa estar vinculado a uma igreja para visualizar relatórios.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <ReportsHeader selectedChurchName={selectedChurchName} />
        
        <ReportsFilters 
          churches={churches}
          selectedChurch={selectedChurch}
          onChurchChange={setSelectedChurch}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          customDateRange={customDateRange}
          onCustomDateRange={handleCustomDateRange}
          onExportCSV={handleExportCSV}
          isSuper={profile?.role === 'supervisor'}
        />
      </div>

      <ReportSummaryCards summary={summary} />
      <RecentTransactionsList transactions={transactions} loading={loading} />
    </div>
  );
};
