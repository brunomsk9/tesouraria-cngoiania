
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Calendar } from 'lucide-react';

interface Church {
  id: string;
  name: string;
}

interface CashBookFiltersProps {
  startDate: string;
  endDate: string;
  selectedChurch: string;
  churches: Church[];
  loading: boolean;
  showChurchSelector: boolean;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onChurchChange: (churchId: string) => void;
  onGenerateReport: () => void;
}

export const CashBookFilters = ({
  startDate,
  endDate,
  selectedChurch,
  churches,
  loading,
  showChurchSelector,
  onStartDateChange,
  onEndDateChange,
  onChurchChange,
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {showChurchSelector && (
            <div>
              <Label htmlFor="church">Igreja *</Label>
              <Select value={selectedChurch} onValueChange={onChurchChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a igreja" />
                </SelectTrigger>
                <SelectContent>
                  {churches.map((church) => (
                    <SelectItem key={church.id} value={church.id}>
                      {church.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-end space-x-2">
            <Button onClick={onGenerateReport} disabled={loading} className="flex-1">
              <Calendar className="h-4 w-4 mr-2" />
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
