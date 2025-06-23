
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
  LogOut
} from 'lucide-react';

export const Navigation = () => {
  const { signOut, profile } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      show: true
    },
    {
      name: 'Fluxo de Caixa',
      href: '/cash-flow',
      icon: DollarSign,
      show: profile?.role !== 'supervisor'
    },
    {
      name: 'Cultos/Eventos',
      href: '/cultos-eventos',
      icon: Calendar,
      show: profile?.role !== 'supervisor'
    },
    {
      name: 'Relatórios',
      href: '/reports',
      icon: FileText,
      show: true
    },
    {
      name: 'Voluntários',
      href: '/volunteers',
      icon: Users,
      show: profile?.role !== 'supervisor'
    },
    {
      name: 'Administração',
      href: '/admin',
      icon: Settings,
      show: profile?.role === 'master'
    },
    {
      name: 'Igrejas',
      href: '/churches',
      icon: Building2,
      show: profile?.role === 'master'
    }
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            {navigationItems
              .filter(item => item.show)
              .map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                      location.pathname === item.href
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
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
