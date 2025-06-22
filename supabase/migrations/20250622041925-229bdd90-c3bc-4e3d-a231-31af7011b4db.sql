
-- Primeiro, adicionar o novo valor ao enum
ALTER TYPE user_role ADD VALUE 'supervisor';

-- Criar tabela de igrejas
CREATE TABLE public.churches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar referência de igreja ao perfil do usuário
ALTER TABLE public.profiles 
ADD COLUMN church_id UUID REFERENCES public.churches(id) ON DELETE SET NULL;

-- Criar tabela para controle de fluxo de caixa (sessões)
CREATE TABLE public.cash_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  date_session DATE NOT NULL DEFAULT CURRENT_DATE,
  culto_evento TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'validado', 'fechado')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  validated_by_1 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_by_2 UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Atualizar tabela de transações para vincular à sessão de caixa
ALTER TABLE public.transactions 
ADD COLUMN cash_session_id UUID REFERENCES public.cash_sessions(id) ON DELETE CASCADE;

-- Criar tabela específica para entradas PIX (múltiplas linhas)
CREATE TABLE public.pix_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cash_session_id UUID NOT NULL REFERENCES public.cash_sessions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pix_entries ENABLE ROW LEVEL SECURITY;
