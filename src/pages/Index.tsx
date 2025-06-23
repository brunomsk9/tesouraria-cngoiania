
import { useAuth } from "@/hooks/useAuth";
import { CashFlowManager } from "@/components/CashFlowManager";
import { TopNavigation } from "@/components/TopNavigation";
import { Reports } from "@/components/Reports";
import { CashBookReport } from "@/components/CashBookReport";
import { ValidationAlert } from "@/components/ValidationAlert";
import { DashboardCards } from "@/components/DashboardCards";
import { DashboardChart } from "@/components/DashboardChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

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

  // Extract first name from profile
  const firstName = profile?.name?.split(' ')[0] || '';

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="px-6 lg:px-8">
              <ValidationAlert />
            </div>
            
            {/* Welcome Header */}
            <div className="px-6 lg:px-8">
              <Card className="bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg hover:shadow-xl transition-shadow border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-center">
                    Bem-vindo - {firstName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-100 text-lg text-center">
                    Use o menu superior para navegar entre as diferentes funcionalidades do sistema.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="px-6 lg:px-8">
              <DashboardCards />
            </div>
            
            <div className="px-6 lg:px-8">
              <DashboardChart />
            </div>
          </div>
        );
      
      case 'relatorios':
        return (
          <div className="p-6 lg:p-8 max-w-full">
            <Reports />
          </div>
        );
      
      case 'livro-caixa':
        return (
          <div className="p-6 lg:p-8 max-w-full">
            <CashBookReport />
          </div>
        );
      
      case 'caixa':
        return (
          <div className="min-h-screen bg-gray-50">
            {!profile.church_id && profile.role !== 'supervisor' ? (
              <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                <Card className="border-orange-200 bg-orange-50 shadow-sm">
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
      
      default:
        return (
          <div className="space-y-8">
            <div className="px-6 lg:px-8">
              <ValidationAlert />
            </div>
            
            {/* Welcome Header */}
            <div className="px-6 lg:px-8">
              <Card className="bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg hover:shadow-xl transition-shadow border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl font-bold text-center">
                    Bem-vindo ao Sistema de Tesouraria: {firstName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-100 text-lg text-center">
                    Use o menu superior para navegar entre as diferentes funcionalidades do sistema.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="px-6 lg:px-8">
              <DashboardCards />
            </div>
            
            <div className="px-6 lg:px-8">
              <DashboardChart />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <TopNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main content */}
      <div className="w-full">
        <div className="min-h-screen py-6 lg:py-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
