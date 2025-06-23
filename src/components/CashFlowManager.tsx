import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionValidation } from '@/components/SessionValidation';
import { useAuth } from '@/hooks/useAuth';
import { useCashFlowState } from '@/hooks/useCashFlowState';
import { loadSessions, createNewSession, saveEntradas, saveSaidas } from '@/services/cashFlowService';
import { SessionCreationForm } from '@/components/cash-flow/SessionCreationForm';
import { EntradasTab } from '@/components/cash-flow/EntradasTab';
import { SaidasTab } from '@/components/cash-flow/SaidasTab';
import { ResumoTab } from '@/components/cash-flow/ResumoTab';
import { SessionsList } from '@/components/cash-flow/SessionsList';
import { CheckCircle, ArrowUpCircle, ArrowDownCircle, TrendingUp } from 'lucide-react';

export const CashFlowManager = () => {
  const { profile }  = useAuth();
  const {
    currentSession,
    setCurrentSession,
    newSessionData,
    setNewSessionData,
    entradas,
    setEntradas,
    pixEntries,
    setPixEntries,
    selectedVolunteers,
    setSelectedVolunteers,
    saidas,
    setSaidas,
    sessions,
    setSessions,
    resetFormData,
    totalPix,
    totalEntradas,
    totalVolunteers,
    totalSaidas,
    saldo
  } = useCashFlowState();

  useEffect(() => {
    if (profile?.church_id) {
      loadSessionsData();
    }
  }, [profile]);

  const loadSessionsData = async () => {
    if (!profile?.church_id) return;
    const sessionsData = await loadSessions(profile.church_id);
    setSessions(sessionsData);
  };

  const handleCreateNewSession = async () => {
    if (!profile?.church_id || !profile?.id) return;
    
    const session = await createNewSession(
      profile.church_id,
      profile.id,
      newSessionData
    );
    
    if (session) {
      setCurrentSession(session);
      loadSessionsData();
    }
  };

  const handleSaveEntradas = async () => {
    if (!currentSession || !profile?.id) return;
    await saveEntradas(currentSession, entradas, pixEntries, profile.id);
  };

  const handleSaveSaidas = async () => {
    if (!currentSession || !profile?.id) return;
    await saveSaidas(currentSession, selectedVolunteers, saidas, profile.id);
  };

  const handleSessionValidated = () => {
    loadSessionsData();
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, status: 'validado' } : null);
    }
  };

  const selectSession = (session: any) => {
    setCurrentSession(session);
    resetFormData();
  };

  if (profile?.role === 'supervisor') {
    return (
      <div className="p-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Acesso Supervisor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              Como supervisor, você pode visualizar os relatórios de todas as igrejas, 
              mas não pode criar ou modificar sessões de caixa.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {!currentSession ? (
        <SessionCreationForm
          newSessionData={newSessionData}
          setNewSessionData={setNewSessionData}
          onCreateSession={handleCreateNewSession}
        />
      ) : (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center justify-between">
                <span>Sessão Ativa: {currentSession.culto_evento}</span>
                <Button 
                  onClick={() => setCurrentSession(null)} 
                  variant="outline" 
                  size="sm"
                  className="text-blue-600 border-white hover:bg-white"
                >
                  Nova Sessão
                </Button>
              </CardTitle>
              <p className="text-blue-100">
                Data: {new Date(currentSession.date_session).toLocaleDateString('pt-BR')} | 
                {currentSession.horario_sessao && ` Horário: ${currentSession.horario_sessao} |`}
                Status: {currentSession.status.toUpperCase()}
              </p>
            </CardHeader>
          </Card>

          <Tabs defaultValue="entradas" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
              <TabsTrigger value="entradas" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Entradas
              </TabsTrigger>
              <TabsTrigger value="saidas" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                <ArrowDownCircle className="h-4 w-4 mr-2" />
                Saídas
              </TabsTrigger>
              <TabsTrigger value="validacao" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <CheckCircle className="h-4 w-4 mr-2" />
                Validação
              </TabsTrigger>
              <TabsTrigger value="resumo" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                <TrendingUp className="h-4 w-4 mr-2" />
                Resumo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="entradas" className="space-y-6">
              <EntradasTab
                entradas={entradas}
                setEntradas={setEntradas}
                pixEntries={pixEntries}
                setPixEntries={setPixEntries}
                totalEntradas={totalEntradas}
                onSaveEntradas={handleSaveEntradas}
              />
            </TabsContent>

            <TabsContent value="saidas" className="space-y-6">
              <SaidasTab
                selectedVolunteers={selectedVolunteers}
                setSelectedVolunteers={setSelectedVolunteers}
                saidas={saidas}
                setSaidas={setSaidas}
                totalVolunteers={totalVolunteers}
                totalSaidas={totalSaidas}
                onSaveSaidas={handleSaveSaidas}
              />
            </TabsContent>

            <TabsContent value="validacao">
              <SessionValidation 
                session={currentSession}
                onSessionValidated={handleSessionValidated}
              />
            </TabsContent>

            <TabsContent value="resumo">
              <ResumoTab
                entradas={entradas}
                pixEntries={pixEntries}
                selectedVolunteers={selectedVolunteers}
                saidas={saidas}
                totalPix={totalPix}
                totalEntradas={totalEntradas}
                totalVolunteers={totalVolunteers}
                totalSaidas={totalSaidas}
                saldo={saldo}
              />
            </TabsContent>
          </Tabs>
        </div>
      )}

      <SessionsList sessions={sessions} onSelectSession={selectSession} />
    </div>
  );
};
