
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { VolunteerForm } from './volunteer/VolunteerForm';
import { VolunteerList } from './volunteer/VolunteerList';
import { useVolunteerData } from './volunteer/useVolunteerData';

interface Volunteer {
  id: string;
  name: string;
  phone: string | null;
  pix_key: string | null;
  area_atuacao: string | null;
  churches: { id: string; name: string }[];
}

export const VolunteerManagement = () => {
  const {
    volunteers,
    churches,
    loading,
    canManageVolunteers,
    saveVolunteer,
    deleteVolunteer
  } = useVolunteerData();

  const [isCreating, setIsCreating] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);

  const handleSubmit = async (formData: {
    name: string;
    phone: string;
    pix_key: string;
    area_atuacao: string;
    church_ids: string[];
  }) => {
    try {
      await saveVolunteer(formData, editingVolunteer);
      setIsCreating(false);
      setEditingVolunteer(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEdit = (volunteer: Volunteer) => {
    setEditingVolunteer(volunteer);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingVolunteer(null);
  };

  const handleCreateNew = () => {
    setEditingVolunteer(null);
    setIsCreating(true);
  };

  // Verificar permissão de acesso
  if (!canManageVolunteers) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Acesso Restrito</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">
            Apenas usuários Master e Tesoureiros podem gerenciar voluntários.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Carregando voluntários...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Voluntários</h2>
        {!isCreating && (
          <Button 
            onClick={handleCreateNew}
            className="bg-gray-900 hover:bg-gray-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Voluntário
          </Button>
        )}
      </div>

      {/* Formulário de criação/edição */}
      {isCreating && (
        <VolunteerForm
          volunteer={editingVolunteer}
          churches={churches}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {/* Lista de voluntários */}
      {!isCreating && (
        <VolunteerList
          volunteers={volunteers}
          onEdit={handleEdit}
          onDelete={deleteVolunteer}
          onCreateNew={handleCreateNew}
        />
      )}
    </div>
  );
};
