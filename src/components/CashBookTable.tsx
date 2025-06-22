
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CashBookEntry {
  date: string;
  description: string;
  type: 'entrada' | 'saida';
  amount: number;
  balance: number;
  session: string;
  category?: string;
}

interface CashBookTableProps {
  entries: CashBookEntry[];
  initialBalance: number;
  onExportToPrint: () => void;
}

export const CashBookTable = ({ entries, initialBalance, onExportToPrint }: CashBookTableProps) => {
  if (entries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Livro Caixa</CardTitle>
        <Button onClick={onExportToPrint} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left">Data</th>
                <th className="border border-gray-300 p-2 text-left">Descrição</th>
                <th className="border border-gray-300 p-2 text-left">Sessão/Evento</th>
                <th className="border border-gray-300 p-2 text-left">Categoria</th>
                <th className="border border-gray-300 p-2 text-right">Entrada</th>
                <th className="border border-gray-300 p-2 text-right">Saída</th>
                <th className="border border-gray-300 p-2 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">
                    {format(new Date(entry.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td className="border border-gray-300 p-2">{entry.description}</td>
                  <td className="border border-gray-300 p-2">{entry.session}</td>
                  <td className="border border-gray-300 p-2">{entry.category || '-'}</td>
                  <td className="border border-gray-300 p-2 text-right">
                    {entry.type === 'entrada' ? (
                      <span className="text-green-600 font-medium">
                        R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {entry.type === 'saida' ? (
                      <span className="text-red-600 font-medium">
                        R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-bold">
                    R$ {entry.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Saldo Final:</span>
            <span className="font-bold text-lg">
              R$ {entries.length > 0 ? entries[entries.length - 1].balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
