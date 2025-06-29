
-- Criar tabela para gerenciar pagamentos de voluntários
CREATE TABLE public.volunteer_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cash_session_id UUID NOT NULL REFERENCES public.cash_sessions(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  volunteer_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
  paid_at TIMESTAMP WITH TIME ZONE,
  paid_by UUID REFERENCES auth.users(id),
  transaction_id UUID REFERENCES public.transactions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.volunteer_payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para volunteer_payments
CREATE POLICY "Users can view volunteer payments from their churches" 
  ON public.volunteer_payments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.cash_sessions cs
      JOIN public.profiles p ON p.church_id = cs.church_id
      WHERE cs.id = volunteer_payments.cash_session_id 
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert volunteer payments from their churches" 
  ON public.volunteer_payments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cash_sessions cs
      JOIN public.profiles p ON p.church_id = cs.church_id
      WHERE cs.id = volunteer_payments.cash_session_id 
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can update volunteer payments from their churches" 
  ON public.volunteer_payments 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.cash_sessions cs
      JOIN public.profiles p ON p.church_id = cs.church_id
      WHERE cs.id = volunteer_payments.cash_session_id 
      AND p.id = auth.uid()
    )
  );

-- Índices para melhor performance
CREATE INDEX idx_volunteer_payments_session ON public.volunteer_payments(cash_session_id);
CREATE INDEX idx_volunteer_payments_volunteer ON public.volunteer_payments(volunteer_id);
CREATE INDEX idx_volunteer_payments_status ON public.volunteer_payments(status);
