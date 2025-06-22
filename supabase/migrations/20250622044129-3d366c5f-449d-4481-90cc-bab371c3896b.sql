
-- Remover TODAS as políticas existentes para começar do zero
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Masters can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Masters can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Masters can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Masters can manage all churches" ON public.churches;
DROP POLICY IF EXISTS "Users can view own church" ON public.churches;
DROP POLICY IF EXISTS "Supervisors can view all churches" ON public.churches;

-- Criar função para verificar se usuário é master
CREATE OR REPLACE FUNCTION public.is_master(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'master'
  );
$$;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Masters can manage all profiles" ON public.profiles
  FOR ALL USING (public.is_master(auth.uid()));

-- Políticas para churches
CREATE POLICY "Masters can manage all churches" ON public.churches
  FOR ALL USING (public.is_master(auth.uid()));

CREATE POLICY "Users can view own church" ON public.churches
  FOR SELECT USING (
    id IN (SELECT church_id FROM public.profiles WHERE id = auth.uid())
  );
