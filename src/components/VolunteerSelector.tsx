
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Users, X, UserPlus, Search, CheckSquare } from 'lucide-react';
import { MoneyInput } from '@/components/MoneyInput';

interface Volunteer {
  id: string;
  name: string;
  pix_key: string | null;
  area_atuacao: string | null;
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
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedForAddition, setSelectedForAddition] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [defaultAmount, setDefaultAmount] = useState("30");
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

  useEffect(() => {
    const filtered = volunteers.filter(volunteer => 
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (volunteer.area_atuacao && volunteer.area_atuacao.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredVolunteers(filtered);
  }, [volunteers, searchTerm]);

  const loadVolunteers = async () => {
    if (!profile?.church_id) return;

    try {
      const { data, error } = await supabase
        .from('volunteer_churches')
        .select(`
          volunteers (
            id,
            name,
            pix_key,
            area_atuacao
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

  const toggleVolunteerSelection = (volunteerId: string) => {
    setSelectedForAddition(prev => 
      prev.includes(volunteerId)
        ? prev.filter(id => id !== volunteerId)
        : [...prev, volunteerId]
    );
  };

  const addSelectedVolunteers = () => {
    const volunteersToAdd = volunteers.filter(v => 
      selectedForAddition.includes(v.id) && 
      !selectedVolunteers.find(sv => sv.id === v.id)
    );

    if (volunteersToAdd.length === 0) {
      toast.error('Selecione pelo menos um voluntário');
      return;
    }

    const newSelected = [
      ...selectedVolunteers,
      ...volunteersToAdd.map(volunteer => ({
        id: volunteer.id,
        name: volunteer.name,
        amount: parseFloat(defaultAmount) || 0
      }))
    ];

    onVolunteersChange(newSelected);
    setSelectedForAddition([]);
    toast.success(`${volunteersToAdd.length} voluntário(s) adicionado(s) à lista de pagamentos`);
  };

  const removeVolunteer = (volunteerId: string) => {
    const newSelected = selectedVolunteers.filter(v => v.id !== volunteerId);
    onVolunteersChange(newSelected);
  };

  const updateVolunteerAmount = (volunteerId: string, amount: string) => {
    const numericAmount = parseFloat(amount) || 0;
    const newSelected = selectedVolunteers.map(v => 
      v.id === volunteerId ? { ...v, amount: numericAmount } : v
    );
    onVolunteersChange(newSelected);
  };

  const totalVolunteers = selectedVolunteers.reduce((sum, v) => sum + v.amount, 0);
  const availableVolunteers = volunteers.filter(v => !selectedVolunteers.some(sv => sv.id === v.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0">
          <CardHeader className="pb-3 bg-blue-50 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Selecionar Voluntários para Pagamento
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVolunteersChange(selectedVolunteers)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Configuração do valor padrão */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Valor Padrão para Novos Voluntários</Label>
              <div className="flex gap-3 items-center">
                <MoneyInput
                  value={defaultAmount}
                  onChange={(value) => setDefaultAmount(value)}
                  className="w-40"
                  placeholder="R$ 0,00"
                />
                <span className="text-sm text-gray-600">Este valor será aplicado automaticamente aos voluntários selecionados</span>
              </div>
            </div>

            {/* Busca e seleção múltipla */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Buscar e Selecionar Voluntários</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Digite o nome do voluntário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {availableVolunteers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {selectedForAddition.length} de {availableVolunteers.length} voluntários selecionados
                    </span>
                    <Button
                      onClick={addSelectedVolunteers}
                      disabled={selectedForAddition.length === 0}
                      className="bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Adicionar Selecionados ({selectedForAddition.length})
                    </Button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3">
                    {filteredVolunteers.map((volunteer) => (
                      <div key={volunteer.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          checked={selectedForAddition.includes(volunteer.id)}
                          onCheckedChange={() => toggleVolunteerSelection(volunteer.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{volunteer.name}</div>
                          {volunteer.area_atuacao && (
                            <div className="text-sm text-gray-500">{volunteer.area_atuacao}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botão para criar novo voluntário */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setIsCreating(!isCreating)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {isCreating ? 'Cancelar' : 'Criar Novo Voluntário'}
              </Button>
            </div>

            {/* Formulário de criação de voluntário */}
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

            {/* Lista de voluntários selecionados */}
            {selectedVolunteers.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Voluntários Selecionados para Pagamento</Label>
                <div className="space-y-2">
                  {selectedVolunteers.map((volunteer) => (
                    <div key={volunteer.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">{volunteer.name}</Badge>
                        <div className="flex items-center space-x-2">
                          <MoneyInput
                            value={volunteer.amount}
                            onChange={(value) => updateVolunteerAmount(volunteer.id, value)}
                            className="w-32"
                            placeholder="R$ 0,00"
                          />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeVolunteer(volunteer.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-3 border-t bg-green-50 p-3 rounded-lg">
                  <span className="font-medium text-green-800">
                    Total de Pagamentos ({selectedVolunteers.length} voluntários):
                  </span>
                  <span className="text-xl font-bold text-green-800">
                    R$ {totalVolunteers.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-end pt-3">
                  <Button 
                    onClick={() => onVolunteersChange(selectedVolunteers)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Confirmar Seleção
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
