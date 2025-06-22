
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MoneyInput } from '@/components/MoneyInput';
import { VolunteerSelector } from '@/components/VolunteerSelector';
import { Users } from 'lucide-react';

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

        <MoneyInput
          label="Valor Segurança"
          value={saidas.valor_seguranca}
          onChange={(value) => setSaidas({...saidas, valor_seguranca: value})}
        />

        <div className="space-y-3">
          <MoneyInput
            label="Outros Gastos"
            value={saidas.outros_gastos}
            onChange={(value) => setSaidas({...saidas, outros_gastos: value})}
          />
          <div>
            <Label className="text-sm font-medium text-gray-700">Descrição dos outros gastos</Label>
            <Textarea
              placeholder="Descreva os outros gastos..."
              value={saidas.outros_descricao}
              onChange={(e) => setSaidas({...saidas, outros_descricao: e.target.value})}
              className="mt-1"
            />
          </div>
        </div>

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
