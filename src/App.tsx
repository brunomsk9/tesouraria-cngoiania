import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'sonner';

import { AuthPage } from '@/components/AuthPage';
import { TopNavigation } from '@/components/TopNavigation';
import { Sidebar } from '@/components/Sidebar';
import { DashboardCards } from '@/components/DashboardCards';
import { DashboardChart } from '@/components/DashboardChart';
import { RecentTransactionsList } from '@/components/RecentTransactionsList';
import { CashFlowManager } from '@/components/CashFlowManager';
import { PendingPayments } from '@/components/PendingPayments';
import { VolunteerManagement } from '@/components/VolunteerManagement';
import { Reports } from '@/components/Reports';
import { AdminDashboard } from '@/components/AdminDashboard';
import { useAuth } from '@/hooks/useAuth';
import { PendingVolunteerPayments } from './components/PendingVolunteerPayments';

const queryClient = new QueryClient();

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, profile, loading } = useAuth();

  const renderContent = () => {
    if (!user) {
      return <AuthPage />;
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DashboardCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardChart />
              <RecentTransactionsList />
            </div>
          </div>
        );
      case 'cashflow':
        return <CashFlowManager />;
      case 'pending-payments':
        return <PendingPayments />;
      case 'volunteer-payments':
        return <PendingVolunteerPayments />;
      case 'volunteers':
        return <VolunteerManagement />;
      case 'reports':
        return <Reports />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <div>Página não encontrada</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Toaster />
        {user && (
          <>
            <TopNavigation />
            <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
            <div className="pl-64 pt-16">
              <main className="p-6">
                {renderContent()}
              </main>
            </div>
          </>
        )}
        {!user && renderContent()}
      </div>
    </QueryClientProvider>
  );
};

export default App;
