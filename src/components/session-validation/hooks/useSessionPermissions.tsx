
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useSessionPermissions = (sessionId: string, createdBy: string) => {
  const { profile } = useAuth();
  const [canValidate, setCanValidate] = useState(false);

  useEffect(() => {
    checkValidationPermission();
  }, [sessionId, profile?.id]);

  const checkValidationPermission = async () => {
    if (!profile?.id || !sessionId) return;

    const { data, error } = await supabase.rpc('can_validate_session', {
      session_id: sessionId,
      user_id: profile.id
    });

    if (error) {
      console.error('Erro ao verificar permissão:', error);
      return;
    }

    setCanValidate(data);
  };

  return {
    canValidate,
    createdByCurrentUser: profile?.id === createdBy
  };
};
