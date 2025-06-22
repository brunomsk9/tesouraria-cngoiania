
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Plus } from 'lucide-react';

interface SessionCreationFormProps {
  newSessionData: {
    date_session: string;
    culto_evento: string;
  };
  setNewSessionData: (data: { date_session: string; culto_evento: string }) => void;
  onCreateSession: () => void;
}

export const SessionCreationForm = ({
  newSessionData,
  setNewSessionData,
  onCreateSession
}: SessionCreationFormProps) => {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <Calendar className="h-6 w-6" />
            Iniciar Nova Sessão de Caixa
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">Data da Sessão</Label>
              <Input
                id="date"
                type="date"
                value={newSessionData.date_session}
                onChange={(e) => setNewSessionData({...newSessionData, date_session: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="evento" className="text-sm font-medium text-gray-700">Culto/Evento</Label>
              <Input
                id="evento"
                placeholder="Ex: Culto Domingo Manhã"
                value={newSessionData.culto_evento}
                onChange={(e) => setNewSessionData({...newSessionData, culto_evento: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>
          <Button onClick={onCreateSession} className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
            <Plus className="h-5 w-5 mr-2" />
            Iniciar Sessão de Caixa
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
