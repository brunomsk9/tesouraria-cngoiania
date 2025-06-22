
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/MoneyInput';
import { PixManager } from '@/components/PixManager';
import { DollarSign } from 'lucide-react';

interface PixEntry {
  id: string;
  amount: number;
  description: string;
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
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-green-50 border-b">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <DollarSign className="h-5 w-5" />
          Registro de Entradas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MoneyInput
            label="Dinheiro"
            value={entradas.dinheiro}
            onChange={(value) => setEntradas({...entradas, dinheiro: value})}
          />
          <MoneyInput
            label="Cartão Débito"
            value={entradas.cartao_debito}
            onChange={(value) => setEntradas({...entradas, cartao_debito: value})}
          />
          <MoneyInput
            label="Cartão Crédito"
            value={entradas.cartao_credito}
            onChange={(value) => setEntradas({...entradas, cartao_credito: value})}
          />
        </div>

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
