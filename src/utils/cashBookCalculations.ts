
import { CashBookEntry } from '@/types/cashBook';
import { TransactionData, PixEntryData } from '@/services/cashBookDataService';

interface CashBookEntryWithSort extends CashBookEntry {
  sortDate: Date;
}

export const calculateInitialBalance = (
  prevTransactions: Array<{ amount: number; type: string }>,
  prevPixEntries: Array<{ amount: number }>
): number => {
  let prevBalance = 0;
  
  if (prevTransactions) {
    prevBalance += prevTransactions.reduce((acc, trans) => {
      const amount = Number(trans.amount) || 0;
      return acc + (trans.type === 'entrada' ? amount : -amount);
    }, 0);
  }
  
  if (prevPixEntries) {
    prevBalance += prevPixEntries.reduce((acc, pix) => {
      return acc + (Number(pix.amount) || 0);
    }, 0);
  }

  return prevBalance;
};

export const processTransactionEntries = (transactions: TransactionData[]): CashBookEntryWithSort[] => {
  return transactions.map(trans => {
    const amount = Number(trans.amount) || 0;
    
    return {
      date: trans.date_transaction,
      description: trans.description || 'Sem descrição',
      type: trans.type,
      amount: amount,
      balance: 0, // será calculado depois
      session: trans.cash_sessions?.culto_evento || 'N/A',
      category: trans.category || undefined,
      sortDate: new Date(trans.date_transaction)
    };
  });
};

export const processPixEntries = (pixEntries: PixEntryData[]): CashBookEntryWithSort[] => {
  return pixEntries.map(pix => {
    const amount = Number(pix.amount) || 0;
    
    return {
      date: pix.cash_sessions?.date_session || pix.created_at.split('T')[0],
      description: `PIX: ${pix.description || 'Entrada'}`,
      type: 'entrada' as const,
      amount: amount,
      balance: 0, // será calculado depois
      session: pix.cash_sessions?.culto_evento || 'N/A',
      category: 'pix',
      sortDate: new Date(pix.cash_sessions?.date_session || pix.created_at)
    };
  });
};

export const calculateRunningBalances = (
  entries: CashBookEntryWithSort[],
  initialBalance: number
): CashBookEntry[] => {
  // Ordenar todas as entradas por data e hora
  entries.sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());

  // Calcular saldos progressivos
  let runningBalance = initialBalance;
  
  return entries.map(entry => {
    const balanceChange = entry.type === 'entrada' ? entry.amount : -entry.amount;
    runningBalance += balanceChange;
    
    return {
      date: entry.date,
      description: entry.description,
      type: entry.type,
      amount: entry.amount,
      balance: runningBalance,
      session: entry.session,
      category: entry.category
    };
  });
};
