
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

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

export const useVolunteerData = () => {
  const { profile } = useAuth();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);

  const canManageVolunteers = profile?.role === 'master' || profile?.role === 'tesoureiro';

  const loadVolunteers = async () => {
    try {
      console.log('Iniciando carregamento de voluntários...');
      const { data: volunteersData, error: volunteersError } = await supabase
        .from('volunteers')
        .select(`
          id,
          name,
          phone,
          pix_key,
          area_atuacao
        `);

      if (volunteersError) {
        console.error('Erro ao carregar voluntários:', volunteersError);
        throw volunteersError;
      }

      console.log('Voluntários carregados:', volunteersData);

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
    } finally {
      setLoading(false);
    }
  };

  const loadChurches = async () => {
    try {
      console.log('Carregando igrejas...', { profile });
      let query = supabase.from('churches').select('id, name');
      
      // Se for tesoureiro, filtrar apenas sua igreja
      if (profile?.role === 'tesoureiro' && profile?.church_id) {
        query = query.eq('id', profile.church_id);
      }
      
      const { data, error } = await query.order('name');

      if (error) throw error;
      console.log('Igrejas carregadas:', data);
      setChurches(data || []);
    } catch (error) {
      console.error('Erro ao carregar igrejas:', error);
    }
  };

  const saveVolunteer = async (formData: {
    name: string;
    phone: string;
    pix_key: string;
    area_atuacao: string;
    church_ids: string[];
  }, editingVolunteer?: Volunteer | null) => {
    console.log('Iniciando submissão do formulário...', { formData, profile });
    
    // Validação obrigatória do nome
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      throw new Error('Nome é obrigatório');
    }

    if (formData.church_ids.length === 0) {
      toast.error('Selecione pelo menos uma igreja');
      throw new Error('Selecione pelo menos uma igreja');
    }

    try {
      let volunteerId: string;

      if (editingVolunteer) {
        console.log('Atualizando voluntário existente...', editingVolunteer.id);
        // Atualizar voluntário existente
        const { error: updateError } = await supabase
          .from('volunteers')
          .update({
            name: formData.name.trim(),
            phone: formData.phone.trim() || null,
            pix_key: formData.pix_key.trim() || null,
            area_atuacao: formData.area_atuacao.trim() || null,
          })
          .eq('id', editingVolunteer.id);

        if (updateError) {
          console.error('Erro ao atualizar voluntário:', updateError);
          toast.error('Erro ao atualizar voluntário: ' + updateError.message);
          throw updateError;
        }
        volunteerId = editingVolunteer.id;

        // Remover associações antigas
        await supabase
          .from('volunteer_churches')
          .delete()
          .eq('volunteer_id', volunteerId);
      } else {
        console.log('Criando novo voluntário...');
        // Criar novo voluntário com dados limpos
        const volunteerInsertData = {
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
          pix_key: formData.pix_key.trim() || null,
          area_atuacao: formData.area_atuacao.trim() || null,
        };
        
        console.log('Dados para inserção:', volunteerInsertData);
        
        const { data: volunteerData, error: volunteerError } = await supabase
          .from('volunteers')
          .insert(volunteerInsertData)
          .select()
          .single();

        if (volunteerError) {
          console.error('Erro ao criar voluntário:', volunteerError);
          toast.error('Erro ao criar voluntário: ' + volunteerError.message);
          throw volunteerError;
        }
        
        console.log('Voluntário criado:', volunteerData);
        volunteerId = volunteerData.id;
      }

      console.log('Criando associações com igrejas...', formData.church_ids);
      // Criar associações com igrejas
      const churchAssociations = formData.church_ids.map(churchId => ({
        volunteer_id: volunteerId,
        church_id: churchId
      }));

      const { error: associationError } = await supabase
        .from('volunteer_churches')
        .insert(churchAssociations);

      if (associationError) {
        console.error('Erro ao criar associações:', associationError);
        toast.error('Erro ao criar associações: ' + associationError.message);
        throw associationError;
      }

      console.log('Voluntário salvo com sucesso!');
      toast.success(editingVolunteer ? 'Voluntário atualizado com sucesso!' : 'Voluntário criado com sucesso!');
      await loadVolunteers();
    } catch (error) {
      console.error('Erro geral ao salvar voluntário:', error);
      // Não fazer toast adicional se já foi feito acima
      if (!(error as any)?.message?.includes('row violates row-level security')) {
        toast.error('Erro inesperado ao salvar voluntário');
      }
      throw error;
    }
  };

  const deleteVolunteer = async (volunteerId: string) => {
    try {
      console.log('Deletando voluntário:', volunteerId);
      const { error } = await supabase
        .from('volunteers')
        .delete()
        .eq('id', volunteerId);

      if (error) {
        console.error('Erro ao deletar voluntário:', error);
        throw error;
      }

      toast.success('Voluntário excluído com sucesso!');
      await loadVolunteers();
    } catch (error) {
      console.error('Erro ao excluir voluntário:', error);
      toast.error('Erro ao excluir voluntário');
    }
  };

  useEffect(() => {
    if (canManageVolunteers) {
      console.log('Carregando dados de voluntários...', { profile });
      loadVolunteers();
      loadChurches();
    }
  }, [profile, canManageVolunteers]);

  return {
    volunteers,
    churches,
    loading,
    canManageVolunteers,
    saveVolunteer,
    deleteVolunteer,
    refetch: loadVolunteers
  };
};
