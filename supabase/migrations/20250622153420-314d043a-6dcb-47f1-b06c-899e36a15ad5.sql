
-- Corrigir políticas RLS para voluntários
-- Primeiro, vamos dropar as políticas existentes
DROP POLICY IF EXISTS "Users can view volunteers from their churches" ON public.volunteers;
DROP POLICY IF EXISTS "Masters and treasurers can create volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Masters and treasurers can update volunteers from their churches" ON public.volunteers;
DROP POLICY IF EXISTS "Masters and treasurers can delete volunteers from their churches" ON public.volunteers;
DROP POLICY IF EXISTS "Users can view volunteer-church relationships" ON public.volunteer_churches;
DROP POLICY IF EXISTS "Masters and treasurers can manage volunteer-church relationships" ON public.volunteer_churches;

-- Política para visualizar voluntários
CREATE POLICY "Users can view volunteers from their churches" 
  ON public.volunteers 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.volunteer_churches vc
      JOIN public.profiles p ON (p.church_id = vc.church_id OR p.role = 'master')
      WHERE vc.volunteer_id = volunteers.id 
      AND p.id = auth.uid()
    )
  );

-- Política para criar voluntários - Masters e Tesoureiros podem criar
CREATE POLICY "Masters and treasurers can create volunteers" 
  ON public.volunteers 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('master', 'tesoureiro')
    )
  );

-- Política para atualizar voluntários
CREATE POLICY "Masters and treasurers can update volunteers" 
  ON public.volunteers 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('master', 'tesoureiro')
      AND (
        p.role = 'master' 
        OR EXISTS (
          SELECT 1 FROM public.volunteer_churches vc 
          WHERE vc.volunteer_id = volunteers.id 
          AND vc.church_id = p.church_id
        )
      )
    )
  );

-- Política para deletar voluntários
CREATE POLICY "Masters and treasurers can delete volunteers" 
  ON public.volunteers 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('master', 'tesoureiro')
      AND (
        p.role = 'master' 
        OR EXISTS (
          SELECT 1 FROM public.volunteer_churches vc 
          WHERE vc.volunteer_id = volunteers.id 
          AND vc.church_id = p.church_id
        )
      )
    )
  );

-- Políticas para volunteer_churches
CREATE POLICY "Users can view volunteer-church relationships" 
  ON public.volunteer_churches 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND (p.church_id = volunteer_churches.church_id OR p.role = 'master')
    )
  );

CREATE POLICY "Masters and treasurers can manage volunteer-church relationships" 
  ON public.volunteer_churches 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('master', 'tesoureiro')
      AND (p.church_id = volunteer_churches.church_id OR p.role = 'master')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('master', 'tesoureiro')
      AND (p.church_id = volunteer_churches.church_id OR p.role = 'master')
    )
  );
