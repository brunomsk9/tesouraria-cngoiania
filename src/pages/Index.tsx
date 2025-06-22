
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Plus, DollarSign, TrendingUp, TrendingDown, Users, LogOut, User, Crown } from 'lucide-react';
import { TransactionHistory } from '@/components/TransactionHistory';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Transaction {
  id: string;
  type: 'entrada' | 'saida';
  category?: string;
  description: string;
  amount: number;
  date: string;
  date_transaction: string;
  culto_evento?: string;
  observacao?: string;
  valor_moeda_estrangeira?: number;
  moeda_estrangeira?: string;
  voluntarios?: number;
  valor_seguranca?: number;
  outros_gastos?: number;
}

const Index = () => {
  const { user, profile, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [entradaForm, setEntradaForm] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    culto_evento: '',
    observacao: '',
    valor_moeda_estrangeira: '',
    moeda_estrangeira: ''
  });

  const [saidaForm, setSaidaForm] = useState({
    description: '',
    date: new Date().toISOString().split('T')[0],
    culto_evento: '',
    observacao: '',
    voluntarios: '',
    valor_seguranca: '',
    outros_gastos: ''
  });

  const categoriesEntrada = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix', label: 'PIX' },
    { value: 'cartao_credito', label: 'Cartão de Crédito' },
    { value: 'cartao_debito', label: 'Cartão de Débito' }
  ];

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTransactions = data?.map(transaction => ({
        id: transaction.id,
        type: transaction.type as 'entrada' | 'saida',
        category: transaction.category,
        description: transaction.description,
        amount: Number(transaction.amount),
        date: new Date(transaction.created_at).toLocaleString('pt-BR'),
        date_transaction: transaction.date_transaction,
        culto_evento: transaction.culto_evento,
        observacao: transaction.observacao,
        valor_moeda_estrangeira: transaction.valor_moeda_estrangeira ? Number(transaction.valor_moeda_estrangeira) : undefined,
        moeda_estrangeira: transaction.moeda_estrangeira,
        voluntarios: transaction.voluntarios,
        valor_seguranca: transaction.valor_seguranca ? Number(transaction.valor_seguranca) : undefined,
        outros_gastos: transaction.outros_gastos ? Number(transaction.outros_gastos) : undefined
      })) || [];

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as transações.",
        variant: "destructive"
      });
    }
  };

  const handleEntradaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entradaForm.category || !entradaForm.description || !entradaForm.amount) {
      toast({
        title: "Erro",
        description: "Por favor, preencha os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('transactions').insert({
        user_id: user!.id,
        type: 'entrada' as const,
        category: entradaForm.category as 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito',
        description: entradaForm.description,
        amount: parseFloat(entradaForm.amount),
        date_transaction: entradaForm.date,
        culto_evento: entradaForm.culto_evento || null,
        observacao: entradaForm.observacao || null,
        valor_moeda_estrangeira: entradaForm.valor_moeda_estrangeira ? parseFloat(entradaForm.valor_moeda_estrangeira) : null,
        moeda_estrangeira: entradaForm.moeda_estrangeira || null
      });

      if (error) throw error;

      toast({
        title: "Entrada registrada",
        description: `Entrada de R$ ${parseFloat(entradaForm.amount).toFixed(2)} registrada com sucesso.`
      });

      setEntradaForm({
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        culto_evento: '',
        observacao: '',
        valor_moeda_estrangeira: '',
        moeda_estrangeira: ''
      });

      fetchTransactions();
    } catch (error) {
      console.error('Erro ao registrar entrada:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a entrada.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaidaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const voluntarios = parseInt(saidaForm.voluntarios) || 0;
    const valor_seguranca = parseFloat(saidaForm.valor_seguranca) || 0;
    const outros_gastos = parseFloat(saidaForm.outros_gastos) || 0;
    
    if (voluntarios === 0 && valor_seguranca === 0 && outros_gastos === 0) {
      toast({
        title: "Erro",
        description: "Informe pelo menos um valor para a saída.",
        variant: "destructive"
      });
      return;
    }

    const valor_voluntarios = voluntarios * 30;
    const total_saida = valor_voluntarios + valor_seguranca + outros_gastos;

    setLoading(true);
    try {
      const { error } = await supabase.from('transactions').insert({
        user_id: user!.id,
        type: 'saida' as const,
        description: saidaForm.description || 'Pagamento de voluntários e segurança',
        amount: total_saida,
        date_transaction: saidaForm.date,
        culto_evento: saidaForm.culto_evento || null,
        observacao: saidaForm.observacao || null,
        voluntarios: voluntarios || null,
        valor_seguranca: valor_seguranca || null,
        outros_gastos: outros_gastos || null
      });

      if (error) throw error;

      toast({
        title: "Saída registrada",
        description: `Saída de R$ ${total_saida.toFixed(2)} registrada com sucesso.`
      });

      setSaidaForm({
        description: '',
        date: new Date().toISOString().split('T')[0],
        culto_evento: '',
        observacao: '',
        voluntarios: '',
        valor_seguranca: '',
        outros_gastos: ''
      });

      fetchTransactions();
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a saída.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const totalEntradas = transactions
      .filter(t => t.type === 'entrada')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalSaidas = transactions
      .filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      entradas: totalEntradas,
      saidas: totalSaidas,
      saldo: totalEntradas - totalSaidas
    };
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header com informações do usuário */}
        <div className="flex justify-between items-center">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-800">Sistema de Tesouraria</h1>
            <p className="text-lg text-gray-600">Gestão Financeira da Igreja</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2">
                {profile?.role === 'master' ? (
                  <Crown className="h-4 w-4 text-yellow-600" />
                ) : (
                  <User className="h-4 w-4 text-blue-600" />
                )}
                <span className="font-semibold text-gray-800">{profile?.name}</span>
              </div>
              <span className="text-sm text-gray-600 capitalize">
                {profile?.role === 'master' ? 'Master' : 'Tesoureiro'}
              </span>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totals.entradas.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Saídas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {totals.saidas.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Saldo Atual</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totals.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                R$ {totals.saldo.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Transações</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {transactions.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulários de Transações */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Registrar Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="entrada" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="entrada" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Entrada
                </TabsTrigger>
                <TabsTrigger value="saida" className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Nova Saída
                </TabsTrigger>
              </TabsList>

              <TabsContent value="entrada" className="space-y-4">
                <form onSubmit={handleEntradaSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Categoria *</Label>
                      <Select value={entradaForm.category} onValueChange={(value) => setEntradaForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesEntrada.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Descrição *</Label>
                      <Input
                        placeholder="Descrição da entrada"
                        value={entradaForm.description}
                        onChange={(e) => setEntradaForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Valor (R$) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={entradaForm.amount}
                        onChange={(e) => setEntradaForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={entradaForm.date}
                        onChange={(e) => setEntradaForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Culto/Evento</Label>
                      <Input
                        placeholder="Ex: Culto Domingo Manhã"
                        value={entradaForm.culto_evento}
                        onChange={(e) => setEntradaForm(prev => ({ ...prev, culto_evento: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Valor Moeda Estrangeira</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={entradaForm.valor_moeda_estrangeira}
                        onChange={(e) => setEntradaForm(prev => ({ ...prev, valor_moeda_estrangeira: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tipo da Moeda</Label>
                      <Input
                        placeholder="Ex: USD, EUR"
                        value={entradaForm.moeda_estrangeira}
                        onChange={(e) => setEntradaForm(prev => ({ ...prev, moeda_estrangeira: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea
                      placeholder="Observações sobre a entrada (ex: doação de objeto)"
                      value={entradaForm.observacao}
                      onChange={(e) => setEntradaForm(prev => ({ ...prev, observacao: e.target.value }))}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    {loading ? 'Registrando...' : 'Registrar Entrada'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="saida" className="space-y-4">
                <form onSubmit={handleSaidaSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input
                        placeholder="Descrição da saída"
                        value={saidaForm.description}
                        onChange={(e) => setSaidaForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Input
                        type="date"
                        value={saidaForm.date}
                        onChange={(e) => setSaidaForm(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Culto/Evento</Label>
                      <Input
                        placeholder="Ex: Culto Domingo Manhã"
                        value={saidaForm.culto_evento}
                        onChange={(e) => setSaidaForm(prev => ({ ...prev, culto_evento: e.target.value }))}
                      />
                    </div>
                  </div>
                    
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Quantidade de Voluntários</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={saidaForm.voluntarios}
                        onChange={(e) => setSaidaForm(prev => ({ ...prev, voluntarios: e.target.value }))}
                      />
                      <p className="text-sm text-gray-500">R$ 30,00 por voluntário</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Valor Segurança (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={saidaForm.valor_seguranca}
                        onChange={(e) => setSaidaForm(prev => ({ ...prev, valor_seguranca: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Outros Gastos (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={saidaForm.outros_gastos}
                        onChange={(e) => setSaidaForm(prev => ({ ...prev, outros_gastos: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea
                      placeholder="Observações sobre a saída"
                      value={saidaForm.observacao}
                      onChange={(e) => setSaidaForm(prev => ({ ...prev, observacao: e.target.value }))}
                    />
                  </div>
                  
                  {(saidaForm.voluntarios || saidaForm.valor_seguranca || saidaForm.outros_gastos) && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Cálculo da Saída:</h4>
                      <div className="space-y-1 text-sm">
                        {saidaForm.voluntarios && (
                          <div className="flex justify-between">
                            <span>Voluntários ({saidaForm.voluntarios}x R$ 30,00):</span>
                            <span>R$ {(parseInt(saidaForm.voluntarios) * 30).toFixed(2)}</span>
                          </div>
                        )}
                        {saidaForm.valor_seguranca && (
                          <div className="flex justify-between">
                            <span>Segurança:</span>
                            <span>R$ {parseFloat(saidaForm.valor_seguranca).toFixed(2)}</span>
                          </div>
                        )}
                        {saidaForm.outros_gastos && (
                          <div className="flex justify-between">
                            <span>Outros gastos:</span>
                            <span>R$ {parseFloat(saidaForm.outros_gastos).toFixed(2)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>R$ {(
                            (parseInt(saidaForm.voluntarios) || 0) * 30 + 
                            (parseFloat(saidaForm.valor_seguranca) || 0) + 
                            (parseFloat(saidaForm.outros_gastos) || 0)
                          ).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                    <TrendingDown className="h-4 w-4 mr-2" />
                    {loading ? 'Registrando...' : 'Registrar Saída'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Histórico de Transações */}
        <TransactionHistory transactions={transactions} />
      </div>
    </div>
  );
};

export default Index;
