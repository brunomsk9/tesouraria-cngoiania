
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { VolunteerSelector } from '@/components/VolunteerSelector';
import { Users, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SelectedVolunteer {
  id: string;
  name: string;
  amount: number;
}

interface SaidaEntry {
  id: string;
  type: 'seguranca' | 'outros';
  amount: number;
  description: string;
  date: string;
}

interface SaidasTabProps {
  selectedVolunteers: SelectedVolunteer[];
  setSelectedVolunteers: (volunteers: SelectedVolunteer[]) => void;
  saidas: {
    valor_seguranca: number;
    outros_gastos: number;
    outros_descricao: string;
  };
  setSaidas: (saidas: { valor_seguranca: number; outros_gastos: number; outros_descricao: string }) => void;
  totalVolunteers: number;
  totalSaidas: number;
  onSaveSaidas: () => void;
}

export const SaidasTab = ({
  selectedVolunteers,
  setSelectedVolunteers,
  saidas,
  setSaidas,
  totalVolunteers,
  totalSaidas,
  onSaveSaidas
}: SaidasTabProps) => {
  const [saidaEntries, setSaidaEntries] = useState<SaidaEntry[]>([]);
  const [newEntry, setNewEntry] = useState({
    type: 'seguranca' as 'seguranca' | 'outros',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const typeLabels = {
    seguranca: 'Segurança',
    outros: 'Outros Gastos'
  };

  const addSaidaEntry = () => {
    const amount = parseFloat(newEntry.amount.replace(',', '.'));
    
    if (!amount || amount <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    if (!newEntry.date) {
      toast.error('Digite uma data válida');
      return;
    }

    const entry: SaidaEntry = {
      id: Date.now().toString(),
      type: newEntry.type,
      amount,
      description: newEntry.description || `${typeLabels[newEntry.type]} #${saidaEntries.length + 1}`,
      date: newEntry.date
    };

    const updatedEntries = [...saidaEntries, entry];
    setSaidaEntries(updatedEntries);
    
    // Atualizar os totais por tipo
    updateSaidasFromEntries(updatedEntries);
    
    setNewEntry({
      type: 'seguranca',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    
    toast.success('Saída adicionada!');
  };

  const removeSaidaEntry = (id: string) => {
    const updatedEntries = saidaEntries.filter(entry => entry.id !== id);
    setSaidaEntries(updatedEntries);
    updateSaidasFromEntries(updatedEntries);
    toast.success('Saída removida!');
  };

  const updateSaidaEntry = (id: string, field: keyof SaidaEntry, value: string | number) => {
    const updatedEntries = saidaEntries.map(entry => {
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
    setSaidaEntries(updatedEntries);
    updateSaidasFromEntries(updatedEntries);
  };

  const updateSaidasFromEntries = (entries: SaidaEntry[]) => {
    const totals = entries.reduce((acc, entry) => {
      if (entry.type === 'seguranca') {
        acc.valor_seguranca += entry.amount;
      } else {
        acc.outros_gastos += entry.amount;
      }
      return acc;
    }, { valor_seguranca: 0, outros_gastos: 0 });
    
    // Manter a descrição dos outros gastos existente ou usar a última descrição
    const outrosDescricao = entries
      .filter(e => e.type === 'outros')
      .map(e => e.description)
      .join('; ') || saidas.outros_descricao;
    
    setSaidas({
      valor_seguranca: totals.valor_seguranca,
      outros_gastos: totals.outros_gastos,
      outros_descricao: outrosDescricao
    });
  };

  return (
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

        {/* Formulário para nova saída */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <Label className="text-sm font-medium">Tipo</Label>
                <select
                  value={newEntry.type}
                  onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="seguranca">Segurança</option>
                  <option value="outros">Outros Gastos</option>
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
                <Button onClick={addSaidaEntry} className="w-full bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de saídas */}
        {saidaEntries.length > 0 && (
          <div className="space-y-3">
            {saidaEntries.map((entry, index) => (
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
                          onChange={(e) => updateSaidaEntry(entry.id, 'amount', e.target.value)}
                          className="pl-10 text-right font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Data</Label>
                      <Input
                        type="date"
                        value={entry.date}
                        onChange={(e) => updateSaidaEntry(entry.id, 'date', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Descrição</Label>
                      <Input
                        value={entry.description}
                        onChange={(e) => updateSaidaEntry(entry.id, 'description', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">Tipo</Label>
                      <select
                        value={entry.type}
                        onChange={(e) => updateSaidaEntry(entry.id, 'type', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="seguranca">Segurança</option>
                        <option value="outros">Outros Gastos</option>
                      </select>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSaidaEntry(entry.id)}
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

        <Button onClick={onSaveSaidas} className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg">
          Salvar Saídas
        </Button>
      </CardContent>
    </Card>
  );
};
