
-- Desabilitar RLS temporariamente para corrigir as políticas
ALTER TABLE public.volunteers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_churches DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view volunteers from their churches" ON public.volunteers;
DROP POLICY IF EXISTS "Masters and treasurers can create volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Masters and treasurers can update volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Masters and treasurers can delete volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Users can view volunteer-church relationships" ON public.volunteer_churches;
DROP POLICY IF EXISTS "Masters and treasurers can manage volunteer-church relationships" ON public.volunteer_churches;

-- Reabilitar RLS
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_churches ENABLE ROW LEVEL SECURITY;

-- Criar políticas mais simples e funcionais para volunteers
CREATE POLICY "Allow masters and treasurers to create volunteers" 
  ON public.volunteers 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('master', 'tesoureiro')
    )
  );

CREATE POLICY "Allow users to view volunteers" 
  ON public.volunteers 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow masters and treasurers to update volunteers" 
  ON public.volunteers 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('master', 'tesoureiro')
    )
  );

CREATE POLICY "Allow masters and treasurers to delete volunteers" 
  ON public.volunteers 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('master', 'tesoureiro')
    )
  );

-- Criar políticas para volunteer_churches
CREATE POLICY "Allow users to view volunteer-church relationships" 
  ON public.volunteer_churches 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow masters and treasurers to manage volunteer-church relationships" 
  ON public.volunteer_churches 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('master', 'tesoureiro')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('master', 'tesoureiro')
    )
  );
