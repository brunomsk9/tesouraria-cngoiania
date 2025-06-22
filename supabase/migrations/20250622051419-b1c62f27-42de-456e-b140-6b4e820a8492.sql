
-- Atualizar a tabela cash_sessions para usar apenas uma validação
-- Remover o campo validated_by_2 já que só precisamos de uma validação
ALTER TABLE public.cash_sessions DROP COLUMN IF EXISTS validated_by_2;

-- Renomear validated_by_1 para validated_by para ficar mais claro
ALTER TABLE public.cash_sessions RENAME COLUMN validated_by_1 TO validated_by;

-- Criar uma função para verificar se o usuário pode validar uma sessão
-- (não pode validar sessão que ele mesmo criou)
CREATE OR REPLACE FUNCTION public.can_validate_session(session_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cash_sessions 
    WHERE id = session_id 
    AND created_by != user_id 
    AND status = 'aberto'
    AND validated_by IS NULL
  );
$$;

-- Criar RLS policies para cash_sessions
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;

-- Policy para visualizar sessões da própria igreja
CREATE POLICY "Users can view sessions from their church" 
  ON public.cash_sessions 
  FOR SELECT 
  USING (
    church_id IN (
      SELECT church_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- Policy para criar sessões (apenas tesoureiros)
CREATE POLICY "Tesoureiros can create sessions" 
  ON public.cash_sessions 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('tesoureiro', 'master')
      AND church_id = cash_sessions.church_id
    )
  );

-- Policy para atualizar sessões (validação)
CREATE POLICY "Tesoureiros can validate sessions" 
  ON public.cash_sessions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('tesoureiro', 'master')
      AND church_id = cash_sessions.church_id
    )
  );
