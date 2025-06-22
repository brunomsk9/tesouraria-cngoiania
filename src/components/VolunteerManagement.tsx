import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Users, Phone, CreditCard, Briefcase, Trash2, Edit } from 'lucide-react';

interface Volunteer {
  id: string;
  name: string;
  phone: string | null;
  pix_key: string | null;
  area_atuacao: string | null;
  churches: { id: string; name: string }[];
}

interface Church {
  id: string;
  name: string;
}

export const VolunteerManagement = () => {
  const { profile } = useAuth();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pix_key: '',
    area_atuacao: '',
    church_ids: [] as string[]
  });

  // Verificar se o usuário pode gerenciar voluntários
  const canManageVolunteers = profile?.role === 'master' || profile?.role === 'tesoureiro';

  useEffect(() => {
    if (canManageVolunteers) {
      loadVolunteers();
      loadChurches();
    }
  }, [profile, canManageVolunteers]);

  const loadVolunteers = async () => {
    try {
      const { data: volunteersData, error: volunteersError } = await supabase
        .from('volunteers')
        .select(`
          id,
          name,
          phone,
          pix_key,
          area_atuacao
        `);

      if (volunteersError) throw volunteersError;

      // Buscar as igrejas de cada voluntário
      const volunteersWithChurches = await Promise.all(
        (volunteersData || []).map(async (volunteer) => {
          const { data: churchData, error: churchError } = await supabase
            .from('volunteer_churches')
            .select(`
              churches (
                id,
                name
              )
            `)
            .eq('volunteer_id', volunteer.id);

          if (churchError) throw churchError;

          return {
            ...volunteer,
            churches: churchData?.map(vc => vc.churches).filter(Boolean) || []
          };
        })
      );

      setVolunteers(volunteersWithChurches as Volunteer[]);
    } catch (error) {
      console.error('Erro ao carregar voluntários:', error);
      toast.error('Erro ao carregar voluntários');
    }
  };

  const loadChurches = async () => {
    try {
      let query = supabase.from('churches').select('id, name');
      
      // Se for tesoureiro, filtrar apenas sua igreja
      if (profile?.role === 'tesoureiro' && profile?.church_id) {
        query = query.eq('id', profile.church_id);
      }
      
      const { data, error } = await query.order('name');

      if (error) throw error;
      setChurches(data || []);
    } catch (error) {
      console.error('Erro ao carregar igrejas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação obrigatória do nome
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (formData.church_ids.length === 0) {
      toast.error('Selecione pelo menos uma igreja');
      return;
    }

    try {
      let volunteerId: string;

      if (editingVolunteer) {
        // Atualizar voluntário existente
        const { error: updateError } = await supabase
          .from('volunteers')
          .update({
            name: formData.name,
            phone: formData.phone || null,
            pix_key: formData.pix_key || null,
            area_atuacao: formData.area_atuacao || null,
          })
          .eq('id', editingVolunteer.id);

        if (updateError) throw updateError;
        volunteerId = editingVolunteer.id;

        // Remover associações antigas
        await supabase
          .from('volunteer_churches')
          .delete()
          .eq('volunteer_id', volunteerId);
      } else {
        // Criar novo voluntário
        const { data: volunteerData, error: volunteerError } = await supabase
          .from('volunteers')
          .insert({
            name: formData.name,
            phone: formData.phone || null,
            pix_key: formData.pix_key || null,
            area_atuacao: formData.area_atuacao || null,
          })
          .select()
          .single();

        if (volunteerError) throw volunteerError;
        volunteerId = volunteerData.id;
      }

      // Criar associações com igrejas
      const churchAssociations = formData.church_ids.map(churchId => ({
        volunteer_id: volunteerId,
        church_id: churchId
      }));

      const { error: associationError } = await supabase
        .from('volunteer_churches')
        .insert(churchAssociations);

      if (associationError) throw associationError;

      toast.success(editingVolunteer ? 'Voluntário atualizado com sucesso!' : 'Voluntário criado com sucesso!');
      setFormData({ name: '', phone: '', pix_key: '', area_atuacao: '', church_ids: [] });
      setIsCreating(false);
      setEditingVolunteer(null);
      loadVolunteers();
    } catch (error) {
      console.error('Erro ao salvar voluntário:', error);
      toast.error('Erro ao salvar voluntário');
    }
  };

  const handleEdit = (volunteer: Volunteer) => {
    setFormData({
      name: volunteer.name,
      phone: volunteer.phone || '',
      pix_key: volunteer.pix_key || '',
      area_atuacao: volunteer.area_atuacao || '',
      church_ids: volunteer.churches.map(c => c.id)
    });
    setEditingVolunteer(volunteer);
    setIsCreating(true);
  };

  const handleDelete = async (volunteerId: string) => {
    if (!confirm('Tem certeza que deseja excluir este voluntário?')) return;

    try {
      const { error } = await supabase
        .from('volunteers')
        .delete()
        .eq('id', volunteerId);

      if (error) throw error;

      toast.success('Voluntário excluído com sucesso!');
      loadVolunteers();
    } catch (error) {
      console.error('Erro ao excluir voluntário:', error);
      toast.error('Erro ao excluir voluntário');
    }
  };

  const handleChurchToggle = (churchId: string) => {
    setFormData(prev => ({
      ...prev,
      church_ids: prev.church_ids.includes(churchId)
        ? prev.church_ids.filter(id => id !== churchId)
        : [...prev.church_ids, churchId]
    }));
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Voluntários</h2>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-gray-900 hover:bg-gray-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Voluntário
        </Button>
      </div>

      {/* Formulário de criação/edição */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingVolunteer ? 'Editar Voluntário' : 'Novo Voluntário'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Nome completo"
                    required
                    className={!formData.name.trim() && isCreating ? 'border-red-500' : ''}
                  />
                  {!formData.name.trim() && (
                    <p className="text-sm text-red-500 mt-1">Nome é obrigatório</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pix_key">Chave PIX</Label>
                  <Input
                    id="pix_key"
                    value={formData.pix_key}
                    onChange={(e) => setFormData({...formData, pix_key: e.target.value})}
                    placeholder="CPF, email ou chave aleatória"
                  />
                </div>
                <div>
                  <Label htmlFor="area_atuacao">Área de Atuação</Label>
                  <Input
                    id="area_atuacao"
                    value={formData.area_atuacao}
                    onChange={(e) => setFormData({...formData, area_atuacao: e.target.value})}
                    placeholder="Ex: Som, Limpeza, Segurança"
                  />
                </div>
              </div>

              <div>
                <Label>Igrejas *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {churches.map((church) => (
                    <Button
                      key={church.id}
                      type="button"
                      variant={formData.church_ids.includes(church.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChurchToggle(church.id)}
                      className="justify-start"
                    >
                      {church.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setEditingVolunteer(null);
                    setFormData({ name: '', phone: '', pix_key: '', area_atuacao: '', church_ids: [] });
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gray-900 hover:bg-gray-800">
                  {editingVolunteer ? 'Atualizar' : 'Criar'} Voluntário
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de voluntários */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {volunteers.map((volunteer) => (
          <Card key={volunteer.id} className="hover:shadow-md transition-shadow">
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
                    onClick={() => handleEdit(volunteer)}
                    className="p-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(volunteer.id)}
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
        ))}
      </div>

      {volunteers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhum voluntário cadastrado ainda.</p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="mt-4 bg-gray-900 hover:bg-gray-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Voluntário
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
