
import { useAuth } from "@/hooks/useAuth";
import { CashFlowManager } from "@/components/CashFlowManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Building2 } from "lucide-react";

const Index = () => {
  const { profile, signOut } = useAuth();

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sistema Tesouraria</h1>
                <p className="text-sm text-gray-500">Gestão Financeira Eclesiástica</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{profile.name}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {profile.role === 'master' ? 'Master' : 
                   profile.role === 'tesoureiro' ? 'Tesoureiro' : 'Supervisor'}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {!profile.church_id && profile.role !== 'supervisor' ? (
          <div className="p-6">
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
      </main>
    </div>
  );
};

export default Index;
