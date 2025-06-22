
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

export const useCashFlowState = () => {
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [newSessionData, setNewSessionData] = useState({
    date_session: new Date().toISOString().split('T')[0],
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
    saldo
  };
};
