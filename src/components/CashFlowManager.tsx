import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Calendar, Plus, Trash2, CheckCircle, Users, Shield, DollarSign } from 'lucide-react';

interface CashSession {
  id: string;
  date_session: string;
  culto_evento: string;
  status: string;
  church_id: string;
  created_by: string;
  validated_by_1: string | null;
  validated_by_2: string | null;
  validated_at: string | null;
}

interface PixEntry {
  id: string;
  amount: number;
  description: string;
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
  const [newPix, setNewPix] = useState({ amount: 0, description: '' });
  
  // Estados para saídas
  const [saidas, setSaidas] = useState({
    voluntarios: 0,
    valor_por_voluntario: 30,
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
    toast.success('Sessão de caixa criada com sucesso!');
  };

  const addPixEntry = async () => {
    if (!currentSession || newPix.amount <= 0) return;

    const { error } = await supabase
      .from('pix_entries')
      .insert({
        cash_session_id: currentSession.id,
        amount: newPix.amount,
        description: newPix.description
      });

    if (error) {
      console.error('Erro ao adicionar PIX:', error);
      toast.error('Erro ao adicionar entrada PIX');
      return;
    }

    setPixEntries([...pixEntries, { 
      id: Date.now().toString(), 
      amount: newPix.amount, 
      description: newPix.description 
    }]);
    setNewPix({ amount: 0, description: '' });
    toast.success('Entrada PIX adicionada!');
  };

  const removePixEntry = async (index: number, pixId: string) => {
    if (pixId !== Date.now().toString()) {
      const { error } = await supabase
        .from('pix_entries')
        .delete()
        .eq('id', pixId);

      if (error) {
        console.error('Erro ao remover PIX:', error);
        toast.error('Erro ao remover entrada PIX');
        return;
      }
    }

    const newEntries = pixEntries.filter((_, i) => i !== index);
    setPixEntries(newEntries);
    toast.success('Entrada PIX removida!');
  };

  const saveEntradas = async () => {
    if (!currentSession) return;

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

    const { error } = await supabase
      .from('transactions')
      .insert(transactions);

    if (error) {
      console.error('Erro ao salvar entradas:', error);
      toast.error('Erro ao salvar entradas');
      return;
    }

    toast.success('Entradas salvas com sucesso!');
  };

  const saveSaidas = async () => {
    if (!currentSession) return;

    const totalVoluntarios = saidas.voluntarios * saidas.valor_por_voluntario;
    const transactions = [
      {
        cash_session_id: currentSession.id,
        type: 'saida' as const,
        description: `Pagamento ${saidas.voluntarios} Voluntário(s)`,
        amount: totalVoluntarios,
        date_transaction: currentSession.date_session,
        culto_evento: currentSession.culto_evento,
        voluntarios: saidas.voluntarios,
        user_id: profile?.id
      },
      {
        cash_session_id: currentSession.id,
        type: 'saida' as const,
        description: 'Pagamento Segurança',
        amount: saidas.valor_seguranca,
        date_transaction: currentSession.date_session,
        culto_evento: currentSession.culto_evento,
        valor_seguranca: saidas.valor_seguranca,
        user_id: profile?.id
      },
      {
        cash_session_id: currentSession.id,
        type: 'saida' as const,
        description: saidas.outros_descricao || 'Outros Gastos',
        amount: saidas.outros_gastos,
        date_transaction: currentSession.date_session,
        culto_evento: currentSession.culto_evento,
        outros_gastos: saidas.outros_gastos,
        user_id: profile?.id
      }
    ].filter(t => t.amount > 0);

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

  const totalPix = pixEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalEntradas = entradas.dinheiro + entradas.cartao_debito + entradas.cartao_credito + totalPix;
  const totalSaidas = (saidas.voluntarios * saidas.valor_por_voluntario) + saidas.valor_seguranca + saidas.outros_gastos;
  const saldo = totalEntradas - totalSaidas;

  if (profile?.role === 'supervisor') {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Supervisor - Apenas Visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Como supervisor, você pode visualizar os relatórios de todas as igrejas, 
              mas não pode criar ou modificar sessões de caixa.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sistema de Fluxo de Caixa</h1>
        <div className="text-sm text-gray-500">
          Igreja: {profile?.church_id ? 'Configurada' : 'Não configurada'}
        </div>
      </div>

      {!currentSession ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Iniciar Nova Sessão de Caixa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Data da Sessão</Label>
                <Input
                  id="date"
                  type="date"
                  value={newSessionData.date_session}
                  onChange={(e) => setNewSessionData({...newSessionData, date_session: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="evento">Culto/Evento</Label>
                <Input
                  id="evento"
                  placeholder="Ex: Culto Domingo Manhã"
                  value={newSessionData.culto_evento}
                  onChange={(e) => setNewSessionData({...newSessionData, culto_evento: e.target.value})}
                />
              </div>
            </div>
            <Button onClick={createNewSession} className="w-full">
              Iniciar Sessão de Caixa
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">
                Sessão Ativa: {currentSession.culto_evento}
              </CardTitle>
              <p className="text-blue-600">
                Data: {new Date(currentSession.date_session).toLocaleDateString('pt-BR')} | 
                Status: {currentSession.status.toUpperCase()}
              </p>
            </CardHeader>
          </Card>

          <Tabs defaultValue="entradas" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="entradas">Entradas</TabsTrigger>
              <TabsTrigger value="saidas">Saídas</TabsTrigger>
              <TabsTrigger value="validacao">Validação</TabsTrigger>
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
            </TabsList>

            <TabsContent value="entradas" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Registro de Entradas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Dinheiro (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={entradas.dinheiro}
                        onChange={(e) => setEntradas({...entradas, dinheiro: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label>Cartão Débito (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={entradas.cartao_debito}
                        onChange={(e) => setEntradas({...entradas, cartao_debito: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label>Cartão Crédito (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={entradas.cartao_credito}
                        onChange={(e) => setEntradas({...entradas, cartao_credito: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Entradas PIX</h4>
                    
                    <div className="flex gap-2 mb-4">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Valor PIX"
                        value={newPix.amount}
                        onChange={(e) => setNewPix({...newPix, amount: parseFloat(e.target.value) || 0})}
                      />
                      <Input
                        placeholder="Descrição (opcional)"
                        value={newPix.description}
                        onChange={(e) => setNewPix({...newPix, description: e.target.value})}
                      />
                      <Button onClick={addPixEntry} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {pixEntries.length > 0 && (
                      <div className="space-y-2">
                        {pixEntries.map((entry, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                            <div>
                              <span className="font-medium">R$ {entry.amount.toFixed(2)}</span>
                              {entry.description && <span className="text-gray-500 ml-2">- {entry.description}</span>}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePixEntry(index, entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="font-semibold text-green-600">
                          Total PIX: R$ {totalPix.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button onClick={saveEntradas} className="w-full">
                    Salvar Entradas
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saidas" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Registro de Saídas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Quantidade de Voluntários</Label>
                      <Input
                        type="number"
                        value={saidas.voluntarios}
                        onChange={(e) => setSaidas({...saidas, voluntarios: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label>Valor por Voluntário (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={saidas.valor_por_voluntario}
                        onChange={(e) => setSaidas({...saidas, valor_por_voluntario: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Valor Segurança (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={saidas.valor_seguranca}
                      onChange={(e) => setSaidas({...saidas, valor_seguranca: parseFloat(e.target.value) || 0})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Outros Gastos (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={saidas.outros_gastos}
                      onChange={(e) => setSaidas({...saidas, outros_gastos: parseFloat(e.target.value) || 0})}
                    />
                    <Textarea
                      placeholder="Descrição dos outros gastos"
                      value={saidas.outros_descricao}
                      onChange={(e) => setSaidas({...saidas, outros_descricao: e.target.value})}
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded">
                    <div className="space-y-1 text-sm">
                      <div>Voluntários: {saidas.voluntarios} × R$ {saidas.valor_por_voluntario.toFixed(2)} = R$ {(saidas.voluntarios * saidas.valor_por_voluntario).toFixed(2)}</div>
                      <div>Segurança: R$ {saidas.valor_seguranca.toFixed(2)}</div>
                      <div>Outros: R$ {saidas.outros_gastos.toFixed(2)}</div>
                      <div className="font-semibold border-t pt-1">
                        Total Saídas: R$ {totalSaidas.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <Button onClick={saveSaidas} className="w-full">
                    Salvar Saídas
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validacao">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Validação dos Tesoureiros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Validação Pendente</h3>
                    <p className="text-gray-600 mb-4">
                      Esta sessão precisa ser validada por dois tesoureiros para ser finalizada.
                    </p>
                    <Button variant="outline" disabled>
                      Aguardando Implementação da Validação
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resumo">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo da Sessão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-green-600">ENTRADAS</h4>
                      <div className="space-y-1 text-sm">
                        <div>Dinheiro: R$ {entradas.dinheiro.toFixed(2)}</div>
                        <div>Cartão Débito: R$ {entradas.cartao_debito.toFixed(2)}</div>
                        <div>Cartão Crédito: R$ {entradas.cartao_credito.toFixed(2)}</div>
                        <div>PIX: R$ {totalPix.toFixed(2)} ({pixEntries.length} entradas)</div>
                        <div className="font-semibold border-t pt-1">
                          Total Entradas: R$ {totalEntradas.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-red-600">SAÍDAS</h4>
                      <div className="space-y-1 text-sm">
                        <div>Voluntários: R$ {(saidas.voluntarios * saidas.valor_por_voluntario).toFixed(2)}</div>
                        <div>Segurança: R$ {saidas.valor_seguranca.toFixed(2)}</div>
                        <div>Outros: R$ {saidas.outros_gastos.toFixed(2)}</div>
                        <div className="font-semibold border-t pt-1">
                          Total Saídas: R$ {totalSaidas.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-6 p-4 rounded text-center ${
                    saldo >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    <div className="text-lg font-bold">
                      Saldo Final: R$ {saldo.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sessões Anteriores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{session.culto_evento}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(session.date_session).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="text-sm">
                    Status: <span className="font-medium">{session.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
