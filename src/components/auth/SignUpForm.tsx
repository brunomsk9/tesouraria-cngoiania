
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Mail, CheckCircle } from 'lucide-react';
import { AuthAlert } from './AuthAlert';

interface SignUpFormProps {
  onLogin: () => void;
  onShowEmailConfirmation: (email: string) => void;
}

export const SignUpForm = ({ onLogin, onShowEmailConfirmation }: SignUpFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmation`,
          data: {
            name: name
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          showAlert(
            "Email já cadastrado",
            "Este email já possui uma conta. Tente fazer login ou verifique se o email foi confirmado.",
            "error"
          );
        } else {
          showAlert(
            "Erro no cadastro",
            error.message,
            "error"
          );
        }
      } else {
        if (data.user && !data.session) {
          onShowEmailConfirmation(email);
          showAlert(
            "Cadastro realizado!",
            "Verifique seu email para confirmar a conta antes de fazer login.",
            "success"
          );
        } else if (data.session) {
          showAlert(
            "Cadastro realizado!",
            "Conta criada e login realizado com sucesso.",
            "success"
          );
          setTimeout(() => {
            onLogin();
          }, 1500);
        }
        
        setEmail('');
        setPassword('');
        setName('');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      showAlert(
        "Erro inesperado",
        "Ocorreu um erro durante o cadastro.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="signup-name">Nome</Label>
          <Input
            id="signup-name"
            type="text"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="signup-email"
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
          <Label htmlFor="signup-password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="signup-password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="pl-10"
            />
          </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
        
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Após o cadastro, você receberá um email de confirmação. 
            Novos usuários são cadastrados como Tesoureiro por padrão.
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
