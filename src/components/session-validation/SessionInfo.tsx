
import { Card, CardContent } from '@/components/ui/card';
import { User, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SessionInfoProps {
  creatorName: string;
  status: string;
  validatorName?: string;
  validatedAt?: string | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'aberto':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'validado':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'fechado':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const SessionInfo = ({ creatorName, status, validatorName, validatedAt }: SessionInfoProps) => {
  const isValidated = status === 'validado';
  const isClosed = status === 'fechado';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Criada por:</span>
          </div>
          <p className="text-blue-700">{creatorName}</p>
        </CardContent>
      </Card>

      {(isValidated || isClosed) ? (
        <Card className={isValidated ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {isValidated ? (
                <>
                  <User className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Validada por:</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">Encerrada por:</span>
                </>
              )}
            </div>
            <p className={isValidated ? "text-green-700" : "text-gray-700"}>{validatorName}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">Status:</span>
            </div>
            <Badge className={getStatusColor(status)}>
              {status.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      )}

      {(isValidated || isClosed) && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">
                {isValidated ? "Data da Validação:" : "Data do Encerramento:"}
              </span>
            </div>
            <p className="text-gray-700 text-sm">
              {validatedAt ? new Date(validatedAt).toLocaleString('pt-BR') : 'Data não disponível'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
