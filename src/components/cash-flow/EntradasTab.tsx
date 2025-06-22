
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PixManager } from '@/components/PixManager';
import { DollarSign, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface PixEntry {
  id: string;
  amount: number;
  description: string;
  data_pix: string;
}

interface EntradaEntry {
  id: string;
  type: 'dinheiro' | 'cartao_debito' | 'cartao_credito';
  amount: number;
  description: string;
  date: string;
}

interface EntradasTabProps {
  entradas: {
    dinheiro: number;
    cartao_debito: number;
    cartao_credito: number;
  };
  setEntradas: (entradas: { dinheiro: number; cartao_debito: number; cartao_credito: number }) => void;
  pixEntries: PixEntry[];
  setPixEntries: (entries: PixEntry[]) => void;
  totalEntradas: number;
  onSaveEntradas: () => void;
}

export const EntradasTab = ({
  entradas,
  setEntradas,
  pixEntries,
  setPixEntries,
  totalEntradas,
  onSaveEntradas
}: EntradasTabProps) => {
  const [entradaEntries, setEntradaEntries] = useState<EntradaEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    type: 'dinheiro' as 'dinheiro' | 'cartao_debito' | 'cartao_credito',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const typeLabels = {
    dinheiro: 'Dinheiro',
    cartao_debito: 'Cartão Débito',
    cartao_credito: 'Cartão Crédito'
  };

  const addEntradaEntry = () => {
    const amount = parseFloat(newEntry.amount.replace(',', '.'));
    
    if (!amount || amount <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    if (!newEntry.date) {
      toast.error('Digite uma data válida');
      return;
    }

    const entry: EntradaEntry = {
      id: Date.now().toString(),
      type: newEntry.type,
      amount,
      description: newEntry.description || `${typeLabels[newEntry.type]} #${entradaEntries.length + 1}`,
      date: newEntry.date
    };

    const updatedEntries = [...entradaEntries, entry];
    setEntradaEntries(updatedEntries);
    
    // Atualizar os totais por tipo
    updateEntradasFromEntries(updatedEntries);
    
    setNewEntry({
      type: 'dinheiro',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    
    toast.success('Entrada adicionada!');
  };

  const removeEntradaEntry = (id: string) => {
    const updatedEntries = entradaEntries.filter(entry => entry.id !== id);
    setEntradaEntries(updatedEntries);
    updateEntradasFromEntries(updatedEntries);
    toast.success('Entrada removida!');
  };

  const updateEntradaEntry = (id: string, field: keyof EntradaEntry, value: string | number) => {
    const updatedEntries = entradaEntries.map(entry => {
      if (entry.id === id) {
        if (field === 'amount') {
          const numericValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) || 0 : value;
          return { ...entry, amount: numericValue };
        } else {
          return { ...entry, [field]: value };
        }
      }
      return entry;
    });
    setEntradaEntries(updatedEntries);
    updateEntradasFromEntries(updatedEntries);
  };

  const updateEntradasFromEntries = (entries: EntradaEntry[]) => {
    const totals = entries.reduce((acc, entry) => {
      acc[entry.type] += entry.amount;
      return acc;
    }, { dinheiro: 0, cartao_debito: 0, cartao_credito: 0 });
    
    setEntradas(totals);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-green-50 border-b">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <DollarSign className="h-5 w-5" />
          Registro de Entradas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Formulário para nova entrada */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <Label className="text-sm font-medium">Tipo</Label>
                <select
                  value={newEntry.type}
                  onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao_debito">Cartão Débito</option>
                  <option value="cartao_credito">Cartão Crédito</option>
                </select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Valor</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                  <Input
                    type="text"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                    placeholder="0,00"
                    className="pl-10 text-right font-mono"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Data</Label>
                <Input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <Input
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  placeholder="Descrição opcional"
                />
              </div>
              
              <div className="flex items-end">
                <Button onClick={addEntradaEntry} className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de entradas */}
        {entradaEntries.length > 0 && (
          <div className="space-y-3">
            {entradaEntries.map((entry, index) => (
              <Card key={entry.id} className="border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                    <div className="font-medium text-gray-600">
                      {typeLabels[entry.type]} #{index + 1}
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Valor</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                        <Input
                          type="text"
                          value={entry.amount.toFixed(2)}
                          onChange={(e) => updateEntradaEntry(entry.id, 'amount', e.target.value)}
                          className="pl-10 text-right font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Data</Label>
                      <Input
                        type="date"
                        value={entry.date}
                        onChange={(e) => updateEntradaEntry(entry.id, 'date', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Descrição</Label>
                      <Input
                        value={entry.description}
                        onChange={(e) => updateEntradaEntry(entry.id, 'description', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Tipo</Label>
                      <select
                        value={entry.type}
                        onChange={(e) => updateEntradaEntry(entry.id, 'type', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="dinheiro">Dinheiro</option>
                        <option value="cartao_debito">Cartão Débito</option>
                        <option value="cartao_credito">Cartão Crédito</option>
                      </select>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEntradaEntry(entry.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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

        <Button onClick={onSaveEntradas} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
          Salvar Entradas
        </Button>
      </CardContent>
    </Card>
  );
};
