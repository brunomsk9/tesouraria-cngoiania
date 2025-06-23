
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  FileText,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { profile, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'caixa', label: 'Fluxo de Caixa', icon: DollarSign },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'livro-caixa', label: 'Livro Caixa', icon: FileText }
  ];

  const adminItems = [
    { id: 'admin', label: 'Administração', icon: Settings, path: '/admin' }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuClick = (itemId: string, path?: string) => {
    if (path) {
      // Para itens com path específico, não chamamos onTabChange
      return;
    }
    onTabChange(itemId);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          className="bg-white shadow-lg border-gray-200"
        >
          {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out z-50",
        "lg:translate-x-0 lg:static lg:z-auto lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <DollarSign className="h-6 w-6 text-gray-900" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Tesouraria</h2>
                <p className="text-sm text-gray-300">Sistema de Gestão</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 bg-gray-50">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                    isActive 
                      ? "bg-gray-900 text-white shadow-md" 
                      : "text-gray-700 hover:bg-white hover:shadow-sm"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}

            {/* Admin section - only for masters */}
            {profile?.role === 'master' && (
              <div className="pt-6 border-t border-gray-200 mt-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
                  Administração
                </p>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.path!}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                        isActive 
                          ? "bg-purple-100 text-purple-900 shadow-sm" 
                          : "text-gray-700 hover:bg-white hover:shadow-sm"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {profile?.role}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="w-full border-gray-300 hover:bg-gray-50"
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
