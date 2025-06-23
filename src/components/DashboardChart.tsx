
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ChartData {
  month: string;
  entradas: number;
  saidas: number;
  saldo: number;
}

const chartConfig = {
  entradas: {
    label: "Entradas",
    color: "#10b981",
  },
  saidas: {
    label: "Saídas", 
    color: "#ef4444",
  },
  saldo: {
    label: "Saldo",
    color: "#3b82f6",
  },
};

export const DashboardChart = () => {
  const { profile } = useAuth();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.church_id || profile?.role === 'supervisor') {
      loadChartData();
    }
  }, [profile]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      const churchId = profile?.church_id;
      
      if (!churchId && profile?.role !== 'supervisor') return;

      // Buscar dados dos últimos 6 meses
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          amount,
          type,
          date_transaction,
          cash_sessions!inner(church_id)
        `)
        .eq('cash_sessions.church_id', churchId)
        .gte('date_transaction', sixMonthsAgo.toISOString().split('T')[0]);

      const { data: pixEntries } = await supabase
        .from('pix_entries')
        .select(`
          amount,
          cash_sessions!inner(church_id, date_session)
        `)
        .eq('cash_sessions.church_id', churchId)
        .gte('cash_sessions.date_session', sixMonthsAgo.toISOString().split('T')[0]);

      // Agrupar por mês
      const monthlyData: Record<string, { entradas: number; saidas: number }> = {};

      // Processar transações
      transactions?.forEach(transaction => {
        const date = new Date(transaction.date_transaction);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { entradas: 0, saidas: 0 };
        }

        const amount = Number(transaction.amount);
        if (transaction.type === 'entrada') {
          monthlyData[monthKey].entradas += amount;
        } else {
          monthlyData[monthKey].saidas += amount;
        }
      });

      // Processar PIX
      pixEntries?.forEach(pix => {
        const date = new Date(pix.cash_sessions.date_session);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { entradas: 0, saidas: 0 };
        }

        monthlyData[monthKey].entradas += Number(pix.amount);
      });

      // Converter para array e calcular saldo
      const chartData: ChartData[] = Object.entries(monthlyData)
        .map(([monthKey, values]) => {
          const [year, month] = monthKey.split('-');
          const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          const monthName = monthNames[parseInt(month) - 1];
          
          return {
            month: `${monthName}/${year.slice(2)}`,
            entradas: values.entradas,
            saidas: values.saidas,
            saldo: values.entradas - values.saidas
          };
        })
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6); // Últimos 6 meses

      setData(chartData);
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Fluxo de Caixa Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 animate-pulse bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Dashboard - Sistema de Tesouraria</CardTitle>
        <p className="text-gray-600">Visão geral das informações financeiras</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number) => [
                `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                ''
              ]}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar 
              dataKey="entradas" 
              fill="var(--color-entradas)" 
              radius={[2, 2, 0, 0]}
              name="Entradas"
            />
            <Bar 
              dataKey="saidas" 
              fill="var(--color-saidas)" 
              radius={[2, 2, 0, 0]}
              name="Saídas"
            />
            <Bar 
              dataKey="saldo" 
              fill="var(--color-saldo)" 
              radius={[2, 2, 0, 0]}
              name="Saldo"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
