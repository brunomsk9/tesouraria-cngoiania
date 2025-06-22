
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReportsHeaderProps {
  selectedChurchName: string;
}

export const ReportsHeader = ({ selectedChurchName }: ReportsHeaderProps) => {
  return (
    <div className="flex-1">
      <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
      <p className="text-gray-600">Análises e histórico financeiro</p>
      {selectedChurchName && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800">
            Igreja: {selectedChurchName}
          </p>
        </div>
      )}
    </div>
  );
};
