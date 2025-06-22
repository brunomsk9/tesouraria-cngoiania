
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { DateRangeModal } from '../DateRangeModal';

interface Church {
  id: string;
  name: string;
}

interface ReportsFiltersProps {
  churches: Church[];
  selectedChurch: string;
  onChurchChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  customDateRange: { start?: Date; end?: Date };
  onCustomDateRange: (startDate: Date, endDate: Date) => void;
  onExportCSV: () => void;
  isSuper: boolean;
}

export const ReportsFilters = ({
  churches,
  selectedChurch,
  onChurchChange,
  dateRange,
  onDateRangeChange,
  customDateRange,
  onCustomDateRange,
  onExportCSV,
  isSuper
}: ReportsFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 lg:flex-wrap">
      {isSuper && (
        <Select value={selectedChurch} onValueChange={onChurchChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Selecionar Igreja" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Igrejas</SelectItem>
            {churches.map((church) => (
              <SelectItem key={church.id} value={church.id}>
                {church.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      <div className="flex gap-2">
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Últimos 7 dias</SelectItem>
            <SelectItem value="30days">Últimos 30 dias</SelectItem>
            <SelectItem value="thisMonth">Este mês</SelectItem>
            {customDateRange.start && customDateRange.end && (
              <SelectItem value="custom">
                {format(customDateRange.start, 'dd/MM')} - {format(customDateRange.end, 'dd/MM')}
              </SelectItem>
            )}
          </SelectContent>
        </Select>

        <DateRangeModal 
          onDateRangeSelect={onCustomDateRange}
          trigger={
            <Button variant="outline" size="sm">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          }
        />
      </div>
      
      <Button onClick={onExportCSV} variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Exportar </span>CSV
      </Button>
    </div>
  );
};
