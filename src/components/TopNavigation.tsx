
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  DollarSign, 
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

  // Extract first name from profile
  const firstName = profile?.name?.split(' ')[0] || '';

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center lg:hidden">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-lg font-bold text-gray-900">Tesouraria</span>
          </div>

          {/* Page title for desktop */}
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-gray-900">
              {getPageTitle(activeTab)}
            </h1>
          </div>

          {/* User info and actions */}
          <div className="flex items-center space-x-4">
            {/* User info */}
            {profile && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-gray-600" />
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">
                    {firstName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {profile.role}
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

            {/* Mobile sign out */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="sm:hidden"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

function getPageTitle(activeTab: string): string {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    caixa: 'Fluxo de Caixa',
    'pending-payments': 'Pagamentos Pendentes',
    'volunteer-payments': 'Pagamentos de Voluntários',
    volunteers: 'Voluntários',
    relatorios: 'Relatórios',
    'livro-caixa': 'Livro Caixa',
    admin: 'Administração'
  };
  
  return titles[activeTab] || 'Sistema de Tesouraria';
}
