
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  DollarSign, 
  FileText, 
  Settings, 
  LogOut, 
  User, 
  Building2 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { profile, signOut } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral'
    },
    {
      id: 'caixa',
      label: 'Fluxo de Caixa',
      icon: DollarSign,
      description: 'Gerenciar entradas e saídas'
    },
    {
      id: 'relatorios',
      label: 'Relatórios',
      icon: FileText,
      description: 'Histórico e análises'
    }
  ];

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e título */}
          <div className="flex items-center space-x-4">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sistema Tesouraria</h1>
              <p className="text-sm text-gray-500">Gestão Financeira Eclesiástica</p>
            </div>
          </div>

          {/* Menu principal */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                onClick={() => onTabChange(item.id)}
                className="flex items-center space-x-2 px-4 py-2"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            ))}
          </div>

          {/* Perfil e ações */}
          <div className="flex items-center space-x-4">
            {profile?.role === 'master' && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
            
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-full">
              <User className="h-4 w-4" />
              <span>{profile?.name}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {profile?.role === 'master' ? 'Master' : 
                 profile?.role === 'tesoureiro' ? 'Tesoureiro' : 'Supervisor'}
              </span>
            </div>
            
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
