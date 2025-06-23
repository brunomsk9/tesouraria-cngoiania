
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Info } from 'lucide-react';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export const EmailConfirmationModal = ({ isOpen, onClose, email }: EmailConfirmationModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResendConfirmation = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmation`
        }
      });

      if (error) {
        toast({
          title: "Erro ao reenviar email",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email reenviado!",
          description: "Verifique sua caixa de entrada e spam."
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível reenviar o email de confirmação.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl text-gray-800">Confirme seu Email</DialogTitle>
          <p className="text-gray-600">Enviamos um link de confirmação para seu email</p>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Enviamos um email de confirmação para <strong>{email}</strong>. 
              Clique no link do email para ativar sua conta.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">
              Não recebeu o email? Verifique sua pasta de spam ou clique no botão abaixo para reenviar.
            </p>
            
            <Button 
              onClick={handleResendConfirmation}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? 'Reenviando...' : 'Reenviar Email de Confirmação'}
            </Button>

            <Button 
              onClick={onClose}
              variant="ghost"
              className="w-full"
            >
              Voltar ao Login
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
