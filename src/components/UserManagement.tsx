
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (profile?.role === 'master') {
      loadProfiles();
      loadChurches();
    }
  }, [profile]);

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

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
        
        <UserCreate churches={churches} onUserCreated={loadPro files} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Usuários do Sistema
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
