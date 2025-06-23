
-- Remover os campos de data e horário da tabela cultos_eventos
ALTER TABLE public.cultos_eventos 
DROP COLUMN data_evento,
DROP COLUMN horario_evento;
