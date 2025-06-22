
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
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

interface UserEditProps {
  profile: Profile | null;
  churches: Church[];
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export const UserEdit = ({ profile, churches, isOpen, onClose, onUserUpdated }: UserEditProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'tesoureiro' as 'master' | 'tesoureiro' | 'supervisor',
    church_id: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        role: profile.role,
        church_id: profile.church_id || ''
      });
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!profile) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          role: formData.role,
          church_id: formData.church_id || null
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });

      onClose();
      onUserUpdated();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
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
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateProfile} disabled={loading}>
              Atualizar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
