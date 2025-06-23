
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AdvancedReportChartProps {
  data: any[];
  reportType: string;
  groupBy: string;
  loading: boolean;
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

export const AdvancedReportChart = ({ data, reportType, groupBy, loading }: AdvancedReportChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 animate-pulse bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const getChartTitle = () => {
    const typeMap = {
      comparison: 'Comparativo',
      trends: 'Tendências'
    };
    const groupMap = {
      church: 'por Igreja',
      month: 'por Mês',
      category: 'por Categoria',
      event: 'por Evento'
    };
    return `${typeMap[reportType as keyof typeof typeMap]} ${groupMap[groupBy as keyof typeof groupMap]}`;
  };

  const formatCurrency = (value: number) => {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  };

  const chartData = data.map(item => ({
    name: item.key,
    entradas: item.entradas,
    saidas: item.saidas,
    saldo: item.saldo
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getChartTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          {reportType === 'trends' ? (
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="entradas" 
                stroke="var(--color-entradas)" 
                strokeWidth={2}
                name="Entradas"
              />
              <Line 
                type="monotone" 
                dataKey="saidas" 
                stroke="var(--color-saidas)" 
                strokeWidth={2}
                name="Saídas"
              />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="var(--color-saldo)" 
                strokeWidth={2}
                name="Saldo"
              />
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
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
            </BarChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
