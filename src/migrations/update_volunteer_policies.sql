
-- Remover políticas antigas
DROP POLICY IF EXISTS "Masters can create volunteers" ON public.volunteers;
DROP POLICY IF EXISTS "Masters can update volunteers from their churches" ON public.volunteers;
DROP POLICY IF EXISTS "Masters can delete volunteers from their churches" ON public.volunteers;
DROP POLICY IF EXISTS "Masters can manage volunteer-church relationships" ON public.volunteer_churches;

-- Permitir que masters e tesoureiros criem voluntários
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

-- Permitir que masters e tesoureiros atualizem voluntários de suas igrejas
CREATE POLICY "Masters and treasurers can update volunteers from their churches" 
  ON public.volunteers 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.volunteer_churches vc
      JOIN public.profiles p ON p.church_id = vc.church_id
      WHERE vc.volunteer_id = volunteers.id 
      AND p.id = auth.uid()
      AND p.role IN ('master', 'tesoureiro')
    )
  );

-- Permitir que masters deletem voluntários de suas igrejas
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

-- Permitir que masters e tesoureiros gerenciem relacionamentos voluntário-igreja
CREATE POLICY "Masters and treasurers can manage volunteer-church relationships" 
  ON public.volunteer_churches 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('master', 'tesoureiro')
      AND church_id = volunteer_churches.church_id
    )
  );
