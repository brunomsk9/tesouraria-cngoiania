
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MoneyInput } from '@/components/MoneyInput';
import { Plus, Trash2, DollarSign, CreditCard, Smartphone, Lock, AlertCircle } from 'lucide-react';

interface PixEntry {
  id: string;
  amount: number;
  description: string;
  data_pix: string;
}

interface EntradasTabProps {
  entradas: {
    dinheiro: number;
    cartao_debito: number;
    cartao_credito: number;
  };
  setEntradas: (entradas: any) => void;
  pixEntries: PixEntry[];
  setPixEntries: (entries: PixEntry[]) => void;
  totalEntradas: number;
  onSaveEntradas: () => void;
  isSessionValidated?: boolean;
}

export const EntradasTab = ({ 
  entradas, 
  setEntradas, 
  pixEntries, 
  setPixEntries, 
  totalEntradas, 
  onSaveEntradas,
  isSessionValidated = false
}: EntradasTabProps) => {
  const addPixEntry = () => {
    if (isSessionValidated) return;
    
    const newEntry: PixEntry = {
      id: Date.now().toString(),
      amount: 0,
      description: '',
      data_pix: new Date().toISOString().split('T')[0]
    };
    setPixEntries([...pixEntries, newEntry]);
  };

  const removePixEntry = (id: string) => {
    if (isSessionValidated) return;
    setPixEntries(pixEntries.filter(entry => entry.id !== id));
  };

  const updatePixEntry = (id: string, field: keyof PixEntry, value: string | number) => {
    if (isSessionValidated) return;
    
    setPixEntries(pixEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const totalPix = pixEntries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-6">
      {/* Alerta de Sessão Validada */}
      {isSessionValidated && (
        <Alert className="border-green-200 bg-green-50">
          <Lock className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Sessão Validada</AlertTitle>
          <AlertDescription className="text-green-700">
            Esta sessão foi validada e todos os campos estão travados. Não é possível fazer alterações.
          </AlertDescription>
        </Alert>
      )}

      {/* Entradas Tradicionais */}
      <Card className={`shadow-lg ${isSessionValidated ? 'bg-gray-50' : ''}`}>
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <DollarSign className="h-5 w-5" />
            Entradas Tradicionais
            {isSessionValidated && <Lock className="h-4 w-4 text-gray-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dinheiro" className="text-sm font-medium text-gray-700">
                Dinheiro
              </Label>
              <MoneyInput
                id="dinheiro"
                value={entradas.dinheiro}
                onChange={(value) => !isSessionValidated && setEntradas({...entradas, dinheiro: value})}
                placeholder="R$ 0,00"
                disabled={isSessionValidated}
                className={isSessionValidated ? 'bg-gray-100 cursor-not-allowed' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cartao_debito" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                Cartão Débito
              </Label>
              <MoneyInput
                id="cartao_debito"
                value={entradas.cartao_debito}
                onChange={(value) => !isSessionValidated && setEntradas({...entradas, cartao_debito: value})}
                placeholder="R$ 0,00"
                disabled={isSessionValidated}
                className={isSessionValidated ? 'bg-gray-100 cursor-not-allowed' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cartao_credito" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                Cartão Crédito
              </Label>
              <MoneyInput
                id="cartao_credito"
                value={entradas.cartao_credito}
                onChange={(value) => !isSessionValidated && setEntradas({...entradas, cartao_credito: value})}
                placeholder="R$ 0,00"
                disabled={isSessionValidated}
                className={isSessionValidated ? 'bg-gray-100 cursor-not-allowed' : ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entradas PIX */}
      <Card className={`shadow-lg ${isSessionValidated ? 'bg-gray-50' : ''}`}>
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="flex items-center justify-between text-blue-800">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Entradas PIX
              {isSessionValidated && <Lock className="h-4 w-4 text-gray-500" />}
            </div>
            {!isSessionValidated && (
              <Button onClick={addPixEntry} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar PIX
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {pixEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {isSessionValidated ? 'Nenhuma entrada PIX registrada' : 'Nenhuma entrada PIX adicionada ainda'}
            </div>
          ) : (
            <div className="space-y-4">
              {pixEntries.map((entry) => (
                <div key={entry.id} className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg ${isSessionValidated ? 'bg-gray-100' : 'bg-gray-50'}`}>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Valor</Label>
                    <MoneyInput
                      value={entry.amount}
                      onChange={(value) => updatePixEntry(entry.id, 'amount', value)}
                      placeholder="R$ 0,00"
                      disabled={isSessionValidated}
                      className={isSessionValidated ? 'bg-gray-200 cursor-not-allowed' : ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Descrição</Label>
                    <Input
                      value={entry.description}
                      onChange={(e) => updatePixEntry(entry.id, 'description', e.target.value)}
                      placeholder="Descrição do PIX"
                      disabled={isSessionValidated}
                      className={isSessionValidated ? 'bg-gray-200 cursor-not-allowed' : ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Data</Label>
                    <Input
                      type="date"
                      value={entry.data_pix}
                      onChange={(e) => updatePixEntry(entry.id, 'data_pix', e.target.value)}
                      disabled={isSessionValidated}
                      className={isSessionValidated ? 'bg-gray-200 cursor-not-allowed' : ''}
                    />
                  </div>
                  
                  <div className="flex items-end">
                    {!isSessionValidated && (
                      <Button
                        onClick={() => removePixEntry(entry.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {pixEntries.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Total PIX:</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  R$ {totalPix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo Total */}
      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold mb-2">Total de Entradas</h3>
              <div className="text-sm text-green-100">
                Dinheiro: R$ {entradas.dinheiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • 
                Débito: R$ {entradas.cartao_debito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • 
                Crédito: R$ {entradas.cartao_credito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • 
                PIX: R$ {totalPix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      {!isSessionValidated && (
        <div className="flex justify-end">
          <Button 
            onClick={onSaveEntradas} 
            size="lg" 
            className="bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Salvar Entradas
          </Button>
        </div>
      )}
    </div>
  );
};
