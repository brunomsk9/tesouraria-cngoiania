
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Plus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Church {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export const ChurchManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingChurch, setEditingChurch] = useState<Church | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    phone: ''
  });

  useEffect(() => {
    if (profile?.role === 'master') {
      loadChurches();
    }
  }, [profile]);

  const loadChurches = async () => {
    try {
      const { data, error } = await supabase
        .from('churches')
        .select('*')
        .order('name');

      if (error) throw error;
      setChurches(data || []);
    } catch (error) {
      console.error('Erro ao carregar igrejas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar as igrejas."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChurch = async () => {
    try {
      setLoading(true);

      if (editingChurch) {
        // Atualizar igreja existente
        const { error } = await supabase
          .from('churches')
          .update({
            name: formData.name,
            address: formData.address || null,
            city: formData.city || null,
            phone: formData.phone || null
          })
          .eq('id', editingChurch.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Igreja atualizada com sucesso!"
        });
      } else {
        // Criar nova igreja
        const { error } = await supabase
          .from('churches')
          .insert({
            name: formData.name,
            address: formData.address || null,
            city: formData.city || null,
            phone: formData.phone || null
          });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Igreja criada com sucesso!"
        });
      }

      setFormData({ name: '', address: '', city: '', phone: '' });
      setEditingChurch(null);
      setIsDialogOpen(false);
      loadChurches();
    } catch (error: any) {
      console.error('Erro ao salvar igreja:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao salvar igreja"
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (church: Church) => {
    setEditingChurch(church);
    setFormData({
      name: church.name,
      address: church.address || '',
      city: church.city || '',
      phone: church.phone || ''
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingChurch(null);
    setFormData({ name: '', address: '', city: '', phone: '' });
    setIsDialogOpen(true);
  };

  if (profile?.role !== 'master') {
    return (
      <div className="p-6 text-center">
        <div className="text-red-600 mb-4">
          <Building2 className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Acesso Negado</h2>
          <p className="text-gray-600">Apenas usuários Master podem acessar a administração de igrejas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administração de Igrejas</h1>
          <p className="text-gray-600">Gerencie as igrejas cadastradas no sistema</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Igreja
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingChurch ? 'Editar Igreja' : 'Cadastrar Nova Igreja'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Igreja *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome da igreja"
                />
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Endereço completo"
                />
              </div>

              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Cidade"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveChurch} 
                  disabled={loading || !formData.name.trim()}
                >
                  {editingChurch ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Igrejas Cadastradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando igrejas...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {churches.map((church) => (
                  <TableRow key={church.id}>
                    <TableCell className="font-medium">{church.name}</TableCell>
                    <TableCell>{church.city || '-'}</TableCell>
                    <TableCell>{church.phone || '-'}</TableCell>
                    <TableCell>
                      {new Date(church.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(church)}
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
