
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Shield, StopCircle, X } from 'lucide-react';

interface ValidationActionsProps {
  canValidate: boolean;
  loading: boolean;
  createdByCurrentUser: boolean;
  hasPendingPayments: boolean;
  onValidate: () => void;
  onClose: () => void;
  onReject: () => void;
}

export const ValidationActions = ({
  canValidate,
  loading,
  createdByCurrentUser,
  hasPendingPayments,
  onValidate,
  onClose,
  onReject
}: ValidationActionsProps) => {
  if (!canValidate) {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-3" />
        <h3 className="text-lg font-semibold text-orange-800 mb-2">
          Não é possível validar esta sessão
        </h3>
        <p className="text-orange-700 text-sm">
          {createdByCurrentUser 
            ? "Você não pode validar uma sessão criada por você mesmo."
            : "Esta sessão não está disponível para validação."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <Shield className="h-12 w-12 mx-auto text-green-500 mb-3" />
      <h3 className="text-lg font-semibold text-green-800 mb-2">
        Pronto para Validação
      </h3>
      <p className="text-green-700 text-sm mb-4">
        Escolha uma das opções abaixo para processar esta sessão:
        {hasPendingPayments && (
          <span className="block mt-2 font-medium">
            Nota: Existem pagamentos pendentes que devem ser resolvidos posteriormente.
          </span>
        )}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onValidate}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Validando...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Validar Sessão
            </>
          )}
        </Button>

        <Button
          onClick={onClose}
          disabled={loading}
          variant="outline"
          className="border-gray-400 text-gray-700 hover:bg-gray-100"
          size="lg"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
              Encerrando...
            </>
          ) : (
            <>
              <StopCircle className="h-4 w-4 mr-2" />
              Encerrar Sessão
            </>
          )}
        </Button>

        <Button
          onClick={onReject}
          disabled={loading}
          variant="outline"
          className="border-red-400 text-red-700 hover:bg-red-50"
          size="lg"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
              Recusando...
            </>
          ) : (
            <>
              <X className="h-4 w-4 mr-2" />
              Recusar Validação
            </>
          )}
        </Button>
      </div>

      <div className="mt-4 text-xs text-gray-600 space-y-1">
        <p><strong>Validar:</strong> Confirma os dados e trava todos os campos</p>
        <p><strong>Encerrar:</strong> Finaliza a sessão sem validação (sem alterações)</p>
        <p><strong>Recusar:</strong> Retorna a sessão para edição</p>
      </div>
    </div>
  );
};
