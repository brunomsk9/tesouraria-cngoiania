
import { supabase } from '@/integrations/supabase/client';

export interface TransactionData {
  date_transaction: string;
  description: string;
  type: 'entrada' | 'saida';
  amount: number;
  category?: string;
  cash_session_id: string;
  cash_sessions?: {
    culto_evento: string;
    church_id: string;
  };
}

export interface PixEntryData {
  amount: number;
  description: string;
  created_at: string;
  cash_session_id: string;
  cash_sessions?: {
    culto_evento: string;
    church_id: string;
    date_session: string;
  };
}

export const fetchTransactions = async (churchId: string, startDate: string, endDate: string) => {
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
    .eq('cash_sessions.church_id', churchId)
    .gte('date_transaction', startDate)
    .lte('date_transaction', endDate)
    .order('date_transaction', { ascending: true });

  if (transError) throw transError;
  return transactions as TransactionData[] || [];
};

export const fetchPixEntries = async (churchId: string, startDate: string, endDate: string) => {
  const { data: pixEntries, error: pixError } = await supabase
    .from('pix_entries')
    .select(`
      amount,
      description,
      created_at,
      cash_session_id,
      cash_sessions!inner(culto_evento, church_id, date_session)
    `)
    .eq('cash_sessions.church_id', churchId)
    .gte('cash_sessions.date_session', startDate)
    .lte('cash_sessions.date_session', endDate);

  if (pixError) throw pixError;
  return pixEntries as PixEntryData[] || [];
};

export const fetchPreviousTransactions = async (churchId: string, startDate: string) => {
  const { data: prevTransactions } = await supabase
    .from('transactions')
    .select(`
      amount,
      type,
      cash_sessions!inner(church_id)
    `)
    .eq('cash_sessions.church_id', churchId)
    .lt('date_transaction', startDate);

  return prevTransactions || [];
};

export const fetchPreviousPixEntries = async (churchId: string, startDate: string) => {
  const { data: prevPixEntries } = await supabase
    .from('pix_entries')
    .select(`
      amount,
      cash_sessions!inner(church_id, date_session)
    `)
    .eq('cash_sessions.church_id', churchId)
    .lt('cash_sessions.date_session', startDate);

  return prevPixEntries || [];
};

export const fetchChurches = async () => {
  const { data, error } = await supabase
    .from('churches')
    .select('id, name')
    .order('name');

  if (error) throw error;
  return data || [];
};
