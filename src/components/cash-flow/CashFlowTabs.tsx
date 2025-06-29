
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionValidation } from '@/components/SessionValidation';
import { EntradasTab } from '@/components/cash-flow/EntradasTab';
import { SaidasTab } from '@/components/cash-flow/SaidasTab';
import { ResumoTab } from '@/components/cash-flow/ResumoTab';
import { CheckCircle, ArrowUpCircle, ArrowDownCircle, TrendingUp } from 'lucide-react';

interface CashSession {
  id: string;
  date_session: string;
  culto_evento: string;
  status: string;
  church_id: string;
  created_by: string;
  validated_by: string | null;
  validated_at: string | null;
}

interface PixEntry {
  id: string;
  amount: number;
  description: string;
  data_pix: string;
}

interface SelectedVolunteer {
  id: string;
  name: string;
  amount: number;
}

interface PendingPayment {
  id: string;
  name: string;
  amount: number;
  type: 'volunteer' | 'security' | 'others';
}

interface OtherExpense {
  id: string;
  amount: number;
  description: string;
}

interface CashFlowTabsProps {
  currentSession: CashSession;
  entradas: { dinheiro: number; cartao_debito: number; cartao_credito: number };
  setEntradas: (entradas: any) => void;
  pixEntries: PixEntry[];
  setPixEntries: (entries: PixEntry[]) => void;
  selectedVolunteers: SelectedVolunteer[];
  setSelectedVolunteers: (volunteers: SelectedVolunteer[]) => void;
  saidas: { valor_seguranca: number };
  setSaidas: (saidas: { valor_seguranca: number }) => void;
  otherExpenses: OtherExpense[];
  setOtherExpenses: (expenses: OtherExpense[]) => void;
  totalPix: number;
  totalEntradas: number;
  totalVolunteers: number;
  totalOtherExpenses: number;
  totalSaidas: number;
  saldo: number;
  pendingPayments: PendingPayment[];
  availableCash: number;
  onSaveEntradas: () => void;
  onSaveSaidas: () => Promise<void>;
  onSessionValidated: () => void;
  exitsSaved: boolean;
}

export const CashFlowTabs = ({
  currentSession,
  entradas,
  setEntradas,
  pixEntries,
  setPixEntries,
  selectedVolunteers,
  setSelectedVolunteers,
  saidas,
  setSaidas,
  otherExpenses,
  setOtherExpenses,
  totalPix,
  totalEntradas,
  totalVolunteers,
  totalOtherExpenses,
  totalSaidas,
  saldo,
  pendingPayments,
  availableCash,
  onSaveEntradas,
  onSaveSaidas,
  onSessionValidated,
  exitsSaved
}: CashFlowTabsProps) => {
  const isSessionValidated = currentSession?.status === 'validado';

  return (
    <Tabs defaultValue="entradas" className="w-full">
      <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
        <TabsTrigger value="entradas" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
          <ArrowUpCircle className="h-4 w-4 mr-2" />
          Entradas
        </TabsTrigger>
        <TabsTrigger value="saidas" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
          <ArrowDownCircle className="h-4 w-4 mr-2" />
          Saídas
        </TabsTrigger>
        <TabsTrigger value="validacao" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
          <CheckCircle className="h-4 w-4 mr-2" />
          Validação
        </TabsTrigger>
        <TabsTrigger value="resumo" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
          <TrendingUp className="h-4 w-4 mr-2" />
          Resumo
        </TabsTrigger>
      </TabsList>

      <TabsContent value="entradas" className="space-y-6">
        <EntradasTab
          entradas={entradas}
          setEntradas={setEntradas}
          pixEntries={pixEntries}
          setPixEntries={setPixEntries}
          totalEntradas={totalEntradas}
          onSaveEntradas={onSaveEntradas}
          isSessionValidated={isSessionValidated}
        />
      </TabsContent>

      <TabsContent value="saidas" className="space-y-6">
        <SaidasTab
          selectedVolunteers={selectedVolunteers}
          setSelectedVolunteers={setSelectedVolunteers}
          saidas={saidas}
          setSaidas={setSaidas}
          otherExpenses={otherExpenses}
          setOtherExpenses={setOtherExpenses}
          totalVolunteers={totalVolunteers}
          totalOtherExpenses={totalOtherExpenses}
          totalSaidas={totalSaidas}
          onSaveSaidas={onSaveSaidas}
          isSessionValidated={isSessionValidated}
          exitsSaved={exitsSaved}
        />
      </TabsContent>

      <TabsContent value="validacao">
        <SessionValidation 
          session={currentSession}
          onSessionValidated={onSessionValidated}
        />
      </TabsContent>

      <TabsContent value="resumo">
        <ResumoTab
          entradas={entradas}
          pixEntries={pixEntries}
          selectedVolunteers={selectedVolunteers}
          saidas={saidas}
          otherExpenses={otherExpenses}
          totalPix={totalPix}
          totalEntradas={totalEntradas}
          totalVolunteers={totalVolunteers}
          totalOtherExpenses={totalOtherExpenses}
          totalSaidas={totalSaidas}
          saldo={saldo}
          pendingPayments={pendingPayments}
          availableCash={availableCash}
          isSessionValidated={isSessionValidated}
        />
      </TabsContent>
    </Tabs>
  );
};
