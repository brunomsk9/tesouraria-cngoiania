
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  Home, 
  DollarSign, 
  BarChart3, 
  Settings, 
  FileText,
  UserCheck,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TopNavigation = ({ activeTab, onTabChange }: TopNavigationProps) => {
  const { profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'caixa', label: 'Fluxo de Caixa', icon: DollarSign },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
    { id: 'livro-caixa', label: 'Livro Caixa', icon: FileText }
  ];

  const handleMenuClick = (itemId: string) => {
    onTabChange(itemId);
    setIsMobileMenuOpen(false);
  };

  // Extract first name from profile
  const firstName = profile?.name?.split(' ')[0] || '';

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo only */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Tesouraria</h1>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-gray-900 text-white shadow-md" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Admin link - only for masters */}
            {profile?.role === 'master' && (
              <a
                href="/admin"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </a>
            )}
          </div>

          {/* User info and mobile button */}
          <div className="flex items-center space-x-4">
            {/* User info - only first name */}
            {profile && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-gray-600" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">
                    {firstName}
                  </p>
                </div>
              </div>
            )}

            {/* Sign out button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="hidden sm:flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Sair</span>
            </Button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200",
                    isActive 
                      ? "bg-gray-900 text-white" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}

            {/* Admin link for mobile - only for masters */}
            {profile?.role === 'master' && (
              <a
                href="/admin"
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <Settings className="h-5 w-5" />
                <span className="font-medium">Administração</span>
              </a>
            )}

            {/* User info and sign out for mobile */}
            <div className="pt-4 border-t border-gray-200 mt-4">
              {profile && (
                <div className="flex items-center space-x-3 px-3 py-2 mb-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
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
                className="w-full mx-3 mb-2 flex items-center justify-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
