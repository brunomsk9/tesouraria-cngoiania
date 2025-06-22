
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Calendar } from 'lucide-react';

interface CashBookFiltersProps {
  startDate: string;
  endDate: string;
  loading: boolean;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onGenerateReport: () => void;
}

export const CashBookFilters = ({
  startDate,
  endDate,
  loading,
  onStartDateChange,
  onEndDateChange,
  onGenerateReport
}: CashBookFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Gerador de Livro Caixa</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="startDate">Data Início *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="endDate">Data Fim *</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button onClick={onGenerateReport} disabled={loading} className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
