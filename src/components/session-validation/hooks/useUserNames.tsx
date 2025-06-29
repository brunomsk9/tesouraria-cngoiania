
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useUserNames = (createdBy: string, validatedBy?: string | null) => {
  const [creatorName, setCreatorName] = useState<string>('');
  const [validatorName, setValidatorName] = useState<string>('');

  useEffect(() => {
    if (createdBy) {
      loadCreatorName();
    }
  }, [createdBy]);

  useEffect(() => {
    if (validatedBy) {
      loadValidatorName();
    }
  }, [validatedBy]);

  const loadCreatorName = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', createdBy)
      .single();

    if (error) {
      console.error('Erro ao carregar nome do criador:', error);
      return;
    }

    setCreatorName(data?.name || 'Usuário desconhecido');
  };

  const loadValidatorName = async () => {
    if (!validatedBy) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', validatedBy)
      .single();

    if (error) {
      console.error('Erro ao carregar nome do validador:', error);
      return;
    }

    setValidatorName(data?.name || 'Usuário desconhecido');
  };

  return { creatorName, validatorName };
};
