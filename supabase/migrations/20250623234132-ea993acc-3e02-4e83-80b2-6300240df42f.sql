
-- Adicionar campo data_pix à tabela pix_entries se não existir
ALTER TABLE public.pix_entries 
ADD COLUMN IF NOT EXISTS data_pix DATE DEFAULT CURRENT_DATE;
