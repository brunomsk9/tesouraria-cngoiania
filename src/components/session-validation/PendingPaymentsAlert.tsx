
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface PendingPaymentsInfo {
  hasPendingPayments: boolean;
  totalPending: number;
  details: string[];
}

interface PendingPaymentsAlertProps {
  pendingPaymentsInfo: PendingPaymentsInfo;
  isValidated?: boolean;
}

export const PendingPaymentsAlert = ({ pendingPaymentsInfo, isValidated = false }: PendingPaymentsAlertProps) => {
  if (!pendingPaymentsInfo.hasPendingPayments) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">
        {isValidated 
          ? "Pagamentos Pendentes Registrados" 
          : "Atenção: Pagamentos Pendentes Detectados"
        }
      </AlertTitle>
      <AlertDescription className="text-orange-700">
        <p className="mb-3">
          {isValidated 
            ? `No momento da validação, havia R$ ${pendingPaymentsInfo.totalPending.toFixed(2)} em pagamentos pendentes:`
            : `As saídas excedem o dinheiro disponível em R$ ${pendingPaymentsInfo.totalPending.toFixed(2)}. Alguns pagamentos podem estar pendentes:`
          }
        </p>
        <div className="bg-white p-3 rounded border max-h-32 overflow-y-auto">
          {pendingPaymentsInfo.details.map((detail, index) => (
            <div key={index} className="text-sm py-1">• {detail}</div>
          ))}
        </div>
        {!isValidated && (
          <p className="mt-3 text-sm font-medium">
            Esta situação não impede a validação da sessão, mas deve ser resolvida posteriormente.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
};
