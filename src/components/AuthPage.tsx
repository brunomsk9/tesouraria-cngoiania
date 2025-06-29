
import React, { useState } from 'react';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AuthPageProps {
  onLogin: () => void;
}

export const AuthPage = ({ onLogin }: AuthPageProps) => {
  const [activeTab, setActiveTab] = useState('signin');

  const handleShowEmailConfirmation = (email: string) => {
    // Aqui você pode implementar a lógica para mostrar a confirmação de email
    console.log('Email confirmation needed for:', email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-center text-white rounded-t-lg">
            <h1 className="text-2xl font-bold mb-2">Sistema de Tesouraria</h1>
            <p className="text-blue-100">Gestão Financeira da Igreja</p>
          </div>
          
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
