
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ValidationAlert = () => {
  const { profile } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (profile?.church_id && profile?.role !== 'supervisor') {
      checkPendingValidations();
    }
  }, [profile]);

  const checkPendingValidations = async () => {
    if (!profile?.church_id) return;

    try {
      const { data, error } = await supabase.rpc('get_pending_validations_count', {
        user_church_id: profile.church_id
      });

      if (error) {
        console.error('Erro ao verificar validações pendentes:', error);
        return;
      }

      setPendingCount(data || 0);
      setIsVisible((data || 0) > 0);
    } catch (error) {
      console.error('Erro ao verificar validações pendentes:', error);
    }
  };

  if (!isVisible || pendingCount === 0) return null;

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-orange-800">
            Você tem <strong>{pendingCount}</strong> sessão(ões) aguardando validação.
          </span>
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
            {pendingCount}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="text-orange-800 border-orange-300 hover:bg-orange-100"
            onClick={() => {
              // Aqui você pode navegar para a aba de validação
              toast.info('Acesse a aba "Fluxo de Caixa" > "Validação" para validar as sessões.');
            }}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Ver Validações
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsVisible(false)}
            className="text-orange-600 hover:bg-orange-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
