
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthPage } from '@/components/AuthPage';
import { TopNavigation } from '@/components/TopNavigation';
import { DashboardCards } from '@/components/DashboardCards';
import { DashboardChart } from '@/components/DashboardChart';
import { RecentTransactionsList } from '@/components/RecentTransactionsList';
import { CashFlowManager } from '@/components/CashFlowManager';
import { VolunteerManagement } from '@/components/VolunteerManagement';
import { Reports } from '@/components/Reports';
import Admin from '@/pages/Admin';
import { useAuth } from '@/hooks/useAuth';
import { PendingVolunteerPayments } from './components/PendingVolunteerPayments';
import { CashBookReport } from '@/components/CashBookReport';
import Index from '@/pages/Index';
import EmailConfirmation from '@/pages/EmailConfirmation';
import NotFound from '@/pages/NotFound';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster />
        <Routes>
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route path="*" element={<AuthPage onLogin={() => {}} />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
