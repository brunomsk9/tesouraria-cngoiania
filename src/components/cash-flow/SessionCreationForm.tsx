
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { loadCultosEventos, type CultoEvento } from '@/services/cultosEventosService';

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
  const { profile } = useAuth();
  const [cultosEventos, setCultosEventos] = useState<CultoEvento[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.church_id) {
      loadCultosEventosData();
    }
  }, [profile]);

  const loadCultosEventosData = async () => {
    if (!profile?.church_id) return;
    setLoading(true);
    try {
      const data = await loadCultosEventos(profile.church_id);
      setCultosEventos(data);
    } catch (error) {
      console.error('Erro ao carregar cultos/eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = () => {
    console.log('=== DADOS ANTES DE CRIAR SESSÃO ===');
    console.log('Data selecionada:', newSessionData.date_session);
    console.log('Tipo da data:', typeof newSessionData.date_session);
    console.log('Dados completos que serão enviados:', newSessionData);
    onCreateSession();
  };

  // Função para obter data atual sem conversão de timezone
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    console.log('Data de hoje gerada:', dateString);
    return dateString;
  };

  // Inicializar data apenas uma vez
  useEffect(() => {
    if (!newSessionData.date_session) {
      const todayDate = getTodayDateString();
      console.log('Inicializando com data de hoje:', todayDate);
      setNewSessionData({
        ...newSessionData,
        date_session: todayDate
      });
    }
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    console.log('=== MUDANÇA DE DATA NO INPUT ===');
    console.log('Valor do input (string):', selectedDate);
    console.log('Comprimento da string:', selectedDate.length);
    
    // Manter como string, sem conversões
    setNewSessionData({...newSessionData, date_session: selectedDate});
  };

  // Função para mostrar data formatada sem alterar o valor
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'Não definida';
    
    // Split da string YYYY-MM-DD e reordenar para DD/MM/YYYY
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

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
                onChange={handleDateChange}
                className="mt-1"
              />
              <div className="text-xs text-gray-500 mt-1 space-y-1">
                <div>Valor do input: {newSessionData.date_session}</div>
                <div>Data formatada: {formatDateForDisplay(newSessionData.date_session)}</div>
              </div>
            </div>
            <div>
              <Label htmlFor="evento" className="text-sm font-medium text-gray-700">Culto/Evento</Label>
              {loading ? (
                <div className="mt-1 flex items-center justify-center h-10 border border-gray-300 rounded-md">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              ) : cultosEventos.length > 0 ? (
                <Select 
                  value={newSessionData.culto_evento} 
                  onValueChange={(value) => setNewSessionData({...newSessionData, culto_evento: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione um culto/evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {cultosEventos.map((culto) => (
                      <SelectItem key={culto.id} value={culto.nome}>
                        <div className="flex flex-col">
                          <span>{culto.nome}</span>
                          {culto.descricao && (
                            <span className="text-sm text-gray-500">
                              {culto.descricao}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1">
                  <div className="text-center py-4 border border-gray-300 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">
                      Nenhum culto/evento cadastrado
                    </p>
                    <p className="text-xs text-gray-500">
                      Cadastre cultos/eventos primeiro para continuar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <Button 
            onClick={handleCreateSession} 
            disabled={!newSessionData.culto_evento || !newSessionData.date_session || cultosEventos.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Iniciar Sessão de Caixa
          </Button>
          
          {cultosEventos.length === 0 && !loading && (
            <div className="text-center">
              <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
                <strong>Atenção:</strong> É necessário cadastrar pelo menos um culto/evento antes de criar uma sessão de caixa.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
