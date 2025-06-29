
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCashFlowState } from '@/hooks/useCashFlowState';
import { useSessionDataStatus } from '@/hooks/useSessionDataStatus';
import { loadSessions, createNewSession, saveEntradas, saveSaidas } from '@/services/cashFlowService';
import { SessionCreationForm } from '@/components/cash-flow/SessionCreationForm';
import { SessionsList } from '@/components/cash-flow/SessionsList';
import { SupervisorAccess } from '@/components/cash-flow/SupervisorAccess';
import { SessionHeader } from '@/components/cash-flow/SessionHeader';
import { CashFlowTabs } from '@/components/cash-flow/CashFlowTabs';

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
    otherExpenses,
    setOtherExpenses,
    sessions,
    setSessions,
    resetFormData,
    totalPix,
    totalEntradas,
    totalVolunteers,
    totalOtherExpenses,
    totalSaidas,
    saldo,
    pendingPayments,
    availableCash
  } = useCashFlowState();

  // Usar o novo hook para verificar status dos dados salvos
  const { entriesSaved, pixSaved, exitsSaved, loading: statusLoading } = useSessionDataStatus(currentSession?.id || null);

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
    
    console.log('=== CRIANDO NOVA SESSÃO ===');
    console.log('Dados que serão enviados para o service:', newSessionData);
    
    const session = await createNewSession(
      profile.church_id,
      profile.id,
      newSessionData
    );
    
    if (session) {
      console.log('Sessão criada com sucesso:', session);
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
    const success = await saveSaidas(currentSession, selectedVolunteers, saidas, otherExpenses, profile.id);
    return success;
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
    return <SupervisorAccess />;
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
          <SessionHeader 
            currentSession={currentSession}
            onNewSession={() => setCurrentSession(null)}
          />

          <CashFlowTabs
            currentSession={currentSession}
            entradas={entradas}
            setEntradas={setEntradas}
            pixEntries={pixEntries}
            setPixEntries={setPixEntries}
            selectedVolunteers={selectedVolunteers}
            setSelectedVolunteers={setSelectedVolunteers}
            saidas={saidas}
            setSaidas={setSaidas}
            otherExpenses={otherExpenses}
            setOtherExpenses={setOtherExpenses}
            totalPix={totalPix}
            totalEntradas={totalEntradas}
            totalVolunteers={totalVolunteers}
            totalOtherExpenses={totalOtherExpenses}
            totalSaidas={totalSaidas}
            saldo={saldo}
            pendingPayments={pendingPayments}
            availableCash={availableCash}
            onSaveEntradas={handleSaveEntradas}
            onSaveSaidas={handleSaveSaidas}
            onSessionValidated={handleSessionValidated}
            entriesSaved={entriesSaved}
            pixSaved={pixSaved}
            exitsSaved={exitsSaved}
          />
        </div>
      )}

      <SessionsList sessions={sessions} onSelectSession={selectSession} />
    </div>
  );
};
