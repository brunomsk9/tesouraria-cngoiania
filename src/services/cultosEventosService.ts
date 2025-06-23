
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CultoEvento {
  id: string;
  church_id: string;
  nome: string;
  descricao: string | null;
  data_evento: string | null;
  horario_evento: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const loadCultosEventos = async (churchId: string): Promise<CultoEvento[]> => {
  const { data, error } = await supabase
    .from('cultos_eventos')
    .select('*')
    .eq('church_id', churchId)
    .eq('ativo', true)
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao carregar cultos/eventos:', error);
    return [];
  }

  return data || [];
};

export const createCultoEvento = async (
  churchId: string,
  nome: string,
  descricao?: string,
  dataEvento?: string,
  horarioEvento?: string
): Promise<CultoEvento | null> => {
  if (!churchId || !nome.trim()) {
    toast.error('Preencha todos os campos obrigatórios');
    return null;
  }

  const { data, error } = await supabase
    .from('cultos_eventos')
    .insert({
      church_id: churchId,
      nome: nome.trim(),
      descricao: descricao?.trim() || null,
      data_evento: dataEvento || null,
      horario_evento: horarioEvento || null
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar culto/evento:', error);
    toast.error('Erro ao criar culto/evento');
    return null;
  }

  toast.success('Culto/evento criado com sucesso!');
  return data;
};

export const updateCultoEvento = async (
  id: string,
  nome: string,
  descricao?: string,
  dataEvento?: string,
  horarioEvento?: string,
  ativo: boolean = true
): Promise<boolean> => {
  if (!nome.trim()) {
    toast.error('Nome é obrigatório');
    return false;
  }

  const { error } = await supabase
    .from('cultos_eventos')
    .update({
      nome: nome.trim(),
      descricao: descricao?.trim() || null,
      data_evento: dataEvento || null,
      horario_evento: horarioEvento || null,
      ativo,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar culto/evento:', error);
    toast.error('Erro ao atualizar culto/evento');
    return false;
  }

  toast.success('Culto/evento atualizado com sucesso!');
  return true;
};

export const deleteCultoEvento = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('cultos_eventos')
    .update({ ativo: false })
    .eq('id', id);

  if (error) {
    console.error('Erro ao desativar culto/evento:', error);
    toast.error('Erro ao desativar culto/evento');
    return false;
  }

  toast.success('Culto/evento desativado com sucesso!');
  return true;
};
