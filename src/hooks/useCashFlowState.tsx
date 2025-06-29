
import { useState } from 'react';

interface CashSession {
  id: string;
  date_session: string;
  culto_evento: string;
  status: string;
  church_id: string;
  created_by: string;
  validated_by: string | null;
  validated_at: string | null;
}

interface PixEntry {
  id: string;
  amount: number;
  description: string;
  data_pix: string;
}

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

interface PendingPayment {
  id: string;
  name: string;
  amount: number;
  type: 'volunteer' | 'security' | 'others';
}

export const useCashFlowState = () => {
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  
  const [newSessionData, setNewSessionData] = useState({
    date_session: '',
    culto_evento: ''
  });
  
  // Estados para entradas
  const [entradas, setEntradas] = useState({
    dinheiro: 0,
    cartao_debito: 0,
    cartao_credito: 0
  });
  
  // Estados para PIX (múltiplas linhas)
  const [pixEntries, setPixEntries] = useState<PixEntry[]>([]);
  
  // Estados para saídas
  const [selectedVolunteers, setSelectedVolunteers] = useState<SelectedVolunteer[]>([]);
  const [saidas, setSaidas] = useState({
    valor_seguranca: 0
  });

  // Nova estrutura para outros gastos (múltiplas entradas)
  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>([]);

  const [sessions, setSessions] = useState<CashSession[]>([]);

  // Estados de salvamento - removidos porque não são persistidos
  // const [entriesSaved, setEntriesSaved] = useState({
  //   traditional: false,
  //   pix: false
  // });

  // Estado para controlar se as saídas foram salvas - removido porque não é persistido
  // const [exitsSaved, setExitsSaved] = useState(false);

  const resetFormData = () => {
    setEntradas({ dinheiro: 0, cartao_debito: 0, cartao_credito: 0 });
    setPixEntries([]);
    setSelectedVolunteers([]);
    setSaidas({
      valor_seguranca: 0
    });
    setOtherExpenses([]);
  };

  // Cálculos
  const totalPix = pixEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalEntradas = entradas.dinheiro + entradas.cartao_debito + entradas.cartao_credito + totalPix;
  const totalVolunteers = selectedVolunteers.reduce((sum, v) => sum + v.amount, 0);
  const totalOtherExpenses = otherExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalSaidas = totalVolunteers + saidas.valor_seguranca + totalOtherExpenses;
  const saldo = totalEntradas - totalSaidas;

  // Lógica corrigida para calcular pagamentos pendentes baseado apenas no dinheiro disponível
  const calculatePendingPayments = (): { pendingPayments: PendingPayment[], availableCash: number } => {
    const availableCash = entradas.dinheiro;
    let remainingCash = availableCash;
    const pendingPayments: PendingPayment[] = [];

    console.log('=== ANÁLISE DE PAGAMENTOS ===');
    console.log('Dinheiro disponível:', availableCash);
    console.log('Total de saídas:', totalSaidas);

    // Se o dinheiro disponível cobrir todas as saídas, não há pagamentos pendentes
    if (availableCash >= totalSaidas) {
      console.log('Dinheiro suficiente para todas as saídas');
      return { 
        pendingPayments: [], 
        availableCash: availableCash - totalSaidas 
      };
    }

    // Se não há dinheiro suficiente, calcular o que fica pendente por prioridade
    console.log('Dinheiro insuficiente, calculando pendências...');

    // Prioridade 1: Voluntários (ordem de entrada)
    selectedVolunteers.forEach(volunteer => {
      if (remainingCash >= volunteer.amount) {
        remainingCash -= volunteer.amount;
        console.log(`Voluntário ${volunteer.name}: R$ ${volunteer.amount} - PAGO (restam R$ ${remainingCash})`);
      } else {
        const pendingAmount = volunteer.amount - Math.max(0, remainingCash);
        pendingPayments.push({
          id: volunteer.id,
          name: volunteer.name,
          amount: pendingAmount,
          type: 'volunteer'
        });
        console.log(`Voluntário ${volunteer.name}: R$ ${pendingAmount} - PENDENTE`);
        remainingCash = 0;
      }
    });

    // Prioridade 2: Segurança
    if (saidas.valor_seguranca > 0) {
      if (remainingCash >= saidas.valor_seguranca) {
        remainingCash -= saidas.valor_seguranca;
        console.log(`Segurança: R$ ${saidas.valor_seguranca} - PAGO (restam R$ ${remainingCash})`);
      } else {
        const pendingAmount = saidas.valor_seguranca - Math.max(0, remainingCash);
        if (pendingAmount > 0) {
          pendingPayments.push({
            id: 'security',
            name: 'Pagamento Segurança',
            amount: pendingAmount,
            type: 'security'
          });
          console.log(`Segurança: R$ ${pendingAmount} - PENDENTE`);
        }
        remainingCash = 0;
      }
    }

    // Prioridade 3: Outros gastos
    otherExpenses.forEach((expense, index) => {
      if (remainingCash >= expense.amount) {
        remainingCash -= expense.amount;
        console.log(`${expense.description}: R$ ${expense.amount} - PAGO (restam R$ ${remainingCash})`);
      } else {
        const pendingAmount = expense.amount - Math.max(0, remainingCash);
        if (pendingAmount > 0) {
          pendingPayments.push({
            id: `others-${expense.id}`,
            name: expense.description || `Outros Gastos #${index + 1}`,
            amount: pendingAmount,
            type: 'others'
          });
          console.log(`${expense.description}: R$ ${pendingAmount} - PENDENTE`);
        }
        remainingCash = 0;
      }
    });

    console.log('Pagamentos pendentes:', pendingPayments);
    console.log('Dinheiro restante:', Math.max(0, remainingCash));

    return { 
      pendingPayments, 
      availableCash: Math.max(0, remainingCash) 
    };
  };

  const { pendingPayments, availableCash } = calculatePendingPayments();

  return {
    currentSession,
    setCurrentSession,
    newSessionData,
    setNewSessionData,
    entradas,
    setEntradas,
    pixEntries,
    setPixEntries,
    selectedVolunteers,
    setSelectedVolunteers,
    saidas,
    setSaidas,
    otherExpenses,
    setOtherExpenses,
    sessions,
    setSessions,
    resetFormData,
    totalPix,
    totalEntradas,
    totalVolunteers,
    totalOtherExpenses,
    totalSaidas,
    saldo,
    pendingPayments,
    availableCash
  };
};
