
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { CashBookEmailModal } from './CashBookEmailModal';

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

interface CashBookSummary {
  dinheiroLiquido: number;
  somaPix: number;
  somaCredito: number;
  somaDebito: number;
  somaSaida: number;
}

export const CashBookTable = ({ entries, initialBalance, onExportToPrint }: CashBookTableProps) => {
  const [showEmailModal, setShowEmailModal] = useState(false);

  if (entries.length === 0) {
    return null;
  }

  const calculateSummary = (): CashBookSummary => {
    let somaDinheiro = 0;
    let somaPix = 0;
    let somaCredito = 0;
    let somaDebito = 0;
    let somaSaida = 0;

    entries.forEach(entry => {
      if (entry.type === 'entrada') {
        switch (entry.category) {
          case 'dinheiro':
            somaDinheiro += entry.amount;
            break;
          case 'pix':
            somaPix += entry.amount;
            break;
          case 'cartao_credito':
            somaCredito += entry.amount;
            break;
          case 'cartao_debito':
            somaDebito += entry.amount;
            break;
        }
      } else if (entry.type === 'saida') {
        somaSaida += entry.amount;
      }
    });

    // Dinheiro líquido = Soma dinheiro - Todas as saídas
    const dinheiroLiquido = somaDinheiro - somaSaida;

    return {
      dinheiroLiquido,
      somaPix,
      somaCredito,
      somaDebito,
      somaSaida
    };
  };

  const summary = calculateSummary();

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Livro Caixa</CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => setShowEmailModal(true)} variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Enviar E-mail
            </Button>
            <Button onClick={onExportToPrint} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
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
                      {(() => {
                        const date = new Date(entry.date + 'T00:00:00');
                        console.log(`Formatando data: ${entry.date} -> ${format(date, 'dd/MM/yyyy', { locale: ptBR })}`);
                        return format(date, 'dd/MM/yyyy', { locale: ptBR });
                      })()}
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

          {/* Resumo */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Resumo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-blue-600 font-medium">Dinheiro Líquido</p>
                  <p className={`text-lg font-bold ${summary.dinheiroLiquido >= 0 ? 'text-blue-800' : 'text-red-600'}`}>
                    R$ {summary.dinheiroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-purple-600 font-medium">Soma PIX</p>
                  <p className="text-lg font-bold text-purple-800">
                    R$ {summary.somaPix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-green-600 font-medium">Soma Crédito</p>
                  <p className="text-lg font-bold text-green-800">
                    R$ {summary.somaCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-yellow-600 font-medium">Soma Débito</p>
                  <p className="text-lg font-bold text-yellow-800">
                    R$ {summary.somaDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-red-600 font-medium">Soma Saída</p>
                  <p className="text-lg font-bold text-red-800">
                    R$ {summary.somaSaida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
            </div>
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

      <CashBookEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        entries={entries}
        summary={summary}
        initialBalance={initialBalance}
      />
    </>
  );
};
