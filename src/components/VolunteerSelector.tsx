
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Users, X, UserPlus } from 'lucide-react';
import { useCurrencyFormat, formatToCurrency, parseCurrencyToNumber } from '@/hooks/useCurrencyFormat';

interface Volunteer {
  id: string;
  name: string;
  pix_key: string | null;
}

interface SelectedVolunteer {
  id: string;
  name: string;
  amount: number;
}

interface VolunteerSelectorProps {
  selectedVolunteers: SelectedVolunteer[];
  onVolunteersChange: (volunteers: SelectedVolunteer[]) => void;
}

export const VolunteerSelector = ({ selectedVolunteers, onVolunteersChange }: VolunteerSelectorProps) => {
  const { profile } = useAuth();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState({
    name: '',
    phone: '',
    pix_key: '',
    area_atuacao: ''
  });

  useEffect(() => {
    if (profile?.church_id) {
      loadVolunteers();
    }
  }, [profile?.church_id]);

  const loadVolunteers = async () => {
    if (!profile?.church_id) return;

    try {
      const { data, error } = await supabase
        .from('volunteer_churches')
        .select(`
          volunteers (
            id,
            name,
            pix_key
          )
        `)
        .eq('church_id', profile.church_id);

      if (error) throw error;

      const volunteerList = data?.map(vc => vc.volunteers).filter(Boolean) || [];
      setVolunteers(volunteerList as Volunteer[]);
    } catch (error) {
      console.error('Erro ao carregar voluntários:', error);
      toast.error('Erro ao carregar voluntários');
    }
  };

  const createVolunteer = async () => {
    if (!newVolunteer.name.trim() || !profile?.church_id) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      const { data: volunteerData, error: volunteerError } = await supabase
        .from('volunteers')
        .insert({
          name: newVolunteer.name,
          phone: newVolunteer.phone || null,
          pix_key: newVolunteer.pix_key || null,
          area_atuacao: newVolunteer.area_atuacao || null,
        })
        .select()
        .single();

      if (volunteerError) throw volunteerError;

      const { error: associationError } = await supabase
        .from('volunteer_churches')
        .insert({
          volunteer_id: volunteerData.id,
          church_id: profile.church_id
        });

      if (associationError) throw associationError;

      toast.success('Voluntário criado com sucesso!');
      setNewVolunteer({ name: '', phone: '', pix_key: '', area_atuacao: '' });
      setIsCreating(false);
      loadVolunteers();
    } catch (error) {
      console.error('Erro ao criar voluntário:', error);
      toast.error('Erro ao criar voluntário');
    }
  };

  const addVolunteer = (volunteer: Volunteer) => {
    if (selectedVolunteers.find(v => v.id === volunteer.id)) {
      toast.error('Voluntário já foi adicionado');
      return;
    }

    const newSelected = [...selectedVolunteers, {
      id: volunteer.id,
      name: volunteer.name,
      amount: 30 // valor padrão
    }];
    onVolunteersChange(newSelected);
  };

  const removeVolunteer = (volunteerId: string) => {
    const newSelected = selectedVolunteers.filter(v => v.id !== volunteerId);
    onVolunteersChange(newSelected);
  };

  const updateVolunteerAmount = (volunteerId: string, displayValue: string) => {
    const numericAmount = parseCurrencyToNumber(displayValue);
    const newSelected = selectedVolunteers.map(v => 
      v.id === volunteerId ? { ...v, amount: numericAmount } : v
    );
    onVolunteersChange(newSelected);
  };

  const totalVolunteers = selectedVolunteers.reduce((sum, v) => sum + v.amount, 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Pagamento de Voluntários
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {isCreating ? 'Cancelar' : 'Novo Voluntário'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCreating && (
            <Card className="bg-gray-50">
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Nome *</Label>
                    <Input
                      value={newVolunteer.name}
                      onChange={(e) => setNewVolunteer({...newVolunteer, name: e.target.value})}
                      placeholder="Nome do voluntário"
                      className="h-9"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Telefone</Label>
                    <Input
                      value={newVolunteer.phone}
                      onChange={(e) => setNewVolunteer({...newVolunteer, phone: e.target.value})}
                      placeholder="(00) 00000-0000"
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Chave PIX</Label>
                    <Input
                      value={newVolunteer.pix_key}
                      onChange={(e) => setNewVolunteer({...newVolunteer, pix_key: e.target.value})}
                      placeholder="CPF, email ou chave"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Área de Atuação</Label>
                    <Input
                      value={newVolunteer.area_atuacao}
                      onChange={(e) => setNewVolunteer({...newVolunteer, area_atuacao: e.target.value})}
                      placeholder="Ex: Som, Limpeza"
                      className="h-9"
                    />
                  </div>
                </div>
                <Button onClick={createVolunteer} size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Voluntário
                </Button>
              </CardContent>
            </Card>
          )}

          <div>
            <Label className="text-sm font-medium mb-2 block">Voluntários Disponíveis</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {volunteers.map((volunteer) => (
                <Button
                  key={volunteer.id}
                  variant="outline"
                  size="sm"
                  onClick={() => addVolunteer(volunteer)}
                  disabled={selectedVolunteers.some(v => v.id === volunteer.id)}
                  className="justify-start h-auto p-3"
                >
                  <div className="text-left">
                    <div className="font-medium text-sm">{volunteer.name}</div>
                    {volunteer.pix_key && (
                      <div className="text-xs text-gray-500 truncate">{volunteer.pix_key}</div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {selectedVolunteers.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Voluntários Selecionados</Label>
              <div className="space-y-2">
                {selectedVolunteers.map((volunteer) => (
                  <VolunteerAmountInput
                    key={volunteer.id}
                    volunteer={volunteer}
                    onAmountChange={(displayValue) => updateVolunteerAmount(volunteer.id, displayValue)}
                    onRemove={() => removeVolunteer(volunteer.id)}
                  />
                ))}
              </div>

              <div className="flex justify-between items-center pt-3 border-t bg-blue-50 p-3 rounded-lg mt-3">
                <span className="font-medium text-blue-800">Total Voluntários ({selectedVolunteers.length}):</span>
                <span className="text-xl font-bold text-blue-800">
                  {formatToCurrency(totalVolunteers)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Componente separado para entrada de valor do voluntário
const VolunteerAmountInput = ({ 
  volunteer, 
  onAmountChange, 
  onRemove 
}: {
  volunteer: SelectedVolunteer;
  onAmountChange: (value: string) => void;
  onRemove: () => void;
}) => {
  const { displayValue, handleChange } = useCurrencyFormat(volunteer.amount);

  const handleInputChange = (value: string) => {
    handleChange(value);
    onAmountChange(value);
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center space-x-3">
        <Badge variant="outline">{volunteer.name}</Badge>
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={displayValue}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-24 h-8 text-sm"
            placeholder="R$ 0,00"
          />
        </div>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={onRemove}
        className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
