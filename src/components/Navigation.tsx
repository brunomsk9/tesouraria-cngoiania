import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  Home,
  DollarSign,
  FileText,
  Users,
  Settings,
  Calendar,
  Building2,
  LogOut,
  BarChart3,
  Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export const Navigation = ({ currentPage, onPageChange }: NavigationProps) => {
  const { signOut, profile } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const pendingValidationsCount = useQuery({
    queryKey: ['pendingValidations', profile?.church_id],
    queryFn: async () => {
      if (!profile?.church_id) return 0;
      
      const { data, error } = await supabase.rpc('get_pending_validations_count', {
        user_church_id: profile.church_id
      });
      
      if (error) throw error;
      return data || 0;
    },
    enabled: !!profile?.church_id,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3,
      roles: ['master', 'tesoureiro', 'supervisor']
    },
    { 
      id: 'cashflow', 
      label: 'Fluxo de Caixa', 
      icon: DollarSign,
      roles: ['master', 'tesoureiro'],
      badge: pendingValidationsCount.data > 0 ? pendingValidationsCount.data : undefined
    },
    { 
      id: 'pending-payments', 
      label: 'Pagamentos Pendentes', 
      icon: Clock,
      roles: ['master', 'tesoureiro']
    },
    { 
      id: 'volunteer-payments', 
      label: 'Pagamentos de Voluntários', 
      icon: Users,
      roles: ['master', 'tesoureiro']
    },
    { 
      id: 'volunteers', 
      label: 'Voluntários', 
      icon: Users,
      roles: ['master', 'tesoureiro']
    },
    { 
      id: 'reports', 
      label: 'Relatórios', 
      icon: FileText,
      roles: ['master', 'tesoureiro', 'supervisor']
    },
    { 
      id: 'admin', 
      label: 'Administração', 
      icon: Settings,
      roles: ['master']
    }
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            {menuItems
              .filter(item => item.roles.includes(profile?.role))
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={item.id}
                    className={cn(
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                      location.pathname === item.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
          </div>
          
          <div className="flex items-center space-x-4">
            {profile && (
              <div className="text-sm text-gray-600">
                Olá, {profile.name}
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
