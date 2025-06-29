
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  DollarSign, 
  UserCheck,
  LogOut,
  Menu,
  X,
  Home,
  BarChart3,
  FileText,
  Users,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TopNavigation = ({ activeTab, onTabChange }: TopNavigationProps) => {
  const { profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Extract first name from profile
  const firstName = profile?.name?.split(' ')[0] || '';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'caixa', label: 'Fluxo de Caixa', icon: DollarSign },
    { id: 'volunteer-payments', label: 'Pagamentos Voluntários', icon: Users },
    { id: 'volunteers', label: 'Voluntários', icon: Users },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'livro-caixa', label: 'Livro Caixa', icon: FileText }
  ];

  const adminItems = [
    { id: 'admin', label: 'Administração', icon: Settings }
  ];

  const handleMenuClick = (itemId: string) => {
    onTabChange(itemId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-lg font-bold text-gray-900">Tesouraria</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-gray-900 text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Admin section - only for masters */}
            {profile?.role === 'master' && adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-purple-100 text-purple-900" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* User info and sign out */}
          <div className="hidden lg:flex items-center space-x-4">
            {profile && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {firstName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {profile.role}
                  </p>
                </div>
              </div>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-4 py-2 text-left rounded-md transition-colors",
                      isActive 
                        ? "bg-gray-900 text-white" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Admin section for mobile - only for masters */}
              {profile?.role === 'master' && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  {adminItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMenuClick(item.id)}
                        className={cn(
                          "w-full flex items-center space-x-3 px-4 py-2 text-left rounded-md transition-colors",
                          isActive 
                            ? "bg-purple-100 text-purple-900" 
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* User info and sign out for mobile */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                {profile && (
                  <div className="flex items-center space-x-3 px-4 py-2 mb-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {firstName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {profile.role}
                      </p>
                    </div>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={signOut}
                  className="w-full mx-4 flex items-center justify-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

function getPageTitle(activeTab: string): string {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    caixa: 'Fluxo de Caixa',
    'volunteer-payments': 'Pagamentos de Voluntários',
    volunteers: 'Voluntários',
    relatorios: 'Relatórios',
    'livro-caixa': 'Livro Caixa',
    admin: 'Administração'
  };
  
  return titles[activeTab] || 'Sistema de Tesouraria';
}
