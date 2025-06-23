
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { AuthAlert } from './AuthAlert';

interface SignInFormProps {
  onLogin: () => void;
  onShowEmailConfirmation: (email: string) => void;
}

export const SignInForm = ({ onLogin, onShowEmailConfirmation }: SignInFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    title: '',
    description: '',
    type: 'info'
  });

  const showAlert = (title: string, description: string, type: 'success' | 'error' | 'info') => {
    setAlert({
      isOpen: true,
      title,
      description,
      type
    });
  };

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
        
        // Para o erro "Invalid login credentials", vamos tratar como email não cadastrado
        if (error.message === "Invalid login credentials") {
          console.log('Email não cadastrado ou credenciais inválidas detectado');
          showAlert(
            "Email não encontrado",
            "Este email não possui uma conta cadastrada. Clique na aba 'Cadastrar' para criar uma nova conta ou verifique se digitou o email corretamente.",
            "error"
          );
        }
        // Verificar se é erro de email não confirmado
        else if (error.message.toLowerCase().includes('email') && 
                 error.message.toLowerCase().includes('confirm')) {
          console.log('Erro de email não confirmado detectado');
          onShowEmailConfirmation(email);
          showAlert(
            "Email não confirmado",
            "Você precisa confirmar seu email antes de fazer login. Verifique sua caixa de entrada.",
            "error"
          );
        } 
        // Outros erros específicos
        else if (error.message.toLowerCase().includes('email not confirmed')) {
          console.log('Email não confirmado detectado');
          onShowEmailConfirmation(email);
          showAlert(
            "Email não confirmado",
            "Você precisa confirmar seu email antes de fazer login. Verifique sua caixa de entrada.",
            "error"
          );
        }
        // Para outros erros
        else {
          console.log('Outro tipo de erro:', error.message);
          showAlert(
            "Erro no login",
            error.message || "Erro desconhecido. Tente novamente.",
            "error"
          );
        }
      } else if (data.session && data.user) {
        console.log('Login realizado com sucesso');
        showAlert(
          "Login realizado!",
          "Bem-vindo ao Sistema de Tesouraria.",
          "success"
        );
        setTimeout(() => {
          onLogin();
        }, 1500);
      } else {
        console.error('Login falhou sem erro específico');
        showAlert(
          "Erro no login",
          "Não foi possível fazer login. Tente novamente.",
          "error"
        );
      }
    } catch (error: any) {
      console.error('Erro inesperado no login:', error);
      showAlert(
        "Erro inesperado",
        "Ocorreu um erro durante o login. Tente novamente.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            Não possui uma conta? Clique na aba 'Cadastrar' para criar uma nova conta.
          </AlertDescription>
        </Alert>
      </form>

      <AuthAlert
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        description={alert.description}
        type={alert.type}
      />
    </>
  );
};
