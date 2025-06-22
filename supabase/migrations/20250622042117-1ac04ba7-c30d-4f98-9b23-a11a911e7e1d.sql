
-- Criar função para verificar se usuário é supervisor
CREATE OR REPLACE FUNCTION public.is_supervisor(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'supervisor'
  );
$$;

-- Políticas RLS para churches
CREATE POLICY "Users can view own church" ON public.churches
  FOR SELECT USING (
    id IN (SELECT church_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Supervisors can view all churches" ON public.churches
  FOR SELECT USING (public.is_supervisor(auth.uid()));

-- Políticas RLS para cash_sessions
CREATE POLICY "Users can view own church sessions" ON public.cash_sessions
  FOR SELECT USING (
    church_id IN (SELECT church_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert sessions for own church" ON public.cash_sessions
  FOR INSERT WITH CHECK (
    church_id IN (SELECT church_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can update sessions for own church" ON public.cash_sessions
  FOR UPDATE USING (
    church_id IN (SELECT church_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Supervisors can view all sessions" ON public.cash_sessions
  FOR SELECT USING (public.is_supervisor(auth.uid()));

-- Políticas RLS para pix_entries
CREATE POLICY "Users can manage pix entries for own church sessions" ON public.pix_entries
  FOR ALL USING (
    cash_session_id IN (
      SELECT cs.id FROM public.cash_sessions cs
      JOIN public.profiles p ON p.church_id = cs.church_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Supervisors can view all pix entries" ON public.pix_entries
  FOR SELECT USING (public.is_supervisor(auth.uid()));

-- Atualizar políticas de transactions para considerar supervisores
CREATE POLICY "Supervisors can view all transactions" ON public.transactions
  FOR SELECT USING (public.is_supervisor(auth.uid()));

-- Atualizar políticas de profiles para supervisores
CREATE POLICY "Supervisors can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_supervisor(auth.uid()));
