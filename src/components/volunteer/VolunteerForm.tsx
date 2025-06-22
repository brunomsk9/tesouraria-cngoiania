
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface Church {
  id: string;
  name: string;
}

interface Volunteer {
  id: string;
  name: string;
  phone: string | null;
  pix_key: string | null;
  area_atuacao: string | null;
  churches: { id: string; name: string }[];
}

interface VolunteerFormProps {
  volunteer?: Volunteer | null;
  churches: Church[];
  onSubmit: (data: {
    name: string;
    phone: string;
    pix_key: string;
    area_atuacao: string;
    church_ids: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

export const VolunteerForm = ({ volunteer, churches, onSubmit, onCancel }: VolunteerFormProps) => {
  const [formData, setFormData] = useState({
    name: volunteer?.name || '',
    phone: volunteer?.phone || '',
    pix_key: volunteer?.pix_key || '',
    area_atuacao: volunteer?.area_atuacao || '',
    church_ids: volunteer?.churches.map(c => c.id) || []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.name.trim()) {
      newErrors.push('Nome é obrigatório');
    }
    
    if (formData.church_ids.length === 0) {
      newErrors.push('Selecione pelo menos uma igreja');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors([]);
    
    try {
      await onSubmit({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        pix_key: formData.pix_key.trim(),
        area_atuacao: formData.area_atuacao.trim(),
        church_ids: formData.church_ids
      });
    } catch (error) {
      console.error('Erro no formulário:', error);
      setErrors(['Erro ao salvar voluntário. Tente novamente.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChurchToggle = (churchId: string) => {
    setFormData(prev => ({
      ...prev,
      church_ids: prev.church_ids.includes(churchId)
        ? prev.church_ids.filter(id => id !== churchId)
        : [...prev.church_ids, churchId]
    }));
    
    // Limpar erros quando o usuário fizer alterações
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            {volunteer ? 'Editar Voluntário' : 'Novo Voluntário'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <ul className="list-disc list-inside text-sm text-red-600">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({...formData, name: e.target.value});
                  if (errors.length > 0) setErrors([]);
                }}
                placeholder="Nome completo"
                required
                className={!formData.name.trim() && errors.length > 0 ? 'border-red-500' : ''}
              />
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
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-gray-900 hover:bg-gray-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : (volunteer ? 'Atualizar' : 'Criar')} Voluntário
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
