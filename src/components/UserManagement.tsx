
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UserCreate } from './UserCreate';
import { UserTable } from './UserTable';
import { UserEdit } from './UserEdit';

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

export const UserManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (profile?.role === 'master') {
      loadProfiles();
      loadChurches();
    }
  }, [profile, selectedChurch]);

  const loadProfiles = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Se um supervisor está filtrando por igreja específica
      if (selectedChurch !== 'all' && selectedChurch !== 'none') {
        query = query.eq('church_id', selectedChurch);
      } else if (selectedChurch === 'none') {
        query = query.is('church_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar os perfis de usuário."
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChurches = async () => {
    try {
      const { data, error } = await supabase
        .from('churches')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setChurches(data || []);
    } catch (error) {
      console.error('Erro ao carregar igrejas:', error);
    }
  };

  const handleEditUser = (profile: Profile) => {
    setEditingProfile(profile);
  };

  const handleCloseEdit = () => {
    setEditingProfile(null);
  };

  if (profile?.role !== 'master') {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">
          <Users className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Acesso Negado</h2>
          <p className="text-gray-600">Apenas usuários Master podem acessar a administração de usuários.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administração de Usuários</h1>
          <p className="text-gray-600">Gerencie usuários, roles e vínculos com igrejas</p>
        </div>
        
        <div className="flex space-x-2">
          <Select value={selectedChurch} onValueChange={setSelectedChurch}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as igrejas</SelectItem>
              <SelectItem value="none">Sem igreja</SelectItem>
              {churches.map((church) => (
                <SelectItem key={church.id} value={church.id}>
                  {church.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <UserCreate churches={churches} onUserCreated={loadProfiles} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Usuários do Sistema
            </div>
            {selectedChurch !== 'all' && (
              <div className="flex items-center text-sm text-blue-600">
                <Building2 className="h-4 w-4 mr-1" />
                {selectedChurch === 'none' ? 'Sem igreja' : churches.find(c => c.id === selectedChurch)?.name}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando usuários...</p>
            </div>
          ) : (
            <UserTable 
              profiles={profiles} 
              churches={churches} 
              onEditUser={handleEditUser} 
            />
          )}
        </CardContent>
      </Card>

      <UserEdit
        profile={editingProfile}
        churches={churches}
        isOpen={!!editingProfile}
        onClose={handleCloseEdit}
        onUserUpdated={loadProfiles}
      />
    </div>
  );
};
