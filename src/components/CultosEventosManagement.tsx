
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  loadCultosEventos, 
  createCultoEvento, 
  updateCultoEvento, 
  deleteCultoEvento,
  type CultoEvento 
} from '@/services/cultosEventosService';
import { Calendar, Plus, Edit, Trash2, Save, X } from 'lucide-react';

export const CultosEventosManagement = () => {
  const { profile } = useAuth();
  const [cultosEventos, setCultosEventos] = useState<CultoEvento[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCulto, setNewCulto] = useState({
    nome: '',
    descricao: ''
  });
  const [editData, setEditData] = useState({
    nome: '',
    descricao: ''
  });

  useEffect(() => {
    if (profile?.church_id) {
      loadData();
    }
  }, [profile]);

  const loadData = async () => {
    if (!profile?.church_id) return;
    setLoading(true);
    const data = await loadCultosEventos(profile.church_id);
    setCultosEventos(data);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!profile?.church_id) return;
    
    const result = await createCultoEvento(
      profile.church_id,
      newCulto.nome,
      newCulto.descricao
    );
    
    if (result) {
      setNewCulto({ nome: '', descricao: '' });
      loadData();
    }
  };

  const handleEdit = (culto: CultoEvento) => {
    setEditingId(culto.id);
    setEditData({
      nome: culto.nome,
      descricao: culto.descricao || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    const success = await updateCultoEvento(
      editingId,
      editData.nome,
      editData.descricao
    );
    
    if (success) {
      setEditingId(null);
      setEditData({ nome: '', descricao: '' });
      loadData();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ nome: '', descricao: '' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja desativar este culto/evento?')) {
      const success = await deleteCultoEvento(id);
      if (success) {
        loadData();
      }
    }
  };

  if (profile?.role === 'supervisor') {
    return (
      <div className="p-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Acesso Supervisor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              Como supervisor, você não pode gerenciar cultos/eventos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Gestão de Cultos e Eventos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Formulário de criação */}
          <Card className="bg-purple-50 border-purple-200 mb-6">
            <CardHeader>
              <CardTitle className="text-purple-800 text-lg">Novo Culto/Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={newCulto.nome}
                    onChange={(e) => setNewCulto({...newCulto, nome: e.target.value})}
                    placeholder="Ex: Culto Domingo Manhã"
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={newCulto.descricao}
                    onChange={(e) => setNewCulto({...newCulto, descricao: e.target.value})}
                    placeholder="Descrição opcional"
                    rows={3}
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreate}
                disabled={!newCulto.nome.trim() || loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Culto/Evento
              </Button>
            </CardContent>
          </Card>

          {/* Lista de cultos/eventos */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando...</p>
            </div>
          ) : cultosEventos.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum culto/evento cadastrado
              </h3>
              <p className="text-gray-500">
                Crie o primeiro culto ou evento para começar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cultosEventos.map((culto) => (
                <Card key={culto.id} className="border-gray-200">
                  <CardContent className="p-4">
                    {editingId === culto.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Nome</Label>
                            <Input
                              value={editData.nome}
                              onChange={(e) => setEditData({...editData, nome: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label>Descrição</Label>
                            <Textarea
                              value={editData.descricao}
                              onChange={(e) => setEditData({...editData, descricao: e.target.value})}
                              rows={3}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveEdit}
                            disabled={!editData.nome.trim()}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Salvar
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {culto.nome}
                            </h3>
                            <Badge className="bg-green-100 text-green-800">
                              Ativo
                            </Badge>
                          </div>
                          {culto.descricao && (
                            <p className="text-gray-600 mb-2">{culto.descricao}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            Criado em: {new Date(culto.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(culto)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(culto.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
