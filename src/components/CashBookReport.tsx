
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Download, Calendar, Building2 } from 'lucide-react';
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

interface Church {
  id: string;
  name: string;
}

export const CashBookReport = () => {
  const { profile } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedChurch, setSelectedChurch] = useState('');
  const [churches, setChurches] = useState<Church[]>([]);
  const [entries, setEntries] = useState<CashBookEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialBalance, setInitialBalance] = useState(0);

  useEffect(() => {
    if (profile?.role === 'master' || profile?.role === 'supervisor') {
      loadChurches();
    } else if (profile?.church_id) {
      setSelectedChurch(profile.church_id);
    }
  }, [profile]);

  const loadChurches = async () => {
    try {
      const { data, error } = await supabase
        .from('churches')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setChurches(data || []);
    } catch (error) {
      console.error('Erro ao carregar igrejas:', error);
    }
  };

  const generateReport = async () => {
    if (!startDate || !endDate || !selectedChurch) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      // Buscar transações do período
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select(`
          date_transaction,
          description,
          type,
          amount,
          category,
          cash_session_id,
          cash_sessions!inner(culto_evento, church_id)
        `)
        .eq('cash_sessions.church_id', selectedChurch)
        .gte('date_transaction', startDate)
        .lte('date_transaction', endDate)
        .order('date_transaction', { ascending: true });

      if (transError) throw transError;

      // Buscar entradas PIX do período
      const { data: pixEntries, error: pixError } = await supabase
        .from('pix_entries')
        .select(`
          amount,
          description,
          created_at,
          cash_sessions!inner(culto_evento, church_id, date_session)
        `)
        .eq('cash_sessions.church_id', selectedChurch)
        .gte('cash_sessions.date_session', startDate)
        .lte('cash_sessions.date_session', endDate)
        .order('created_at', { ascending: true });

      if (pixError) throw pixError;

      // Calcular saldo inicial (transações antes do período)
      const { data: prevTransactions, error: prevError } = await supabase
        .from('transactions')
        .select(`
          amount,
          type,
          cash_sessions!inner(church_id)
        `)
        .eq('cash_sessions.church_id', selectedChurch)
        .lt('date_transaction', startDate);

      if (prevError) throw prevError;

      const { data: prevPixEntries, error: prevPixError } = await supabase
        .from('pix_entries')
        .select(`
          amount,
          cash_sessions!inner(church_id, date_session)
        `)
        .eq('cash_sessions.church_id', selectedChurch)
        .lt('cash_sessions.date_session', startDate);

      if (prevPixError) throw prevPixError;

      // Calcular saldo inicial
      const prevBalance = (prevTransactions || []).reduce((acc, trans) => {
        return acc + (trans.type === 'entrada' ? trans.amount : -trans.amount);
      }, 0) + (prevPixEntries || []).reduce((acc, pix) => acc + pix.amount, 0);

      setInitialBalance(prevBalance);

      // Processar entradas do livro caixa
      const cashBookEntries: CashBookEntry[] = [];
      let runningBalance = prevBalance;

      // Adicionar transações
      (transactions || []).forEach(trans => {
        const amount = trans.type === 'entrada' ? trans.amount : -trans.amount;
        runningBalance += amount;
        
        cashBookEntries.push({
          date: trans.date_transaction,
          description: trans.description,
          type: trans.type,
          amount: Math.abs(trans.amount),
          balance: runningBalance,
          session: trans.cash_sessions?.culto_evento || 'N/A',
          category: trans.category || undefined
        });
      });

      // Adicionar entradas PIX
      (pixEntries || []).forEach(pix => {
        runningBalance += pix.amount;
        
        cashBookEntries.push({
          date: pix.cash_sessions?.date_session || pix.created_at.split('T')[0],
          description: `PIX: ${pix.description || 'Entrada'}`,
          type: 'entrada',
          amount: pix.amount,
          balance: runningBalance,
          session: pix.cash_sessions?.culto_evento || 'N/A'
        });
      });

      // Ordenar por data
      cashBookEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setEntries(cashBookEntries);
      toast.success('Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const exportToPrint = () => {
    const churchName = churches.find(c => c.id === selectedChurch)?.name || 'Igreja';
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Livro Caixa - ${churchName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .period { text-align: center; margin-bottom: 20px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .amount { text-align: right; }
            .entrada { color: #059669; }
            .saida { color: #dc2626; }
            .balance { font-weight: bold; }
            .summary { margin-top: 20px; padding: 15px; background-color: #f9f9f9; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LIVRO CAIXA</h1>
            <h2>${churchName}</h2>
          </div>
          
          <div class="period">
            Período: ${format(new Date(startDate), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(endDate), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
          
          <div class="summary">
            <strong>Saldo Inicial: R$ ${initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Sessão/Evento</th>
                <th>Categoria</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              ${entries.map(entry => `
                <tr>
                  <td>${format(new Date(entry.date), 'dd/MM/yyyy', { locale: ptBR })}</td>
                  <td>${entry.description}</td>
                  <td>${entry.session}</td>
                  <td>${entry.category || '-'}</td>
                  <td class="amount ${entry.type === 'entrada' ? 'entrada' : ''}">
                    ${entry.type === 'entrada' ? `R$ ${entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td class="amount ${entry.type === 'saida' ? 'saida' : ''}">
                    ${entry.type === 'saida' ? `R$ ${entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td class="amount balance">R$ ${entry.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <strong>Saldo Final: R$ ${entries.length > 0 ? entries[entries.length - 1].balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
          
          <div style="margin-top: 50px; text-align: center; color: #666;">
            Relatório gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Gerador de Livro Caixa</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Data Início *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="endDate">Data Fim *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {(profile?.role === 'master' || profile?.role === 'supervisor') && (
              <div>
                <Label htmlFor="church">Igreja *</Label>
                <Select value={selectedChurch} onValueChange={setSelectedChurch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a igreja" />
                  </SelectTrigger>
                  <SelectContent>
                    {churches.map((church) => (
                      <SelectItem key={church.id} value={church.id}>
                        {church.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end space-x-2">
              <Button onClick={generateReport} disabled={loading} className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                {loading ? 'Gerando...' : 'Gerar Relatório'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Livro Caixa</CardTitle>
            <Button onClick={exportToPrint} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Saldo Inicial:</span>
                <span className="font-bold text-lg">
                  R$ {initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

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
                  R$ {entries.length > 0 ? entries[entries.length - 1].balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
