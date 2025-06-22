
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CashBookEntry, Church } from '@/types/cashBook';
import {
  fetchTransactions,
  fetchPixEntries,
  fetchPreviousTransactions,
  fetchPreviousPixEntries,
  fetchChurches
} from '@/services/cashBookDataService';
import {
  calculateInitialBalance,
  processTransactionEntries,
  processPixEntries,
  calculateRunningBalances
} from '@/utils/cashBookCalculations';

export const useCashBookData = () => {
  const [entries, setEntries] = useState<CashBookEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialBalance, setInitialBalance] = useState(0);
  const [churches, setChurches] = useState<Church[]>([]);

  // Carregar igrejas quando o hook é inicializado
  useEffect(() => {
    loadChurches();
  }, []);

  const loadChurches = async () => {
    try {
      const churchesData = await fetchChurches();
      setChurches(churchesData);
    } catch (error) {
      console.error('Erro ao buscar igrejas:', error);
    }
  };

  const generateReport = async (startDate: string, endDate: string, churchId: string) => {
    console.log('generateReport chamado com:', { startDate, endDate, churchId });
    
    if (!startDate || !endDate) {
      toast.error('Preencha a data do evento');
      return;
    }

    if (!churchId) {
      toast.error('Selecione uma igreja');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Iniciando busca de dados...');
      
      // Buscar dados do período
      const [transactions, pixEntries] = await Promise.all([
        fetchTransactions(churchId, startDate, endDate),
        fetchPixEntries(churchId, startDate, endDate)
      ]);

      console.log('Transações encontradas:', transactions?.length || 0);
      console.log('Entradas PIX encontradas:', pixEntries?.length || 0);

      // Buscar dados anteriores para calcular saldo inicial
      const [prevTransactions, prevPixEntries] = await Promise.all([
        fetchPreviousTransactions(churchId, startDate),
        fetchPreviousPixEntries(churchId, startDate)
      ]);

      // Calcular saldo inicial
      const prevBalance = calculateInitialBalance(prevTransactions, prevPixEntries);
      console.log('Saldo inicial calculado:', prevBalance);
      setInitialBalance(prevBalance);

      // Processar todas as entradas - combinando transações e PIX
      const transactionEntries = processTransactionEntries(transactions);
      const pixEntriesProcessed = processPixEntries(pixEntries);
      const allEntries = [...transactionEntries, ...pixEntriesProcessed];

      // Calcular saldos progressivos
      const processedEntries = calculateRunningBalances(allEntries, prevBalance);

      console.log('Entradas processadas:', processedEntries.length);
      console.log('Detalhamento:', {
        transacoes: transactions?.length || 0,
        pixEntries: pixEntries?.length || 0,
        total: processedEntries.length
      });

      setEntries(processedEntries);
      
      if (processedEntries.length === 0) {
        toast.info('Nenhuma transação encontrada para a data selecionada');
      } else {
        toast.success(`Relatório gerado com sucesso! ${processedEntries.length} registros encontrados.`);
      }
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  return {
    entries,
    loading,
    initialBalance,
    churches,
    generateReport
  };
};
