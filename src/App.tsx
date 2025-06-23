
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthPage } from '@/components/AuthPage';
import { Navigation } from '@/components/Navigation';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import Index from '@/pages/Index';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import { CashFlowManager } from '@/components/CashFlowManager';
import { Reports } from '@/components/Reports';
import { VolunteerManagement } from '@/components/VolunteerManagement';
import { ChurchManagement } from '@/components/ChurchManagement';
import { CultosEventosManagement } from '@/components/CultosEventosManagement';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cash-flow" element={<CashFlowManager />} />
          <Route path="/cultos-eventos" element={<CultosEventosManagement />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/volunteers" element={<VolunteerManagement />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/churches" element={<ChurchManagement />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
          <Toaster position="top-right" />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
