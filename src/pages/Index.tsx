
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, DollarSign, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { TransactionHistory } from '@/components/TransactionHistory';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'entrada' | 'saida';
  category: string;
  description: string;
  amount: number;
  date: string;
  voluntarios?: number;
  valorSeguranca?: number;
}

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [entradaForm, setEntradaForm] = useState({
    category: '',
    description: '',
    amount: ''
  });
  const [saidaForm, setSaidaForm] = useState({
    description: '',
    voluntarios: '',
    valorSeguranca: '',
    outrosGastos: ''
  });
  
  const { toast } = useToast();

  const categoriesEntrada = [
    'Dízimos',
    'Ofertas',
    'Eventos',
    'Doações',
    'Vendas',
    'Outros'
  ];

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

  const handleEntradaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entradaForm.category || !entradaForm.description || !entradaForm.amount) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'entrada',
      category: entradaForm.category,
      description: entradaForm.description,
      amount: parseFloat(entradaForm.amount),
      date: new Date().toLocaleString('pt-BR')
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setEntradaForm({ category: '', description: '', amount: '' });
    
    toast({
      title: "Entrada registrada",
      description: `Entrada de R$ ${parseFloat(entradaForm.amount).toFixed(2)} registrada com sucesso.`
    });
  };

  const handleSaidaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const voluntarios = parseInt(saidaForm.voluntarios) || 0;
    const valorSeguranca = parseFloat(saidaForm.valorSeguranca) || 0;
    const outrosGastos = parseFloat(saidaForm.outrosGastos) || 0;
    
    if (voluntarios === 0 && valorSeguranca === 0 && outrosGastos === 0) {
      toast({
        title: "Erro",
        description: "Informe pelo menos um valor para a saída.",
        variant: "destructive"
      });
      return;
    }

    const valorVoluntarios = voluntarios * 30;
    const totalSaida = valorVoluntarios + valorSeguranca + outrosGastos;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'saida',
      category: 'Pagamentos',
      description: saidaForm.description || 'Pagamento de voluntários e segurança',
      amount: totalSaida,
      date: new Date().toLocaleString('pt-BR'),
      voluntarios,
      valorSeguranca
    };

    setTransactions(prev => [newTransaction, ...prev]);
    setSaidaForm({ description: '', voluntarios: '', valorSeguranca: '', outrosGastos: '' });
    
    toast({
      title: "Saída registrada",
      description: `Saída de R$ ${totalSaida.toFixed(2)} registrada com sucesso.`
    });
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-800">Sistema de Tesouraria</h1>
          <p className="text-lg text-gray-600">Gestão Financeira da Igreja</p>
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

        {/* Tabs para Entrada e Saída */}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select value={entradaForm.category} onValueChange={(value) => setEntradaForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriesEntrada.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Input
                        id="description"
                        placeholder="Descrição da entrada"
                        value={entradaForm.description}
                        onChange={(e) => setEntradaForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">Valor (R$)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={entradaForm.amount}
                        onChange={(e) => setEntradaForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Entrada
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="saida" className="space-y-4">
                <form onSubmit={handleSaidaSubmit} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description-saida">Descrição (opcional)</Label>
                      <Input
                        id="description-saida"
                        placeholder="Descrição da saída"
                        value={saidaForm.description}
                        onChange={(e) => setSaidaForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="voluntarios">Quantidade de Voluntários</Label>
                        <Input
                          id="voluntarios"
                          type="number"
                          min="0"
                          placeholder="0"
                          value={saidaForm.voluntarios}
                          onChange={(e) => setSaidaForm(prev => ({ ...prev, voluntarios: e.target.value }))}
                        />
                        <p className="text-sm text-gray-500">R$ 30,00 por voluntário</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="seguranca">Valor Segurança (R$)</Label>
                        <Input
                          id="seguranca"
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={saidaForm.valorSeguranca}
                          onChange={(e) => setSaidaForm(prev => ({ ...prev, valorSeguranca: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="outros">Outros Gastos (R$)</Label>
                        <Input
                          id="outros"
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          value={saidaForm.outrosGastos}
                          onChange={(e) => setSaidaForm(prev => ({ ...prev, outrosGastos: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    {(saidaForm.voluntarios || saidaForm.valorSeguranca || saidaForm.outrosGastos) && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Cálculo da Saída:</h4>
                        <div className="space-y-1 text-sm">
                          {saidaForm.voluntarios && (
                            <div className="flex justify-between">
                              <span>Voluntários ({saidaForm.voluntarios}x R$ 30,00):</span>
                              <span>R$ {(parseInt(saidaForm.voluntarios) * 30).toFixed(2)}</span>
                            </div>
                          )}
                          {saidaForm.valorSeguranca && (
                            <div className="flex justify-between">
                              <span>Segurança:</span>
                              <span>R$ {parseFloat(saidaForm.valorSeguranca).toFixed(2)}</span>
                            </div>
                          )}
                          {saidaForm.outrosGastos && (
                            <div className="flex justify-between">
                              <span>Outros gastos:</span>
                              <span>R$ {parseFloat(saidaForm.outrosGastos).toFixed(2)}</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>R$ {(
                              (parseInt(saidaForm.voluntarios) || 0) * 30 + 
                              (parseFloat(saidaForm.valorSeguranca) || 0) + 
                              (parseFloat(saidaForm.outrosGastos) || 0)
                            ).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Registrar Saída
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
