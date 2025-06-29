
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SupervisorAccess = () => {
  return (
    <div className="p-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Acesso Supervisor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700">
            Como supervisor, você pode visualizar os relatórios de todas as igrejas, 
            mas não pode criar ou modificar sessões de caixa.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
