
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface PixEntry {
  id: string;
  amount: number;
  description: string;
  data_pix: string;
}

interface PixManagerProps {
  entries: PixEntry[];
  onEntriesChange: (entries: PixEntry[]) => void;
  onSave: () => void;
}

export const PixManager = ({ entries, onEntriesChange, onSave }: PixManagerProps) => {
  const [newEntry, setNewEntry] = useState({ 
    amount: '', 
    description: '', 
    data_pix: new Date().toISOString().split('T')[0] 
  });

  const addEntry = () => {
    const amount = parseFloat(newEntry.amount.replace(',', '.'));
    
    if (!amount || amount <= 0) {
      toast.error('Digite um valor válido para o PIX');
      return;
    }

    if (!newEntry.data_pix) {
      toast.error('Digite uma data válida para o PIX');
      return;
    }

    const entry: PixEntry = {
      id: Date.now().toString(),
      amount,
      description: newEntry.description || `PIX #${entries.length + 1}`,
      data_pix: newEntry.data_pix
    };

    onEntriesChange([...entries, entry]);
    setNewEntry({ 
      amount: '', 
      description: '', 
      data_pix: new Date().toISOString().split('T')[0] 
    });
    toast.success('Entrada PIX adicionada!');
  };

  const removeEntry = (id: string) => {
    onEntriesChange(entries.filter(entry => entry.id !== id));
    toast.success('Entrada PIX removida!');
  };

  const updateEntry = (id: string, field: 'amount' | 'description' | 'data_pix', value: string) => {
    const updatedEntries = entries.map(entry => {
      if (entry.id === id) {
        if (field === 'amount') {
          const numericValue = parseFloat(value.replace(',', '.')) || 0;
          return { ...entry, amount: numericValue };
        } else {
          return { ...entry, [field]: value };
        }
      }
      return entry;
    });
    onEntriesChange(updatedEntries);
  };

  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="h-5 w-5 text-blue-600" />
        <h4 className="font-semibold text-gray-800">Entradas PIX</h4>
      </div>

      {/* Formulário para nova entrada */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-sm font-medium">Valor PIX</Label>
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
              <Label className="text-sm font-medium">Data PIX</Label>
              <Input
                type="date"
                value={newEntry.data_pix}
                onChange={(e) => setNewEntry({ ...newEntry, data_pix: e.target.value })}
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
              <Button onClick={addEntry} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar PIX
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de entradas */}
      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <Card key={entry.id} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                  <div className="font-medium text-gray-600">
                    PIX #{index + 1}
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500">Valor</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <Input
                        type="text"
                        value={entry.amount.toFixed(2)}
                        onChange={(e) => updateEntry(entry.id, 'amount', e.target.value)}
                        className="pl-10 text-right font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Data PIX</Label>
                    <Input
                      type="date"
                      value={entry.data_pix}
                      onChange={(e) => updateEntry(entry.id, 'data_pix', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500">Descrição</Label>
                    <Input
                      value={entry.description}
                      onChange={(e) => updateEntry(entry.id, 'description', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEntry(entry.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Total */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-green-800">Total PIX:</span>
                <span className="text-xl font-bold text-green-800">
                  {formatCurrency(total)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
