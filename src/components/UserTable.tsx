
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Building2 } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  role: 'master' | 'tesoureiro' | 'supervisor';
  church_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Church {
  id: string;
  name: string;
}

interface UserTableProps {
  profiles: Profile[];
  churches: Church[];
  onEditUser: (profile: Profile) => void;
}

export const UserTable = ({ profiles, churches, onEditUser }: UserTableProps) => {
  const getChurchName = (churchId: string | null) => {
    if (!churchId) return 'Sem igreja';
    const church = churches.find(c => c.id === churchId);
    return church?.name || 'Igreja não encontrada';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'master': return 'Master';
      case 'tesoureiro': return 'Tesoureiro';
      case 'supervisor': return 'Supervisor';
      default: return role;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Função</TableHead>
          <TableHead>Igreja</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {profiles.map((profile) => (
          <TableRow key={profile.id}>
            <TableCell className="font-medium">{profile.name}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                profile.role === 'master' ? 'bg-purple-100 text-purple-800' :
                profile.role === 'supervisor' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {getRoleLabel(profile.role)}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-1 text-gray-400" />
                {getChurchName(profile.church_id)}
              </div>
            </TableCell>
            <TableCell>
              {new Date(profile.created_at).toLocaleDateString('pt-BR')}
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditUser(profile)}
                disabled={profile.role === 'master'}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
