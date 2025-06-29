
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
import { CashBookReport } from '@/components/CashBookReport';

const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user, profile, loading } = useAuth();

  const renderContent = () => {
    if (!user) {
      return <AuthPage onLogin={() => {}} />;
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
      case 'caixa':
        return <CashFlowManager />;
      case 'pending-payments':
        return <PendingPayments />;
      case 'volunteer-payments':
        return <PendingVolunteerPayments />;
      case 'volunteers':
        return <VolunteerManagement />;
      case 'relatorios':
        return <Reports />;
      case 'livro-caixa':
        return <CashBookReport />;
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
        return (
          <div className="space-y-6">
            <DashboardCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashboardChart />
              <RecentTransactionsList transactions={[]} loading={false} />
            </div>
          </div>
        );
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
        <div className="flex min-h-screen">
          <Sidebar activeTab={currentPage} onTabChange={setCurrentPage} />
          <div className="flex-1 flex flex-col">
            <TopNavigation activeTab={currentPage} onTabChange={setCurrentPage} />
            <main className="flex-1 p-4 sm:p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                {renderContent()}
              </div>
            </main>
          </div>
        </div>
      )}
      {!user && renderContent()}
    </div>
  );
};

export default App;
