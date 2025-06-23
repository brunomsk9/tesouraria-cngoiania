
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Mail, AlertCircle } from 'lucide-react';

interface SignInFormProps {
  onLogin: () => void;
  onShowEmailConfirmation: (email: string) => void;
}

export const SignInForm = ({ onLogin, onShowEmailConfirmation }: SignInFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Tentando fazer login com:', { email, password: '***' });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Resposta do login:', { data, error });

      if (error) {
        console.error('Erro de login:', error);
        
        // Verificar diferentes tipos de erro
        if (error.message.toLowerCase().includes('invalid') || 
            error.message.toLowerCase().includes('credentials') ||
            error.message.toLowerCase().includes('wrong')) {
          console.log('Erro de credenciais inválidas detectado');
          toast({
            title: "Credenciais inválidas",
            description: "Email ou senha incorretos. Verifique seus dados e tente novamente.",
            variant: "destructive"
          });
        } else if (error.message.toLowerCase().includes('email') && 
                   error.message.toLowerCase().includes('confirm')) {
          console.log('Erro de email não confirmado detectado');
          onShowEmailConfirmation(email);
          toast({
            title: "Email não confirmado",
            description: "Você precisa confirmar seu email antes de fazer login.",
            variant: "destructive"
          });
        } else {
          console.log('Outro tipo de erro:', error.message);
          toast({
            title: "Erro no login",
            description: error.message || "Erro desconhecido",
            variant: "destructive"
          });
        }
      } else if (data.session && data.user) {
        console.log('Login realizado com sucesso');
        toast({
          title: "Login realizado!",
          description: "Bem-vindo ao Sistema de Tesouraria."
        });
        onLogin();
      } else {
        console.error('Login falhou sem erro específico');
        toast({
          title: "Erro no login",
          description: "Não foi possível fazer login. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Erro inesperado no login:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o login.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="signin-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signin-password">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="signin-password"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10"
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Problemas para entrar? Verifique se confirmou seu email após o cadastro.
        </AlertDescription>
      </Alert>
    </form>
  );
};
