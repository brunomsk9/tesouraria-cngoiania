
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, Plus, Edit, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tesoureiro' as 'master' | 'tesoureiro' | 'supervisor',
    church_id: ''
  });

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

  const handleCreateUser = async () => {
    try {
      setLoading(true);

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        user_metadata: {
          name: formData.name
        }
      });

      if (authError) throw authError;

      // Atualizar perfil com role e igreja
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          role: formData.role,
          church_id: formData.church_id || null
        })
        .eq('id', authData.user.id);

      if (profileError) throw profileError;

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!"
      });

      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'tesoureiro',
        church_id: ''
      });
      setIsDialogOpen(false);
      loadProfiles();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao criar usuário"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editingProfile) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          role: formData.role,
          church_id: formData.church_id || null
        })
        .eq('id', editingProfile.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });

      setEditingProfile(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'tesoureiro',
        church_id: ''
      });
      setIsDialogOpen(false);
      loadProfiles();
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao atualizar perfil"
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (profile: Profile) => {
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      email: '',
      password: '',
      role: profile.role,
      church_id: profile.church_id || ''
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingProfile(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'tesoureiro',
      church_id: ''
    });
    setIsDialogOpen(true);
  };

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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProfile ? 'Editar Usuário' : 'Criar Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>

              {!editingProfile && (
                <>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Senha inicial"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="role">Função</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tesoureiro">Tesoureiro</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'tesoureiro' && (
                <div>
                  <Label htmlFor="church">Igreja</Label>
                  <Select value={formData.church_id} onValueChange={(value) => setFormData({ ...formData, church_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma igreja" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem igreja</SelectItem>
                      {churches.map((church) => (
                        <SelectItem key={church.id} value={church.id}>
                          {church.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={editingProfile ? handleUpdateProfile : handleCreateUser} disabled={loading}>
                  {editingProfile ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                        onClick={() => openEditDialog(profile)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};
