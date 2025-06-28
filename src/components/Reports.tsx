
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subMonths, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ReportsSummaryCards } from './reports/ReportsSummaryCards';
import { ReportsTable } from './reports/ReportsTable';
import { ReportsFilters } from './reports/ReportsFilters';
import { SupervisorReport } from './reports/SupervisorReport';
import { DateEventReport } from './reports/DateEventReport';

interface ReportData {
  id: string;
  date_transaction: string;
  church_name: string;
  event_name: string;
  payment_type: string;
  amount: number;
  type: 'entrada' | 'saida';
  description: string;
}

interface Church {
  id: string;
  name: string;
}

export const Reports = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportData[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<string>('all');
  const [dateRange, setDateRange] = useState('30days');
  const [customDateRange, setCustomDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [activeTab, setActiveTab] = useState('supervisor');

  // Load churches on component mount
  useEffect(() => {
    loadChurches();
  }, []);

  // Set default church for non-supervisor/master users
  useEffect(() => {
    if (profile?.role !== 'supervisor' && profile?.role !== 'master' && profile?.church_id) {
      setSelectedChurch(profile.church_id);
    }
  }, [profile]);

  // Load data when filters change
  useEffect(() => {
    if (profile) {
      loadData();
    }
  }, [dateRange, selectedChurch, profile, customDateRange]);

  const loadChurches = async () => {
    try {
      const { data: churchesData, error } = await supabase
        .from('churches')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setChurches(churchesData || []);
    } catch (error) {
      console.error('Erro ao carregar igrejas:', error);
    }
  };

  const getDateRange = () => {
    if (customDateRange.start && customDateRange.end) {
      return { start: customDateRange.start, end: customDateRange.end };
    }
    
    const now = new Date();
    switch (dateRange) {
      case '7days':
        return { start: subDays(now, 7), end: now };
      case '30days':
        return { start: subDays(now, 30), end: now };
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: subDays(now, 30), end: now };
    }
  };

  const loadData = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const { start, end } = getDateRange();

      let query = supabase
        .from('transactions')
        .select(`
          id,
          date_transaction,
          description,
          amount,
          type,
          category,
          cash_sessions!inner(
            church_id,
            culto_evento,
            churches!inner(name)
          )
        `)
        .gte('date_transaction', format(start, 'yyyy-MM-dd'))
        .lte('date_transaction', format(end, 'yyyy-MM-dd'))
        .order('date_transaction', { ascending: false });

      // Apply church filter
      if (profile?.role === 'supervisor' || profile?.role === 'master') {
        // Supervisor and master can filter by specific church or see all
        if (selectedChurch !== 'all') {
          query = query.eq('cash_sessions.church_id', selectedChurch);
        }
      } else {
        // Non-supervisors/masters can only see their own church
        if (profile?.church_id) {
          query = query.eq('cash_sessions.church_id', profile.church_id);
        }
      }

      const { data: transactions, error } = await query;
      
      if (error) throw error;

      // Transform data for the table
      const transformedData: ReportData[] = (transactions || []).map(transaction => ({
        id: transaction.id,
        date_transaction: transaction.date_transaction,
        church_name: transaction.cash_sessions?.churches?.name || 'N/A',
        event_name: transaction.cash_sessions?.culto_evento || 'N/A',
        payment_type: transaction.category || 'Não especificado',
        amount: Number(transaction.amount),
        type: transaction.type,
        description: transaction.description
      }));

      setData(transformedData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os dados do relatório."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateRange = (startDate: Date, endDate: Date) => {
    setCustomDateRange({ start: startDate, end: endDate });
    setDateRange('custom');
    toast({
      title: "Período personalizado definido",
      description: `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`
    });
  };

  const handleClearFilters = () => {
    setDateRange('30days');
    setCustomDateRange({});
    if (profile?.role === 'supervisor' || profile?.role === 'master') {
      setSelectedChurch('all');
    }
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram resetados para os valores padrão."
    });
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Igreja', 'Evento/Culto', 'Tipo de Pagamento', 'Entradas', 'Saídas', 'Descrição'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        format(new Date(item.date_transaction), 'dd/MM/yyyy'),
        `"${item.church_name}"`,
        `"${item.event_name}"`,
        `"${item.payment_type}"`,
        item.type === 'entrada' ? item.amount.toString().replace('.', ',') : '0',
        item.type === 'saida' ? item.amount.toString().replace('.', ',') : '0',
        `"${item.description}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-2">Carregando dados...</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profile?.role !== 'supervisor' && profile?.role !== 'master' && !profile?.church_id) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Igreja não configurada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700">
            Você precisa estar vinculado a uma igreja para visualizar relatórios.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600 mt-2">
          {profile?.role === 'supervisor' || profile?.role === 'master' 
            ? 'Relatórios consolidados e detalhados' 
            : 'Relatório detalhado de transações'
          }
        </p>
      </div>

      {(profile?.role === 'supervisor' || profile?.role === 'master') ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="supervisor">Relatório Supervisor</TabsTrigger>
            <TabsTrigger value="date-event">Data e Evento</TabsTrigger>
            <TabsTrigger value="detailed">Relatório Detalhado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="supervisor" className="space-y-6">
            <SupervisorReport />
          </TabsContent>
          
          <TabsContent value="date-event" className="space-y-6">
            <DateEventReport />
          </TabsContent>
          
          <TabsContent value="detailed" className="space-y-6">
            <ReportsSummaryCards data={data} />

            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportsFilters
                  churches={churches}
                  selectedChurch={selectedChurch}
                  onChurchChange={setSelectedChurch}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  customDateRange={customDateRange}
                  onCustomDateRange={handleCustomDateRange}
                  onExportCSV={exportToCSV}
                  onClearFilters={handleClearFilters}
                  isSuper={profile?.role === 'supervisor' || profile?.role === 'master'}
                />
              </CardContent>
            </Card>

            <ReportsTable data={data} />
          </TabsContent>
        </Tabs>
      ) : (
        <>
          <ReportsSummaryCards data={data} />

          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportsFilters
                churches={churches}
                selectedChurch={selectedChurch}
                onChurchChange={setSelectedChurch}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                customDateRange={customDateRange}
                onCustomDateRange={handleCustomDateRange}
                onExportCSV={exportToCSV}
                onClearFilters={handleClearFilters}
                isSuper={false}
              />
            </CardContent>
          </Card>

          <ReportsTable data={data} />
        </>
      )}
    </div>
  );
};
