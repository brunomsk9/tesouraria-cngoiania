
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  DollarSign, 
  FileText, 
  Users, 
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

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

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="p-2"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-gray-600" />
          <span className="font-semibold text-gray-900">Tesouraria</span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-72 flex flex-col
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-gray-700" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Sistema Tesouraria</h1>
                <p className="text-xs text-gray-500">Gestão Financeira</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {profile?.role === 'master' ? 'Master' : 
                 profile?.role === 'tesoureiro' ? 'Tesoureiro' : 'Supervisor'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              onClick={() => {
                onTabChange(item.id);
                setIsOpen(false);
              }}
              className="w-full justify-start h-auto p-3 bg-transparent hover:bg-gray-50 data-[state=on]:bg-gray-900 data-[state=on]:text-white"
            >
              <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs opacity-70">{item.description}</div>
              </div>
            </Button>
          ))}
        </nav>

        {/* Admin & Actions */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          {profile?.role === 'master' && (
            <Button variant="outline" size="sm" asChild className="w-full justify-start">
              <Link to="/admin">
                <Settings className="h-4 w-4 mr-2" />
                Administração
              </Link>
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </>
  );
};
