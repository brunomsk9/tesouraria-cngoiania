
-- Remover a coluna horario_sessao da tabela cash_sessions
ALTER TABLE public.cash_sessions DROP COLUMN IF EXISTS horario_sessao;
