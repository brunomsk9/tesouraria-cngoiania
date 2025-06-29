import { useState } from 'react';

interface CashSession {
  id: string;
  date_session: string;
  culto_evento: string;
  horario_sessao?: string;
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

interface PendingPayment {
  id: string;
  name: string;
  amount: number;
  type: 'volunteer' | 'security' | 'others';
}

export const useCashFlowState = () => {
  // Função para obter data local no formato correto (YYYY-MM-DD) sem conversão de timezone
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    console.log('Data local gerada no hook:', dateString);
    return dateString;
  };

  // Função para obter hora atual
  const getCurrentTimeString = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  
  // Inicializar com string vazia para evitar problemas de timezone
  const [newSessionData, setNewSessionData] = useState({
    date_session: '', // Inicializar vazio para ser definido pelo componente
    culto_evento: '',
    horario_sessao: getCurrentTimeString()
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
    valor_seguranca: 0,
    outros_gastos: 0,
    outros_descricao: ''
  });

  const [sessions, setSessions] = useState<CashSession[]>([]);

  const resetFormData = () => {
    setEntradas({ dinheiro: 0, cartao_debito: 0, cartao_credito: 0 });
    setPixEntries([]);
    setSelectedVolunteers([]);
    setSaidas({
      valor_seguranca: 0,
      outros_gastos: 0,
      outros_descricao: ''
    });
  };

  // Cálculos
  const totalPix = pixEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalEntradas = entradas.dinheiro + entradas.cartao_debito + entradas.cartao_credito + totalPix;
  const totalVolunteers = selectedVolunteers.reduce((sum, v) => sum + v.amount, 0);
  const totalSaidas = totalVolunteers + saidas.valor_seguranca + saidas.outros_gastos;
  const saldo = totalEntradas - totalSaidas;

  // Nova lógica para calcular pagamentos pendentes
  const calculatePendingPayments = (): { pendingPayments: PendingPayment[], availableCash: number } => {
    const availableCash = entradas.dinheiro;
    let remainingCash = availableCash;
    const pendingPayments: PendingPayment[] = [];

    // Processar pagamentos de voluntários primeiro
    selectedVolunteers.forEach(volunteer => {
      if (remainingCash >= volunteer.amount) {
        remainingCash -= volunteer.amount;
      } else {
        const pendingAmount = volunteer.amount - Math.max(0, remainingCash);
        if (pendingAmount > 0) {
          pendingPayments.push({
            id: volunteer.id,
            name: volunteer.name,
            amount: pendingAmount,
            type: 'volunteer'
          });
        }
        remainingCash = 0;
      }
    });

    // Processar segurança
    if (saidas.valor_seguranca > 0) {
      if (remainingCash >= saidas.valor_seguranca) {
        remainingCash -= saidas.valor_seguranca;
      } else {
        const pendingAmount = saidas.valor_seguranca - Math.max(0, remainingCash);
        if (pendingAmount > 0) {
          pendingPayments.push({
            id: 'security',
            name: 'Pagamento Segurança',
            amount: pendingAmount,
            type: 'security'
          });
        }
        remainingCash = 0;
      }
    }

    // Processar outros gastos
    if (saidas.outros_gastos > 0) {
      if (remainingCash >= saidas.outros_gastos) {
        remainingCash -= saidas.outros_gastos;
      } else {
        const pendingAmount = saidas.outros_gastos - Math.max(0, remainingCash);
        if (pendingAmount > 0) {
          pendingPayments.push({
            id: 'others',
            name: saidas.outros_descricao || 'Outros Gastos',
            amount: pendingAmount,
            type: 'others'
          });
        }
        remainingCash = 0;
      }
    }

    return { pendingPayments, availableCash: Math.max(0, remainingCash) };
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
    sessions,
    setSessions,
    resetFormData,
    totalPix,
    totalEntradas,
    totalVolunteers,
    totalSaidas,
    saldo,
    pendingPayments,
    availableCash,
    getTodayDateString // Exportar a função para uso no componente
  };
};
