
-- Criar tabela de cultos/eventos
CREATE TABLE public.cultos_eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.cultos_eventos ENABLE ROW LEVEL SECURITY;

-- Policy para visualizar cultos/eventos da própria igreja
CREATE POLICY "Users can view cultos_eventos from their church" 
  ON public.cultos_eventos 
  FOR SELECT 
  USING (
    church_id IN (
      SELECT church_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy para criar cultos/eventos (apenas tesoureiros e masters)
CREATE POLICY "Tesoureiros can create cultos_eventos" 
  ON public.cultos_eventos 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('tesoureiro', 'master')
      AND church_id = cultos_eventos.church_id
    )
  );

-- Policy para atualizar cultos/eventos (apenas tesoureiros e masters)
CREATE POLICY "Tesoureiros can update cultos_eventos" 
  ON public.cultos_eventos 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('tesoureiro', 'master')
      AND church_id = cultos_eventos.church_id
    )
  );

-- Policy para deletar cultos/eventos (apenas tesoureiros e masters)
CREATE POLICY "Tesoureiros can delete cultos_eventos" 
  ON public.cultos_eventos 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('tesoureiro', 'master')
      AND church_id = cultos_eventos.church_id
    )
  );
