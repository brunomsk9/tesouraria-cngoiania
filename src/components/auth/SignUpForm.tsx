
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Lock, Mail, CheckCircle } from 'lucide-react';

interface SignUpFormProps {
  onLogin: () => void;
  onShowEmailConfirmation: (email: string) => void;
}

export const SignUpForm = ({ onLogin, onShowEmailConfirmation }: SignUpFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
          toast({
            title: "Email já cadastrado",
            description: "Este email já possui uma conta. Tente fazer login ou verifique se o email foi confirmado.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        // Verificar se o usuário foi criado mas precisa confirmar email
        if (data.user && !data.session) {
          onShowEmailConfirmation(email);
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu email para confirmar a conta antes de fazer login."
          });
        } else if (data.session) {
          // Login automático se não precisar de confirmação
          toast({
            title: "Cadastro realizado!",
            description: "Conta criada e login realizado com sucesso."
          });
          onLogin();
        }
        
        setEmail('');
        setPassword('');
        setName('');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o cadastro.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};
