import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MoneyInput } from '@/components/MoneyInput';
import { PixManager } from '@/components/PixManager';
import { SessionValidation } from '@/components/SessionValidation';
import { VolunteerSelector } from '@/components/VolunteerSelector';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Plus, CheckCircle, Users, Shield, DollarSign, TrendingUp, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface CashSession {
  id: string;
  date_session: string;
  culto_evento: string;
  status: string;
  church_id: string;
  created_by: string;
  validated_by: string | null;
  validated_at: string | null;
}

interface PixEntry {
  id: string;
  amount: number;
  description: string;
}

interface SelectedVolunteer {
  id: string;
  name: string;
  amount: number;
}

export const CashFlowManager = () => {
  const { profile } = useAuth();
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [newSessionData, setNewSessionData] = useState({
    date_session: new Date().toISOString().split('T')[0],
    culto_evento: ''
  });
  
  // Estados para entradas
  const [entradas, setEntradas] = useState({
    dinheiro: 0,
    cartao_debito: 0,
    cartao_credito: 0
  });
  
  // Estados para PIX (múltiplas linhas)
  const [pixEntries, setPixEntries] = useState<PixEntry[]>([]);
  
  // Estados para saídas
  const [selectedVolunteers, setSelectedVolunteers] = useState<SelectedVolunteer[]>([]);
  const [saidas, setSaidas] = useState({
    valor_seguranca: 0,
    outros_gastos: 0,
    outros_descricao: ''
  });

  const [sessions, setSessions] = useState<CashSession[]>([]);

  useEffect(() => {
    if (profile?.church_id) {
      loadSessions();
    }
  }, [profile]);

  const loadSessions = async () => {
    if (!profile?.church_id) return;

    const { data, error } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('church_id', profile.church_id)
      .order('date_session', { ascending: false });

    if (error) {
      console.error('Erro ao carregar sessões:', error);
      return;
    }

    setSessions(data || []);
  };

  const createNewSession = async () => {
    if (!profile?.church_id || !newSessionData.culto_evento) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const { data, error } = await supabase
      .from('cash_sessions')
      .insert({
        church_id: profile.church_id,
        date_session: newSessionData.date_session,
        culto_evento: newSessionData.culto_evento,
        created_by: profile.id
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar sessão:', error);
      toast.error('Erro ao criar sessão de caixa');
      return;
    }

    setCurrentSession(data);
    loadSessions();
    toast.success('Sessão criada com sucesso!');
  };

  const saveEntradas = async () => {
    if (!currentSession) return;

    try {
      // Salvar transações tradicionais (dinheiro, cartão débito, cartão crédito)
      const transactions = [
        {
          cash_session_id: currentSession.id,
          type: 'entrada' as const,
          category: 'dinheiro' as const,
          description: 'Entrada em Dinheiro',
          amount: entradas.dinheiro,
          date_transaction: currentSession.date_session,
          culto_evento: currentSession.culto_evento,
          user_id: profile?.id
        },
        {
          cash_session_id: currentSession.id,
          type: 'entrada' as const,
          category: 'cartao_debito' as const,
          description: 'Entrada Cartão Débito',
          amount: entradas.cartao_debito,
          date_transaction: currentSession.date_session,
          culto_evento: currentSession.culto_evento,
          user_id: profile?.id
        },
        {
          cash_session_id: currentSession.id,
          type: 'entrada' as const,
          category: 'cartao_credito' as const,
          description: 'Entrada Cartão Crédito',
          amount: entradas.cartao_credito,
          date_transaction: currentSession.date_session,
          culto_evento: currentSession.culto_evento,
          user_id: profile?.id
        }
      ].filter(t => t.amount > 0);

      if (transactions.length > 0) {
        const { error: transError } = await supabase
          .from('transactions')
          .insert(transactions);

        if (transError) {
          console.error('Erro ao salvar transações:', transError);
          toast.error('Erro ao salvar transações tradicionais');
          return;
        }
      }

      // Salvar entradas PIX na tabela pix_entries
      if (pixEntries.length > 0) {
        const pixData = pixEntries.map(pix => ({
          cash_session_id: currentSession.id,
          amount: pix.amount,
          description: pix.description || 'Entrada PIX'
        }));

        const { error: pixError } = await supabase
          .from('pix_entries')
          .insert(pixData);

        if (pixError) {
          console.error('Erro ao salvar entradas PIX:', pixError);
          toast.error('Erro ao salvar entradas PIX');
          return;
        }
      }

      toast.success('Entradas salvas com sucesso!');
    } catch (error) {
      console.error('Erro geral ao salvar entradas:', error);
      toast.error('Erro ao salvar entradas');
    }
  };

  const saveSaidas = async () => {
    if (!currentSession) return;

    const transactions = [];

    // Adicionar transações dos voluntários
    selectedVolunteers.forEach(volunteer => {
      if (volunteer.amount > 0) {
        transactions.push({
          cash_session_id: currentSession.id,
          type: 'saida' as const,
          description: `Pagamento Voluntário: ${volunteer.name}`,
          amount: volunteer.amount,
          date_transaction: currentSession.date_session,
          culto_evento: currentSession.culto_evento,
          user_id: profile?.id
        });
      }
    });

    // Adicionar outras saídas
    if (saidas.valor_seguranca > 0) {
      transactions.push({
        cash_session_id: currentSession.id,
        type: 'saida' as const,
        description: 'Pagamento Segurança',
        amount: saidas.valor_seguranca,
        date_transaction: currentSession.date_session,
        culto_evento: currentSession.culto_evento,
        valor_seguranca: saidas.valor_seguranca,
        user_id: profile?.id
      });
    }

    if (saidas.outros_gastos > 0) {
      transactions.push({
        cash_session_id: currentSession.id,
        type: 'saida' as const,
        description: saidas.outros_descricao || 'Outros Gastos',
        amount: saidas.outros_gastos,
        date_transaction: currentSession.date_session,
        culto_evento: currentSession.culto_evento,
        outros_gastos: saidas.outros_gastos,
        user_id: profile?.id
      });
    }

    if (transactions.length === 0) {
      toast.error('Adicione pelo menos uma saída');
      return;
    }

    const { error } = await supabase
      .from('transactions')
      .insert(transactions);

    if (error) {
      console.error('Erro ao salvar saídas:', error);
      toast.error('Erro ao salvar saídas');
      return;
    }

    toast.success('Saídas salvas com sucesso!');
  };

  const handleSessionValidated = () => {
    loadSessions();
    if (currentSession) {
      // Atualizar o status da sessão atual
      setCurrentSession(prev => prev ? { ...prev, status: 'validado' } : null);
    }
  };

  const selectSession = (session: CashSession) => {
    setCurrentSession(session);
    // Reset form data when selecting a different session
    setEntradas({ dinheiro: 0, cartao_debito: 0, cartao_credito: 0 });
    setPixEntries([]);
    setSelectedVolunteers([]);
    setSaidas({
      valor_seguranca: 0,
      outros_gastos: 0,
      outros_descricao: ''
    });
  };

  const totalPix = pixEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalEntradas = entradas.dinheiro + entradas.cartao_debito + entradas.cartao_credito + totalPix;
  const totalVolunteers = selectedVolunteers.reduce((sum, v) => sum + v.amount, 0);
  const totalSaidas = totalVolunteers + saidas.valor_seguranca + saidas.outros_gastos;
  const saldo = totalEntradas - totalSaidas;

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
              <Button onClick={createNewSession} className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
                <Plus className="h-5 w-5 mr-2" />
                Iniciar Sessão de Caixa
              </Button>
            </CardContent>
          </Card>
        </div>
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
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-green-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <DollarSign className="h-5 w-5" />
                    Registro de Entradas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MoneyInput
                      label="Dinheiro"
                      value={entradas.dinheiro}
                      onChange={(value) => setEntradas({...entradas, dinheiro: value})}
                    />
                    <MoneyInput
                      label="Cartão Débito"
                      value={entradas.cartao_debito}
                      onChange={(value) => setEntradas({...entradas, cartao_debito: value})}
                    />
                    <MoneyInput
                      label="Cartão Crédito"
                      value={entradas.cartao_credito}
                      onChange={(value) => setEntradas({...entradas, cartao_credito: value})}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <PixManager
                      entries={pixEntries}
                      onEntriesChange={setPixEntries}
                      onSave={() => {}}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t bg-green-50 p-4 rounded-lg">
                    <span className="text-lg font-semibold text-green-800">Total de Entradas:</span>
                    <span className="text-2xl font-bold text-green-800">
                      R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <Button onClick={saveEntradas} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                    Salvar Entradas
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saidas" className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-red-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <Users className="h-5 w-5" />
                    Registro de Saídas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <VolunteerSelector
                    selectedVolunteers={selectedVolunteers}
                    onVolunteersChange={setSelectedVolunteers}
                  />

                  <MoneyInput
                    label="Valor Segurança"
                    value={saidas.valor_seguranca}
                    onChange={(value) => setSaidas({...saidas, valor_seguranca: value})}
                  />

                  <div className="space-y-3">
                    <MoneyInput
                      label="Outros Gastos"
                      value={saidas.outros_gastos}
                      onChange={(value) => setSaidas({...saidas, outros_gastos: value})}
                    />
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Descrição dos outros gastos</Label>
                      <Textarea
                        placeholder="Descreva os outros gastos..."
                        value={saidas.outros_descricao}
                        onChange={(e) => setSaidas({...saidas, outros_descricao: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Voluntários ({selectedVolunteers.length}):</span>
                          <span className="font-medium">R$ {totalVolunteers.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Segurança:</span>
                          <span className="font-medium">R$ {saidas.valor_seguranca.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Outros:</span>
                          <span className="font-medium">R$ {saidas.outros_gastos.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 text-lg font-bold text-red-600">
                          <span>Total Saídas:</span>
                          <span>R$ {totalSaidas.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button onClick={saveSaidas} className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg">
                    Salvar Saídas
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validacao">
              <SessionValidation 
                session={currentSession}
                onSessionValidated={handleSessionValidated}
              />
            </TabsContent>

            <TabsContent value="resumo">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-blue-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <TrendingUp className="h-5 w-5" />
                    Resumo da Sessão
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="bg-green-50 border-green-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-green-800 text-lg">ENTRADAS</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Dinheiro:</span>
                            <span className="font-medium">R$ {entradas.dinheiro.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cartão Débito:</span>
                            <span className="font-medium">R$ {entradas.cartao_debito.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cartão Crédito:</span>
                            <span className="font-medium">R$ {entradas.cartao_credito.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>PIX ({pixEntries.length} entradas):</span>
                            <span className="font-medium">R$ {totalPix.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2 text-lg font-bold text-green-700">
                            <span>Total Entradas:</span>
                            <span>R$ {totalEntradas.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50 border-red-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-red-800 text-lg">SAÍDAS</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Voluntários ({selectedVolunteers.length}):</span>
                            <span className="font-medium">R$ {totalVolunteers.toFixed(2)}</span>
                          </div>
                          {selectedVolunteers.map(volunteer => (
                            <div key={volunteer.id} className="flex justify-between text-xs pl-4 text-gray-600">
                              <span>• {volunteer.name}:</span>
                              <span>R$ {volunteer.amount.toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between">
                            <span>Segurança:</span>
                            <span className="font-medium">R$ {saidas.valor_seguranca.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Outros:</span>
                            <span className="font-medium">R$ {saidas.outros_gastos.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2 text-lg font-bold text-red-700">
                            <span>Total Saídas:</span>
                            <span>R$ {totalSaidas.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className={`mt-6 ${saldo >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <CardContent className="p-6 text-center">
                      <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                        Saldo Final: R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {sessions.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Sessões Anteriores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <Card key={session.id} className="bg-gray-50 border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => selectSession(session)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-800">{session.culto_evento}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(session.date_session).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          session.status === 'aberto' ? 'bg-blue-100 text-blue-800' : 
                          session.status === 'validado' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {session.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
