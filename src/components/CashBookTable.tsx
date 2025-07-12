
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

  const hasData = entries.length > 0;

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
          {hasData ? (
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
          ) : (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-lg font-medium text-slate-700">Nenhum dado encontrado</h3>
                <p className="text-slate-500 max-w-md">
                  Selecione uma igreja e data para gerar o relatório do livro caixa
                </p>
              </div>
            </div>
          )}

          {hasData && (
            <>
              {/* Resumo */}
              <div className="mt-8 space-y-6">
                <h3 className="text-xl font-bold text-slate-800">Resumo Financeiro</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                    <CardContent className="p-4 text-center">
                      <p className="text-blue-100 text-sm font-medium tracking-wide">Dinheiro Líquido</p>
                      <p className={`text-xl font-bold mt-2 ${summary.dinheiroLiquido >= 0 ? 'text-white' : 'text-red-200'}`}>
                        R$ {summary.dinheiroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-violet-500 via-violet-600 to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                    <CardContent className="p-4 text-center">
                      <p className="text-violet-100 text-sm font-medium tracking-wide">Soma PIX</p>
                      <p className="text-xl font-bold text-white mt-2">
                        R$ {summary.somaPix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                    <CardContent className="p-4 text-center">
                      <p className="text-emerald-100 text-sm font-medium tracking-wide">Soma Crédito</p>
                      <p className="text-xl font-bold text-white mt-2">
                        R$ {summary.somaCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                    <CardContent className="p-4 text-center">
                      <p className="text-amber-100 text-sm font-medium tracking-wide">Soma Débito</p>
                      <p className="text-xl font-bold text-white mt-2">
                        R$ {summary.somaDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
                    <CardContent className="p-4 text-center">
                      <p className="text-rose-100 text-sm font-medium tracking-wide">Soma Saída</p>
                      <p className="text-xl font-bold text-white mt-2">
                        R$ {summary.somaSaida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">Saldo Final:</span>
                  <span className="font-bold text-xl text-slate-800">
                    R$ {entries.length > 0 ? entries[entries.length - 1].balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                  </span>
                </div>
              </div>
            </>
          )}
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
