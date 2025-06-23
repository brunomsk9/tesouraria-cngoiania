
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface AdvancedReportChartProps {
  data: any[];
  reportType: string;
  groupBy: string;
  churches: Array<{ id: string; name: string }>;
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

export const AdvancedReportChart = ({ data, reportType, groupBy, churches, loading }: AdvancedReportChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 animate-pulse bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const getDisplayName = (key: string) => {
    if (groupBy === 'church') {
      const church = churches.find(c => c.id === key);
      return church?.name || key;
    }
    return key;
  };

  const chartData = data
    .map(item => ({
      ...item,
      name: getDisplayName(item.key)
    }))
    .sort((a, b) => b.saldo - a.saldo)
    .slice(0, 10); // Mostrar apenas os top 10

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico de Análise</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
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
