
-- Criar tabela de voluntários
CREATE TABLE public.volunteers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  pix_key TEXT,
  area_atuacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de relacionamento entre voluntários e igrejas (muitos para muitos)
CREATE TABLE public.volunteer_churches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(volunteer_id, church_id)
);

-- Habilitar RLS para voluntários
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_churches ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para voluntários - usuários só podem ver voluntários de suas igrejas
CREATE POLICY "Users can view volunteers from their churches" 
  ON public.volunteers 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.volunteer_churches vc
      JOIN public.profiles p ON p.church_id = vc.church_id
      WHERE vc.volunteer_id = volunteers.id 
      AND p.id = auth.uid()
    )
  );

-- Masters podem criar voluntários
CREATE POLICY "Masters can create volunteers" 
  ON public.volunteers 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'master'
    )
  );

-- Masters podem atualizar voluntários de suas igrejas
CREATE POLICY "Masters can update volunteers from their churches" 
  ON public.volunteers 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.volunteer_churches vc
      JOIN public.profiles p ON p.church_id = vc.church_id
      WHERE vc.volunteer_id = volunteers.id 
      AND p.id = auth.uid()
      AND p.role = 'master'
    )
  );

-- Masters podem deletar voluntários de suas igrejas
CREATE POLICY "Masters can delete volunteers from their churches" 
  ON public.volunteers 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.volunteer_churches vc
      JOIN public.profiles p ON p.church_id = vc.church_id
      WHERE vc.volunteer_id = volunteers.id 
      AND p.id = auth.uid()
      AND p.role = 'master'
    )
  );

-- Políticas para volunteer_churches
CREATE POLICY "Users can view volunteer-church relationships" 
  ON public.volunteer_churches 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND church_id = volunteer_churches.church_id
    )
  );

CREATE POLICY "Masters can manage volunteer-church relationships" 
  ON public.volunteer_churches 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'master'
      AND church_id = volunteer_churches.church_id
    )
  );

-- Função para contar sessões pendentes de validação por igreja
CREATE OR REPLACE FUNCTION public.get_pending_validations_count(user_church_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COUNT(*)::integer
  FROM public.cash_sessions 
  WHERE church_id = user_church_id
  AND status = 'aberto'
  AND validated_by IS NULL
  AND created_by != auth.uid();
$$;
