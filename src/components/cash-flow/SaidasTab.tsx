
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MoneyInput } from '@/components/MoneyInput';
import { VolunteerSelector } from '@/components/VolunteerSelector';
import { OtherExpensesManager } from '@/components/OtherExpensesManager';
import { Users, Shield, Receipt, ArrowDownCircle, Lock, AlertCircle, Check } from 'lucide-react';

interface SelectedVolunteer {
  id: string;
  name: string;
  amount: number;
}

interface OtherExpense {
  id: string;
  amount: number;
  description: string;
}

interface SaidasTabProps {
  selectedVolunteers: SelectedVolunteer[];
  setSelectedVolunteers: (volunteers: SelectedVolunteer[]) => void;
  saidas: { valor_seguranca: number };
  setSaidas: (saidas: { valor_seguranca: number }) => void;
  otherExpenses: OtherExpense[];
  setOtherExpenses: (expenses: OtherExpense[]) => void;
  totalVolunteers: number;
  totalOtherExpenses: number;
  totalSaidas: number;
  onSaveSaidas: () => Promise<void>;
  isSessionValidated?: boolean;
  exitsSaved?: boolean;
}

export const SaidasTab = ({ 
  selectedVolunteers, 
  setSelectedVolunteers, 
  saidas, 
  setSaidas, 
  otherExpenses,
  setOtherExpenses,
  totalVolunteers,
  totalOtherExpenses,
  totalSaidas, 
  onSaveSaidas,
  isSessionValidated = false,
  exitsSaved = false
}: SaidasTabProps) => {
  const [showVolunteerSelector, setShowVolunteerSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const removeVolunteer = (id: string) => {
    if (isSessionValidated || exitsSaved) return;
    setSelectedVolunteers(selectedVolunteers.filter(v => v.id !== id));
  };

  const updateVolunteerAmount = (id: string, amount: number) => {
    if (isSessionValidated || exitsSaved) return;
    setSelectedVolunteers(selectedVolunteers.map(v => 
      v.id === id ? { ...v, amount } : v
    ));
  };

  const handleSaveSaidas = async () => {
    setIsLoading(true);
    try {
      await onSaveSaidas();
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isSessionValidated || exitsSaved;

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

      {/* Alerta de Saídas Salvas */}
      {exitsSaved && !isSessionValidated && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Saídas Salvas</AlertTitle>
          <AlertDescription className="text-green-700">
            As saídas foram salvas com sucesso e não podem mais ser editadas.
          </AlertDescription>
        </Alert>
      )}

      {/* Pagamento de Voluntários */}
      <Card className={`shadow-lg ${isDisabled ? 'bg-gray-50' : ''}`}>
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="flex items-center justify-between text-blue-800">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pagamento de Voluntários
              {isDisabled && <Lock className="h-4 w-4 text-gray-500" />}
              {exitsSaved && <Check className="h-4 w-4 text-green-600" />}
            </div>
            {!isDisabled && (
              <Button 
                onClick={() => setShowVolunteerSelector(true)} 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Selecionar Voluntários
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {selectedVolunteers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg">
                {isDisabled ? 'Nenhum voluntário com pagamento registrado' : 'Nenhum voluntário selecionado ainda'}
              </p>
              {!isDisabled && (
                <p className="text-sm mt-2">
                  Clique em "Selecionar Voluntários" para adicionar pagamentos
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {selectedVolunteers.map((volunteer) => (
                <div key={volunteer.id} className={`flex items-center justify-between p-4 border rounded-lg ${isDisabled ? 'bg-gray-100' : 'bg-gray-50'}`}>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{volunteer.name}</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <MoneyInput
                        value={volunteer.amount}
                        onChange={(value) => updateVolunteerAmount(volunteer.id, value)}
                        placeholder="R$ 0,00"
                        disabled={isDisabled}
                        className={isDisabled ? 'bg-gray-200 cursor-not-allowed' : ''}
                      />
                    </div>
                    {!isDisabled && (
                      <Button
                        onClick={() => removeVolunteer(volunteer.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {selectedVolunteers.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Total Voluntários:</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  R$ {totalVolunteers.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Valor Segurança */}
      <Card className={`shadow-lg ${isDisabled ? 'bg-gray-50' : ''}`}>
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Shield className="h-5 w-5" />
            Pagamento Segurança
            {isDisabled && <Lock className="h-4 w-4 text-gray-500" />}
            {exitsSaved && <Check className="h-4 w-4 text-green-600" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-2">
            <Label htmlFor="valor_seguranca" className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Valor Segurança
            </Label>
            <MoneyInput
              id="valor_seguranca"
              value={saidas.valor_seguranca}
              onChange={(value) => !isDisabled && setSaidas({...saidas, valor_seguranca: value})}
              placeholder="R$ 0,00"
              disabled={isDisabled}
              className={isDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}
            />
          </div>
        </CardContent>
      </Card>

      {/* Outros Gastos */}
      <Card className={`shadow-lg ${isDisabled ? 'bg-gray-50' : ''}`}>
        <CardHeader className="bg-orange-50 border-b">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Receipt className="h-5 w-5" />
            Outros Gastos
            {isDisabled && <Lock className="h-4 w-4 text-gray-500" />}
            {exitsSaved && <Check className="h-4 w-4 text-green-600" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <OtherExpensesManager
            expenses={otherExpenses}
            onExpensesChange={setOtherExpenses}
            disabled={isDisabled}
          />
        </CardContent>
      </Card>

      {/* Resumo Total */}
      <Card className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold mb-2">Total de Saídas</h3>
              <div className="text-sm text-red-100">
                Voluntários: R$ {totalVolunteers.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • 
                Segurança: R$ {saidas.valor_seguranca.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • 
                Outros: R$ {totalOtherExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      {!isDisabled && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveSaidas}
            size="lg" 
            className="bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <ArrowDownCircle className="h-4 w-4 mr-2" />
                Salvar Saídas
              </>
            )}
          </Button>
        </div>
      )}

      {/* Seletor de Voluntários */}
      {showVolunteerSelector && !isDisabled && (
        <VolunteerSelector
          selectedVolunteers={selectedVolunteers}
          onVolunteersChange={(volunteers) => {
            setSelectedVolunteers(volunteers);
            setShowVolunteerSelector(false);
          }}
        />
      )}
    </div>
  );
};
