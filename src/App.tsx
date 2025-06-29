
import React, { useState } from 'react';
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
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useAuth } from '@/hooks/useAuth';
import { PendingVolunteerPayments } from './components/PendingVolunteerPayments';

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, profile, loading } = useAuth();

  const handleLogin = () => {
    // This will be handled by the auth state change
  };

  const renderContent = () => {
    if (!user) {
      return <AuthPage onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <DashboardCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardChart />
              <RecentTransactionsList transactions={[]} loading={false} />
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
        return <AdminDashboard 
          onSectionChange={() => {}}
          canManageUsers={profile?.role === 'master'}
          canManageChurches={profile?.role === 'master'}
          canManageVolunteers={true}
          canManageCultosEventos={true}
          canManageLogos={true}
        />;
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
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      {user && (
        <>
          <TopNavigation activeTab={currentPage} onTabChange={setCurrentPage} />
          <Sidebar activeTab={currentPage} onTabChange={setCurrentPage} />
          <div className="pl-64 pt-16">
            <main className="p-6">
              {renderContent()}
            </main>
          </div>
        </>
      )}
      {!user && renderContent()}
    </div>
  );
};

export default App;
