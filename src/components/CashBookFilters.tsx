
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Church {
  id: string;
  name: string;
}

interface SessionDate {
  date_session: string;
  culto_evento: string;
}

interface CashBookFiltersProps {
  selectedChurch: string;
  selectedDate: string;
  loading: boolean;
  onChurchChange: (churchId: string) => void;
  onDateChange: (date: string) => void;
  onGenerateReport: () => void;
}

export const CashBookFilters = ({
  selectedChurch,
  selectedDate,
  loading,
  onChurchChange,
  onDateChange,
  onGenerateReport
}: CashBookFiltersProps) => {
  const [churches, setChurches] = useState<Church[]>([]);
  const [availableDates, setAvailableDates] = useState<SessionDate[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);

  useEffect(() => {
    fetchChurches();
  }, []);

  useEffect(() => {
    if (selectedChurch) {
      fetchAvailableDates(selectedChurch);
    } else {
      setAvailableDates([]);
    }
  }, [selectedChurch]);

  const fetchChurches = async () => {
    try {
      const { data, error } = await supabase
        .from('churches')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setChurches(data || []);
    } catch (error) {
      console.error('Erro ao buscar igrejas:', error);
    }
  };

  const fetchAvailableDates = async (churchId: string) => {
    setLoadingDates(true);
    try {
      const { data, error } = await supabase
        .from('cash_sessions')
        .select('date_session, culto_evento')
        .eq('church_id', churchId)
        .order('date_session', { ascending: false });

      if (error) throw error;
      
      // Remove duplicatas por data
      const uniqueDates = data?.reduce((acc: SessionDate[], current) => {
        const exists = acc.find(item => item.date_session === current.date_session);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []) || [];

      setAvailableDates(uniqueDates);
    } catch (error) {
      console.error('Erro ao buscar datas disponíveis:', error);
    } finally {
      setLoadingDates(false);
    }
  };

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
            <Label htmlFor="church">Igreja *</Label>
            <Select value={selectedChurch} onValueChange={onChurchChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma igreja" />
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
          
          <div>
            <Label htmlFor="date">Data do Evento *</Label>
            <Select 
              value={selectedDate} 
              onValueChange={onDateChange}
              disabled={!selectedChurch || loadingDates}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !selectedChurch 
                    ? "Selecione uma igreja primeiro" 
                    : loadingDates 
                    ? "Carregando datas..." 
                    : "Selecione uma data"
                } />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((dateInfo) => (
                  <SelectItem key={dateInfo.date_session} value={dateInfo.date_session}>
                    {format(new Date(dateInfo.date_session), 'dd/MM/yyyy', { locale: ptBR })} - {dateInfo.culto_evento}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={onGenerateReport} disabled={loading || !selectedChurch || !selectedDate} className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
