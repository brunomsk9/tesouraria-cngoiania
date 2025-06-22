
import { useAuth } from "@/hooks/useAuth";
import { CashFlowManager } from "@/components/CashFlowManager";
import { Sidebar } from "@/components/Sidebar";
import { Reports } from "@/components/Reports";
import { CashBookReport } from "@/components/CashBookReport";
import { ValidationAlert } from "@/components/ValidationAlert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { BarChart3, TrendingUp, Clock, CheckCircle } from "lucide-react";

const Index = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-4 lg:p-6 space-y-6">
            <ValidationAlert />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Sessões Ativas</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Total Arrecadado</p>
                      <p className="text-2xl font-bold">R$ 12.450</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Sessões Validadas</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Relatórios</p>
                      <p className="text-2xl font-bold">15</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Bem-vindo ao Sistema de Tesouraria</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Use o menu lateral para navegar entre as diferentes funcionalidades do sistema.
                </p>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'relatorios':
        return <Reports />;
      
      case 'livro-caixa':
        return <CashBookReport />;
      
      default:
        return (
          <div className="bg-gray-50 min-h-screen">
            {!profile.church_id && profile.role !== 'supervisor' ? (
              <div className="p-4 lg:p-6">
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-orange-800">Configuração Necessária</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-orange-700 mb-4">
                      Seu perfil ainda não está vinculado a uma igreja. 
                      Entre em contato com o administrador do sistema para configurar sua igreja.
                    </p>
                    <div className="text-sm text-orange-600">
                      <strong>Próximos passos:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Solicite ao Master que crie o registro da sua igreja</li>
                        <li>Solicite a vinculação do seu perfil à igreja</li>
                        <li>Após a configuração, você poderá usar o sistema completo</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <CashFlowManager />
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        <div className="lg:pl-64">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
