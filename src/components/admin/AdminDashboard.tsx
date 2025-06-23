
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, UserCheck, Calendar, Image } from "lucide-react";

interface AdminDashboardProps {
  onSectionChange: (section: string) => void;
  canManageUsers: boolean;
  canManageChurches: boolean;
  canManageVolunteers: boolean;
  canManageCultosEventos: boolean;
  canManageLogos: boolean;
}

export const AdminDashboard = ({
  onSectionChange,
  canManageUsers,
  canManageChurches,
  canManageVolunteers,
  canManageCultosEventos,
  canManageLogos
}: AdminDashboardProps) => {
  const sections = [
    {
      id: 'users',
      title: 'Usuários',
      description: 'Gerenciar contas de usuário e permissões',
      icon: Users,
      enabled: canManageUsers,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'churches',
      title: 'Igrejas',
      description: 'Cadastrar e gerenciar igrejas',
      icon: Building2,
      enabled: canManageChurches,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'volunteers',
      title: 'Voluntários',
      description: 'Gerenciar cadastro de voluntários',
      icon: UserCheck,
      enabled: canManageVolunteers,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'cultos-eventos',
      title: 'Cultos/Eventos',
      description: 'Gerenciar cultos e eventos da igreja',
      icon: Calendar,
      enabled: canManageCultosEventos,
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'logos',
      title: 'Logos',
      description: 'Gerenciar logos das igrejas',
      icon: Image,
      enabled: canManageLogos,
      color: 'bg-pink-500 hover:bg-pink-600'
    }
  ];

  const availableSections = sections.filter(section => section.enabled);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Painel de Administração
        </h1>
        <p className="text-gray-600">
          Selecione uma área para gerenciar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableSections.map((section) => {
          const Icon = section.icon;
          
          return (
            <Card key={section.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto rounded-full ${section.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">{section.description}</p>
                <Button 
                  onClick={() => onSectionChange(section.id)}
                  className="w-full"
                  variant="outline"
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
