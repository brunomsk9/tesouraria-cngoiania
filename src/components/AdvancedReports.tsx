
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subMonths } from 'date-fns';

interface PaymentTypeData {
  type: string;
  count: number;
  total: number;
}

export const AdvancedReports = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PaymentTypeData[]>([]);

  const loadData = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const startDate = format(subMonths(new Date(), 3), 'yyyy-MM-dd');
      const endDate = format(new Date(), 'yyyy-MM-dd');

      let query = supabase
        .from('transactions')
        .select(`
          type,
          amount,
          cash_sessions!inner(church_id)
        `)
        .gte('date_transaction', startDate)
        .lte('date_transaction', endDate);

      // Filtro por igreja baseado no perfil
      if (profile.role !== 'master' && profile.church_id) {
        query = query.eq('cash_sessions.church_id', profile.church_id);
      }

      const { data: transactions, error } = await query;
      
      if (error) throw error;

      // Agrupar por tipo de pagamento
      const grouped: Record<string, PaymentTypeData> = {};
      
      transactions?.forEach(transaction => {
        const type = transaction.type === 'entrada' ? 'Entradas' : 'Saídas';
        
        if (!grouped[type]) {
          grouped[type] = {
            type,
            count: 0,
            total: 0
          };
        }
        
        grouped[type].count += 1;
        grouped[type].total += Number(transaction.amount);
      });

      setData(Object.values(grouped));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios por Tipo de Pagamento</h1>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Relatórios por Tipo de Pagamento</h1>
        <p className="text-gray-600 mt-2">Últimos 3 meses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.type}>
                  <TableCell className="font-medium">{item.type}</TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                  <TableCell className={`text-right font-bold ${
                    item.type === 'Entradas' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(item.total)}
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    Nenhum dado encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
