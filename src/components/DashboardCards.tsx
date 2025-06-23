
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface DashboardData {
  activeSessions: number;
  totalCollected: number;
  validatedSessions: number;
  totalReports: number;
}

export const DashboardCards = () => {
  const { profile } = useAuth();
  const [data, setData] = useState<DashboardData>({
    activeSessions: 0,
    totalCollected: 0,
    validatedSessions: 0,
    totalReports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.church_id || profile?.role === 'supervisor') {
      loadDashboardData();
    }
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const churchId = profile?.church_id;
      
      if (!churchId && profile?.role !== 'supervisor') return;

      // Sessões ativas
      const { count: activeSessions } = await supabase
        .from('cash_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aberto')
        .eq(profile?.role === 'supervisor' ? 'id' : 'church_id', 
           profile?.role === 'supervisor' ? 'any-id' : churchId);

      // Sessões validadas
      const { count: validatedSessions } = await supabase
        .from('cash_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'validado')
        .eq(profile?.role === 'supervisor' ? 'id' : 'church_id', 
           profile?.role === 'supervisor' ? 'any-id' : churchId);

      // Total arrecadado (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          amount,
          type,
          cash_sessions!inner(church_id)
        `)
        .eq('cash_sessions.church_id', churchId)
        .eq('type', 'entrada')
        .gte('date_transaction', thirtyDaysAgo.toISOString().split('T')[0]);

      const totalCollected = (transactions || []).reduce((sum, t) => sum + Number(t.amount), 0);

      // PIX entries
      const { data: pixEntries } = await supabase
        .from('pix_entries')
        .select(`
          amount,
          cash_sessions!inner(church_id, date_session)
        `)
        .eq('cash_sessions.church_id', churchId)
        .gte('cash_sessions.date_session', thirtyDaysAgo.toISOString().split('T')[0]);

      const totalPix = (pixEntries || []).reduce((sum, p) => sum + Number(p.amount), 0);

      setData({
        activeSessions: activeSessions || 0,
        totalCollected: totalCollected + totalPix,
        validatedSessions: validatedSessions || 0,
        totalReports: (activeSessions || 0) + (validatedSessions || 0)
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse shadow-sm">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-shadow border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Sessões Ativas</p>
                <p className="text-3xl font-bold">{data.activeSessions}</p>
              </div>
              <div className="bg-blue-400/30 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-100" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-shadow border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-green-100 text-sm font-medium mb-1">Total Arrecadado</p>
                <p className="text-2xl font-bold truncate">
                  R$ {data.totalCollected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-green-100 text-xs mt-1">Últimos 30 dias</p>
              </div>
              <div className="bg-green-400/30 p-3 rounded-full flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-100" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-shadow border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Sessões Validadas</p>
                <p className="text-3xl font-bold">{data.validatedSessions}</p>
              </div>
              <div className="bg-purple-400/30 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-purple-100" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-shadow border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium mb-1">Total Sessões</p>
                <p className="text-3xl font-bold">{data.totalReports}</p>
              </div>
              <div className="bg-orange-400/30 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-orange-100" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
