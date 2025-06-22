
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Image, X } from 'lucide-react';

interface ChurchLogoManagerProps {
  churchId: string;
  churchName: string;
  onLogoUpdate?: (logoUrl: string | null) => void;
}

export const ChurchLogoManager = ({ churchId, churchName, onLogoUpdate }: ChurchLogoManagerProps) => {
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validar tamanho (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 2MB');
      return;
    }

    setUploading(true);
    
    try {
      // Criar um nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${churchId}-logo.${fileExt}`;

      // Upload do arquivo (simulado - em produção usaria Supabase Storage)
      // Por enquanto, vamos converter para base64 e salvar no localStorage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        localStorage.setItem(`church-logo-${churchId}`, base64);
        setLogoUrl(base64);
        if (onLogoUpdate) onLogoUpdate(base64);
        toast.success('Logo carregada com sucesso!');
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da logo');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    localStorage.removeItem(`church-logo-${churchId}`);
    setLogoUrl(null);
    if (onLogoUpdate) onLogoUpdate(null);
    toast.success('Logo removida');
  };

  // Carregar logo existente ao montar o componente
  useState(() => {
    const savedLogo = localStorage.getItem(`church-logo-${churchId}`);
    if (savedLogo) {
      setLogoUrl(savedLogo);
      if (onLogoUpdate) onLogoUpdate(savedLogo);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Image className="h-5 w-5 mr-2" />
          Logo da Igreja - {churchName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {logoUrl ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={logoUrl} 
                alt="Logo da Igreja" 
                className="max-w-32 max-h-32 object-contain border rounded"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={removeLogo}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Remover Logo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Nenhuma logo carregada</p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="max-w-xs mx-auto"
              />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Formatos aceitos: JPG, PNG, GIF (máximo 2MB)
            </p>
          </div>
        )}
        
        {uploading && (
          <p className="text-center text-blue-600">Carregando logo...</p>
        )}
      </CardContent>
    </Card>
  );
};
