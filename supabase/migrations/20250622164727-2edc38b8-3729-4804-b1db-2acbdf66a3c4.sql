
-- Adicionar campo data_pix na tabela pix_entries
ALTER TABLE public.pix_entries 
ADD COLUMN data_pix DATE NOT NULL DEFAULT CURRENT_DATE;
