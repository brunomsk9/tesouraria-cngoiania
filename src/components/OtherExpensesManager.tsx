
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Receipt } from 'lucide-react';
import { toast } from 'sonner';

interface OtherExpense {
  id: string;
  amount: number;
  description: string;
}

interface OtherExpensesManagerProps {
  expenses: OtherExpense[];
  onExpensesChange: (expenses: OtherExpense[]) => void;
  disabled?: boolean;
}

export const OtherExpensesManager = ({ 
  expenses, 
  onExpensesChange,
  disabled = false 
}: OtherExpensesManagerProps) => {
  const [newExpense, setNewExpense] = useState({ 
    amount: '', 
    description: ''
  });

  const addExpense = () => {
    const amount = parseFloat(newExpense.amount.replace(',', '.'));
    
    if (!amount || amount <= 0) {
      toast.error('Digite um valor válido para o gasto');
      return;
    }

    if (!newExpense.description.trim()) {
      toast.error('Digite uma descrição para o gasto');
      return;
    }

    const expense: OtherExpense = {
      id: Date.now().toString(),
      amount,
      description: newExpense.description.trim()
    };

    onExpensesChange([...expenses, expense]);
    setNewExpense({ amount: '', description: '' });
    toast.success('Gasto adicionado!');
  };

  const removeExpense = (id: string) => {
    onExpensesChange(expenses.filter(expense => expense.id !== id));
    toast.success('Gasto removido!');
  };

  const updateExpense = (id: string, field: 'amount' | 'description', value: string) => {
    const updatedExpenses = expenses.map(expense => {
      if (expense.id === id) {
        if (field === 'amount') {
          const numericValue = parseFloat(value.replace(',', '.')) || 0;
          return { ...expense, amount: numericValue };
        } else {
          return { ...expense, [field]: value };
        }
      }
      return expense;
    });
    onExpensesChange(updatedExpenses);
  };

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Receipt className="h-5 w-5 text-orange-600" />
        <h4 className="font-semibold text-gray-800">Outros Gastos</h4>
      </div>

      {/* Formulário para nova entrada */}
      {!disabled && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-sm font-medium">Valor</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                  <Input
                    type="text"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0,00"
                    className="pl-10 text-right font-mono"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <Input
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="Descreva o gasto..."
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addExpense} className="w-full bg-orange-600 hover:bg-orange-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Gasto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de gastos */}
      {expenses.length > 0 && (
        <div className="space-y-3">
          {expenses.map((expense, index) => (
            <Card key={expense.id} className="border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                  <div className="font-medium text-gray-600">
                    Gasto #{index + 1}
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500">Valor</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                      <Input
                        type="text"
                        value={expense.amount.toFixed(2)}
                        onChange={(e) => updateExpense(expense.id, 'amount', e.target.value)}
                        className={`pl-10 text-right font-mono text-sm ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        disabled={disabled}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-gray-500">Descrição</Label>
                    <Input
                      value={expense.description}
                      onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
                      className={`text-sm ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      disabled={disabled}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    {!disabled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExpense(expense.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Total */}
          {total > 0 && (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-orange-800">Total Outros Gastos:</span>
                  <span className="text-xl font-bold text-orange-800">
                    {formatCurrency(total)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
