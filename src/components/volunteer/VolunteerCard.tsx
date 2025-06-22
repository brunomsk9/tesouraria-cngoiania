
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Phone, CreditCard, Briefcase, Trash2, Edit } from 'lucide-react';

interface Volunteer {
  id: string;
  name: string;
  phone: string | null;
  pix_key: string | null;
  area_atuacao: string | null;
  churches: { id: string; name: string }[];
}

interface VolunteerCardProps {
  volunteer: Volunteer;
  onEdit: (volunteer: Volunteer) => void;
  onDelete: (volunteerId: string) => void;
}

export const VolunteerCard = ({ volunteer, onEdit, onDelete }: VolunteerCardProps) => {
  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este voluntário?')) {
      onDelete(volunteer.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-gray-600" />
              {volunteer.name}
            </CardTitle>
          </div>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(volunteer)}
              className="p-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {volunteer.phone && (
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            {volunteer.phone}
          </div>
        )}
        
        {volunteer.pix_key && (
          <div className="flex items-center text-sm text-gray-600">
            <CreditCard className="h-4 w-4 mr-2" />
            {volunteer.pix_key}
          </div>
        )}
        
        {volunteer.area_atuacao && (
          <div className="flex items-center text-sm text-gray-600">
            <Briefcase className="h-4 w-4 mr-2" />
            {volunteer.area_atuacao}
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Igrejas:</p>
          <div className="flex flex-wrap gap-1">
            {volunteer.churches.map((church) => (
              <Badge key={church.id} variant="outline" className="text-xs">
                {church.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
