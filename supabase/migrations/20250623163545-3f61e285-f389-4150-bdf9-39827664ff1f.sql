
-- Adicionar campos de data e horário para cultos/eventos
ALTER TABLE public.cultos_eventos 
ADD COLUMN data_evento DATE,
ADD COLUMN horario_evento TIME;

-- Adicionar comentários para documentar os novos campos
COMMENT ON COLUMN public.cultos_eventos.data_evento IS 'Data específica do culto/evento (opcional, para eventos únicos)';
COMMENT ON COLUMN public.cultos_eventos.horario_evento IS 'Horário do culto/evento';
