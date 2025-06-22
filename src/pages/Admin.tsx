
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/UserManagement";
import { ChurchManagement } from "@/components/ChurchManagement";
import { VolunteerManagement } from "@/components/VolunteerManagement";
import { Users, Building2, Shield, ArrowLeft, Home, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Admin = () => {
  const { profile } = useAuth();

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

  if (profile.role !== 'master') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center mb-4">
              Apenas usuários com perfil Master podem acessar a área de administração.
            </p>
            <div className="flex justify-center">
              <Button asChild variant="outline">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Voltar ao Sistema
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Painel de Administração</h1>
                <p className="text-sm text-gray-500">Gestão Master do Sistema</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{profile.name}</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                Master
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto mb-6">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="churches" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Igrejas</span>
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span>Voluntários</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="churches">
            <ChurchManagement />
          </TabsContent>
          
          <TabsContent value="volunteers">
            <VolunteerManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
