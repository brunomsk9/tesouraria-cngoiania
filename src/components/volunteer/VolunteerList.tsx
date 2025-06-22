
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Plus } from 'lucide-react';
import { VolunteerCard } from './VolunteerCard';

interface Volunteer {
  id: string;
  name: string;
  phone: string | null;
  pix_key: string | null;
  area_atuacao: string | null;
  churches: { id: string; name: string }[];
}

interface VolunteerListProps {
  volunteers: Volunteer[];
  onEdit: (volunteer: Volunteer) => void;
  onDelete: (volunteerId: string) => void;
  onCreateNew: () => void;
}

export const VolunteerList = ({ volunteers, onEdit, onDelete, onCreateNew }: VolunteerListProps) => {
  if (volunteers.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Nenhum voluntário cadastrado ainda.</p>
          <Button 
            onClick={onCreateNew}
            className="mt-4 bg-gray-900 hover:bg-gray-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Primeiro Voluntário
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {volunteers.map((volunteer) => (
        <VolunteerCard
          key={volunteer.id}
          volunteer={volunteer}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
