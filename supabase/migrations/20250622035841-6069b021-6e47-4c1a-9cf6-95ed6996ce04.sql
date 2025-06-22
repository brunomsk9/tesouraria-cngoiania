
-- Criar enum para os tipos de usuário
CREATE TYPE user_role AS ENUM ('master', 'tesoureiro');

-- Criar enum para as categorias de entrada
CREATE TYPE categoria_entrada AS ENUM ('dinheiro', 'pix', 'cartao_credito', 'cartao_debito');

-- Criar enum para os tipos de transação
CREATE TYPE tipo_transacao AS ENUM ('entrada', 'saida');

-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'tesoureiro',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Criar função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'name', 'Usuário'), 'tesoureiro');
  RETURN new;
END;
$$;

-- Criar trigger para executar a função quando um usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar tabela de transações
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type tipo_transacao NOT NULL,
  category categoria_entrada NULL, -- Para entradas
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date_transaction DATE NOT NULL DEFAULT CURRENT_DATE,
  culto_evento TEXT,
  observacao TEXT,
  valor_moeda_estrangeira DECIMAL(10,2),
  moeda_estrangeira TEXT,
  voluntarios INTEGER,
  valor_seguranca DECIMAL(10,2),
  outros_gastos DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

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

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Masters can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_master(auth.uid()));

-- Políticas RLS para transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Masters can view all transactions" ON public.transactions
  FOR SELECT USING (public.is_master(auth.uid()));

CREATE POLICY "Masters can update all transactions" ON public.transactions
  FOR UPDATE USING (public.is_master(auth.uid()));

CREATE POLICY "Masters can delete all transactions" ON public.transactions
  FOR DELETE USING (public.is_master(auth.uid()));
