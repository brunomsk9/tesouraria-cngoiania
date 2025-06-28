import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MoneyInput } from '@/components/MoneyInput';
import { VolunteerSelector } from '@/components/VolunteerSelector';
import { Users, Shield, Receipt, ArrowDownCircle, Lock, AlertCircle } from 'lucide-react';

interface SelectedVolunteer {
  id: string;
  name: string;
  amount: number;
}

interface SaidasTabProps {
  selectedVolunteers: SelectedVolunteer[];
  setSelectedVolunteers: (volunteers: SelectedVolunteer[]) => void;
  saidas: {
    valor_seguranca: number;
    outros_gastos: number;
    outros_descricao: string;
  };
  setSaidas: (saidas: any) => void;
  totalVolunteers: number;
  totalSaidas: number;
  onSaveSaidas: () => void;
  isSessionValidated?: boolean;
}

export const SaidasTab = ({ 
  selectedVolunteers, 
  setSelectedVolunteers, 
  saidas, 
  setSaidas, 
  totalVolunteers, 
  totalSaidas, 
  onSaveSaidas,
  isSessionValidated = false
}: SaidasTabProps) => {
  const [showVolunteerSelector, setShowVolunteerSelector] = useState(false);

  const removeVolunteer = (id: string) => {
    if (isSessionValidated) return;
    setSelectedVolunteers(selectedVolunteers.filter(v => v.id !== id));
  };

  const updateVolunteerAmount = (id: string, amount: number) => {
    if (isSessionValidated) return;
    setSelectedVolunteers(selectedVolunteers.map(v => 
      v.id === id ? { ...v, amount } : v
    ));
  };

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

      {/* Pagamento de Voluntários */}
      <Card className={`shadow-lg ${isSessionValidated ? 'bg-gray-50' : ''}`}>
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="flex items-center justify-between text-blue-800">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pagamento de Voluntários
              {isSessionValidated && <Lock className="h-4 w-4 text-gray-500" />}
            </div>
            {!isSessionValidated && (
              <Button 
                onClick={() => setShowVolunteerSelector(true)} 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                Adicionar Voluntário
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {selectedVolunteers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {isSessionValidated ? 'Nenhum voluntário com pagamento registrado' : 'Nenhum voluntário selecionado ainda'}
            </div>
          ) : (
            <div className="space-y-4">
              {selectedVolunteers.map((volunteer) => (
                <div key={volunteer.id} className={`flex items-center justify-between p-4 border rounded-lg ${isSessionValidated ? 'bg-gray-100' : 'bg-gray-50'}`}>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{volunteer.name}</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <MoneyInput
                        value={volunteer.amount}
                        onChange={(value) => updateVolunteerAmount(volunteer.id, value)}
                        placeholder="R$ 0,00"
                        disabled={isSessionValidated}
                        className={isSessionValidated ? 'bg-gray-200 cursor-not-allowed' : ''}
                      />
                    </div>
                    {!isSessionValidated && (
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

      {/* Outras Saídas */}
      <Card className={`shadow-lg ${isSessionValidated ? 'bg-gray-50' : ''}`}>
        <CardHeader className="bg-orange-50 border-b">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Receipt className="h-5 w-5" />
            Outras Saídas
            {isSessionValidated && <Lock className="h-4 w-4 text-gray-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor_seguranca" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Valor Segurança
              </Label>
              <MoneyInput
                id="valor_seguranca"
                value={saidas.valor_seguranca}
                onChange={(value) => !isSessionValidated && setSaidas({...saidas, valor_seguranca: value})}
                placeholder="R$ 0,00"
                disabled={isSessionValidated}
                className={isSessionValidated ? 'bg-gray-100 cursor-not-allowed' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="outros_gastos" className="text-sm font-medium text-gray-700">
                Outros Gastos
              </Label>
              <MoneyInput
                id="outros_gastos"
                value={saidas.outros_gastos}
                onChange={(value) => !isSessionValidated && setSaidas({...saidas, outros_gastos: value})}
                placeholder="R$ 0,00"
                disabled={isSessionValidated}
                className={isSessionValidated ? 'bg-gray-100 cursor-not-allowed' : ''}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="outros_descricao" className="text-sm font-medium text-gray-700">
              Descrição dos Outros Gastos
            </Label>
            <Input
              id="outros_descricao"
              value={saidas.outros_descricao}
              onChange={(e) => !isSessionValidated && setSaidas({...saidas, outros_descricao: e.target.value})}
              placeholder="Descreva os outros gastos..."
              disabled={isSessionValidated}
              className={isSessionValidated ? 'bg-gray-100 cursor-not-allowed' : ''}
            />
          </div>
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
                Outros: R$ {saidas.outros_gastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
      {!isSessionValidated && (
        <div className="flex justify-end">
          <Button 
            onClick={onSaveSaidas} 
            size="lg" 
            className="bg-red-600 hover:bg-red-700"
          >
            <ArrowDownCircle className="h-4 w-4 mr-2" />
            Salvar Saídas
          </Button>
        </div>
      )}

      {/* Seletor de Voluntários */}
      {showVolunteerSelector && !isSessionValidated && (
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
