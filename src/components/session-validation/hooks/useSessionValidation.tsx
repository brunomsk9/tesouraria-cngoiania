
import { useSessionPermissions } from './useSessionPermissions';
import { useTransactionSummary } from './useTransactionSummary';
import { usePendingPayments } from './usePendingPayments';
import { useUserNames } from './useUserNames';
import { useSessionActions } from './useSessionActions';

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

export const useSessionValidation = (session: CashSession, onSessionValidated: () => void) => {
  const { canValidate, createdByCurrentUser } = useSessionPermissions(session.id, session.created_by);
  const { summary } = useTransactionSummary(session.id);
  const { pendingPaymentsInfo } = usePendingPayments(session.id);
  const { creatorName, validatorName } = useUserNames(session.created_by, session.validated_by);
  const { loading, validateSession, closeSession, rejectValidation } = useSessionActions(session.id, onSessionValidated);

  return {
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
  };
};
