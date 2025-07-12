
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface SessionsListProps {
  sessions: CashSession[];
  onSelectSession: (session: CashSession) => void;
}

export const SessionsList = ({ sessions, onSelectSession }: SessionsListProps) => {
  if (sessions.length === 0) return null;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Sessões Anteriores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.slice(0, 5).map((session) => (
            <Card 
              key={session.id} 
              className="bg-gray-50 border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectSession(session)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-800">{session.culto_evento}</div>
                    <div className="text-sm text-gray-500">
                      {(() => {
                        if (!session.date_session) return 'Data não definida';
                        if (session.date_session.includes('-') && session.date_session.length === 10) {
                          const [year, month, day] = session.date_session.split('-');
                          return `${day}/${month}/${year}`;
                        }
                        return session.date_session;
                      })()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      session.status === 'aberto' ? 'bg-blue-100 text-blue-800' : 
                      session.status === 'validado' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
