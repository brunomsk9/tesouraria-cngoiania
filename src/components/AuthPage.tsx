
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, UserPlus } from 'lucide-react';
import { EmailConfirmationModal } from './EmailConfirmationModal';
import { SignInForm } from './auth/SignInForm';
import { SignUpForm } from './auth/SignUpForm';

interface AuthPageProps {
  onLogin: () => void;
}

export const AuthPage = ({ onLogin }: AuthPageProps) => {
  const [showEmailConfirmationModal, setShowEmailConfirmationModal] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');

  const handleShowEmailConfirmation = (email: string) => {
    setConfirmationEmail(email);
    setShowEmailConfirmationModal(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl text-gray-800">Sistema de Tesouraria</CardTitle>
            <p className="text-gray-600">Gestão Financeira da Igreja</p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Cadastrar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <SignInForm 
                  onLogin={onLogin}
                  onShowEmailConfirmation={handleShowEmailConfirmation}
                />
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <SignUpForm 
                  onLogin={onLogin}
                  onShowEmailConfirmation={handleShowEmailConfirmation}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <EmailConfirmationModal
        isOpen={showEmailConfirmationModal}
        onClose={() => setShowEmailConfirmationModal(false)}
        email={confirmationEmail}
      />
    </>
  );
};
