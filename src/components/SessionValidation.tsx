
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Lock, StopCircle } from 'lucide-react';
import { SessionInfo } from './session-validation/SessionInfo';
import { FinancialSummary } from './session-validation/FinancialSummary';
import { PendingPaymentsAlert } from './session-validation/PendingPaymentsAlert';
import { ValidationActions } from './session-validation/ValidationActions';
import { useSessionValidation } from './session-validation/hooks/useSessionValidation';

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

interface SessionValidationProps {
  session: CashSession;
  onSessionValidated: () => void;
}

export const SessionValidation = ({ session, onSessionValidated }: SessionValidationProps) => {
  const {
    loading,
    canValidate,
    createdByCurrentUser,
    summary,
    creatorName,
    validatorName,
    pendingPaymentsInfo,
    validateSession,
    closeSession,
    rejectValidation
  } = useSessionValidation(session, onSessionValidated);

  if (session.status === 'validado') {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Lock className="h-5 w-5" />
            Sessão Validada - Campos Travados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <Alert className="border-green-200 bg-green-50">
              <Lock className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Sessão Validada</AlertTitle>
              <AlertDescription className="text-green-700">
                Esta sessão foi validada e todos os campos estão travados. Não é possível fazer alterações.
              </AlertDescription>
            </Alert>

            <SessionInfo 
              creatorName={creatorName}
              status={session.status}
              validatorName={validatorName}
              validatedAt={session.validated_at}
            />

            {summary && (
              <FinancialSummary summary={summary} status={session.status} />
            )}

            <PendingPaymentsAlert pendingPaymentsInfo={pendingPaymentsInfo} isValidated={true} />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (session.status === 'fechado') {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <StopCircle className="h-5 w-5" />
            Sessão Encerrada
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <Alert className="border-gray-200 bg-gray-50">
              <StopCircle className="h-4 w-4 text-gray-600" />
              <AlertTitle className="text-gray-800">Sessão Encerrada</AlertTitle>
              <AlertDescription className="text-gray-700">
                Esta sessão foi encerrada sem validação. Nenhuma alteração pode ser feita.
              </AlertDescription>
            </Alert>

            <SessionInfo 
              creatorName={creatorName}
              status={session.status}
              validatorName={validatorName}
              validatedAt={session.validated_at}
            />

            {summary && (
              <FinancialSummary summary={summary} status={session.status} />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-yellow-50 border-b">
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Shield className="h-5 w-5" />
          Validação da Sessão
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <SessionInfo 
          creatorName={creatorName}
          status={session.status}
        />

        {summary && (
          <FinancialSummary summary={summary} status={session.status} />
        )}

        <PendingPaymentsAlert pendingPaymentsInfo={pendingPaymentsInfo} />

        <div className="text-center">
          <ValidationActions
            canValidate={canValidate}
            loading={loading}
            createdByCurrentUser={createdByCurrentUser}
            hasPendingPayments={pendingPaymentsInfo.hasPendingPayments}
            onValidate={validateSession}
            onClose={closeSession}
            onReject={rejectValidation}
          />
        </div>
      </CardContent>
    </Card>
  );
};
