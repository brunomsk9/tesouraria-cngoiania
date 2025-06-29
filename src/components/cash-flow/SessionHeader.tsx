
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

interface SessionHeaderProps {
  currentSession: CashSession;
  onNewSession: () => void;
}

export const SessionHeader = ({ currentSession, onNewSession }: SessionHeaderProps) => {
  const isSessionValidated = currentSession?.status === 'validado';

  const formatSessionDate = (dateString: string) => {
    if (!dateString) return 'Data não definida';
    
    if (dateString.includes('-') && dateString.length === 10) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    return dateString;
  };

  return (
    <Card className={`${isSessionValidated ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'} text-white border-0 shadow-lg`}>
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <span>
            {isSessionValidated ? '🔒 ' : ''}
            Sessão {isSessionValidated ? 'Validada' : 'Ativa'}: {currentSession.culto_evento}
          </span>
          <Button 
            onClick={onNewSession} 
            variant="outline" 
            size="sm"
            className={`${isSessionValidated ? 'text-green-600 border-white hover:bg-white' : 'text-blue-600 border-white hover:bg-white'}`}
          >
            Nova Sessão
          </Button>
        </CardTitle>
        <p className={`${isSessionValidated ? 'text-green-100' : 'text-blue-100'}`}>
          Data: {formatSessionDate(currentSession.date_session)} | 
          Status: {currentSession.status.toUpperCase()}
          {isSessionValidated && ' - CAMPOS TRAVADOS'}
        </p>
      </CardHeader>
    </Card>
  );
};
