import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, CheckCircle, AlertCircle, User, Clock, Lock, X, StopCircle } from 'lucide-react';

interface CashSession {
  id: string;
  date_session: string;
  culto_evento: string;
  status: string;
  church_id: string;
  created_by: string;
  validated_by: string | null;
  validated_at: string | null;
}

interface SessionValidationProps {
  session: CashSession;
  onSessionValidated: () => void;
}

interface TransactionSummary {
  total_entradas: number;
  total_saidas: number;
  total_pix: number;
  saldo: number;
  count_transactions: number;
  count_pix: number;
}

export const SessionValidation = ({ session, onSessionValidated }: SessionValidationProps) => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [canValidate, setCanValidate] = useState(false);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [creatorName, setCreatorName] = useState<string>('');
  const [validatorName, setValidatorName] = useState<string>('');
  const [pendingPaymentsInfo, setPendingPaymentsInfo] = useState<{
    hasPendingPayments: boolean;
    totalPending: number;
    details: string[];
  }>({ hasPendingPayments: false, totalPending: 0, details: [] });

  useEffect(() => {
    checkValidationPermission();
    loadTransactionSummary();
    loadCreatorName();
    loadValidatorName();
    checkPendingPayments();
  }, [session.id, profile?.id]);

  const checkValidationPermission = async () => {
    if (!profile?.id || !session.id) return;

    const { data, error } = await supabase.rpc('can_validate_session', {
      session_id: session.id,
      user_id: profile.id
    });

    if (error) {
      console.error('Erro ao verificar permissão:', error);
      return;
    }

    setCanValidate(data);
  };

  const loadTransactionSummary = async () => {
    // Carregar transações tradicionais
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('cash_session_id', session.id);

    if (transError) {
      console.error('Erro ao carregar transações:', transError);
      return;
    }

    // Carregar entradas PIX
    const { data: pixEntries, error: pixError } = await supabase
      .from('pix_entries')
      .select('amount')
      .eq('cash_session_id', session.id);

    if (pixError) {
      console.error('Erro ao carregar PIX:', pixError);
      return;
    }

    const entradas = transactions?.filter(t => t.type === 'entrada').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const saidas = transactions?.filter(t => t.type === 'saida').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    const totalPix = pixEntries?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    
    const totalEntradas = entradas + totalPix;

    setSummary({
      total_entradas: totalEntradas,
      total_saidas: saidas,
      total_pix: totalPix,
      saldo: totalEntradas - saidas,
      count_transactions: transactions?.length || 0,
      count_pix: pixEntries?.length || 0
    });
  };

  const checkPendingPayments = async () => {
    // Carregar transações para verificar dinheiro vs saídas
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('type, amount, category, description')
      .eq('cash_session_id', session.id);

    if (transError) {
      console.error('Erro ao carregar transações para verificação:', transError);
      return;
    }

    const dinheiroEntrada = transactions
      ?.filter(t => t.type === 'entrada' && t.category === 'dinheiro')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const totalSaidas = transactions
      ?.filter(t => t.type === 'saida')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    if (totalSaidas > dinheiroEntrada) {
      const deficit = totalSaidas - dinheiroEntrada;
      const saidasDetails = transactions
        ?.filter(t => t.type === 'saida')
        .map(t => `${t.description}: R$ ${Number(t.amount).toFixed(2)}`) || [];

      setPendingPaymentsInfo({
        hasPendingPayments: true,
        totalPending: deficit,
        details: saidasDetails
      });
    }
  };

  const loadCreatorName = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', session.created_by)
      .single();

    if (error) {
      console.error('Erro ao carregar nome do criador:', error);
      return;
    }

    setCreatorName(data?.name || 'Usuário desconhecido');
  };

  const loadValidatorName = async () => {
    if (!session.validated_by) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', session.validated_by)
      .single();

    if (error) {
      console.error('Erro ao carregar nome do validador:', error);
      return;
    }

    setValidatorName(data?.name || 'Usuário desconhecido');
  };

  const validateSession = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cash_sessions')
        .update({
          status: 'validado',
          validated_by: profile.id,
          validated_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;

      toast.success('Sessão validada com sucesso! Todos os campos foram travados.');
      onSessionValidated();
    } catch (error: any) {
      console.error('Erro ao validar sessão:', error);
      toast.error('Erro ao validar sessão: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const closeSession = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('cash_sessions')
        .update({
          status: 'fechado',
          validated_by: profile.id,
          validated_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;

      toast.success('Sessão encerrada com sucesso! Nenhuma alteração pode ser feita.');
      onSessionValidated();
    } catch (error: any) {
      console.error('Erro ao encerrar sessão:', error);
      toast.error('Erro ao encerrar sessão: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const rejectValidation = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      // Manter o status como 'aberto' para permitir edições
      const { error } = await supabase
        .from('cash_sessions')
        .update({
          status: 'aberto'
        })
        .eq('id', session.id);

      if (error) throw error;

      toast.info('Validação recusada. A sessão voltou para edição.');
      onSessionValidated();
    } catch (error: any) {
      console.error('Erro ao recusar validação:', error);
      toast.error('Erro ao recusar validação: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'validado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fechado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (session.status === 'validado') {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Lock className="h-5 w-5" />
            Sessão Validada - Campos Travados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Alerta de Campos Travados */}
            <Alert className="border-green-200 bg-green-50">
              <Lock className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Sessão Validada</AlertTitle>
              <AlertDescription className="text-green-700">
                Esta sessão foi validada e todos os campos estão travados. Não é possível fazer alterações.
              </AlertDescription>
            </Alert>

            {/* Informações da Validação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Criada por:</span>
                  </div>
                  <p className="text-blue-700">{creatorName}</p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Validada por:</span>
                  </div>
                  <p className="text-green-700">{validatorName}</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">Data da Validação:</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {session.validated_at ? new Date(session.validated_at).toLocaleString('pt-BR') : 'Data não disponível'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Resumo Financeiro Final */}
            {summary && (
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-800 text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Resumo Financeiro Final
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-green-600 font-bold text-xl">
                        R$ {summary.total_entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-gray-600">Total Entradas</div>
                      {summary.total_pix > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          (incluindo R$ {summary.total_pix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em PIX)
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-red-600 font-bold text-xl">
                        R$ {summary.total_saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-gray-600">Total Saídas</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-bold text-xl ${summary.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {summary.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-gray-600">Saldo Final</div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-600 pt-2 border-t">
                    Total de {summary.count_transactions} transações{summary.count_pix > 0 && ` e ${summary.count_pix} PIX`} registradas
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pagamentos Pendentes se existirem */}
            {pendingPaymentsInfo.hasPendingPayments && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800">Pagamentos Pendentes Registrados</AlertTitle>
                <AlertDescription className="text-orange-700">
                  <p className="mb-3">
                    No momento da validação, havia R$ {pendingPaymentsInfo.totalPending.toFixed(2)} em pagamentos pendentes:
                  </p>
                  <div className="bg-white p-3 rounded border max-h-32 overflow-y-auto">
                    {pendingPaymentsInfo.details.map((detail, index) => (
                      <div key={index} className="text-sm py-1">• {detail}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (session.status === 'fechado') {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <StopCircle className="h-5 w-5" />
            Sessão Encerrada
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <Alert className="border-gray-200 bg-gray-50">
              <StopCircle className="h-4 w-4 text-gray-600" />
              <AlertTitle className="text-gray-800">Sessão Encerrada</AlertTitle>
              <AlertDescription className="text-gray-700">
                Esta sessão foi encerrada sem validação. Nenhuma alteração pode ser feita.
              </AlertDescription>
            </Alert>

            {/* Informações da Sessão */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Criada por:</span>
                  </div>
                  <p className="text-blue-700">{creatorName}</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <StopCircle className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">Encerrada por:</span>
                  </div>
                  <p className="text-gray-700">{validatorName}</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">Data do Encerramento:</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {session.validated_at ? new Date(session.validated_at).toLocaleString('pt-BR') : 'Data não disponível'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Resumo Financeiro */}
            {summary && (
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-800 text-lg flex items-center gap-2">
                    <StopCircle className="h-5 w-5" />
                    Resumo Financeiro no Encerramento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-green-600 font-bold text-xl">
                        R$ {summary.total_entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-gray-600">Total Entradas</div>
                      {summary.total_pix > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          (incluindo R$ {summary.total_pix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em PIX)
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-red-600 font-bold text-xl">
                        R$ {summary.total_saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-gray-600">Total Saídas</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-bold text-xl ${summary.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {summary.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-gray-600">Saldo Final</div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-600 pt-2 border-t">
                    Total de {summary.count_transactions} transações{summary.count_pix > 0 && ` e ${summary.count_pix} PIX`} registradas
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-yellow-50 border-b">
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Shield className="h-5 w-5" />
          Validação da Sessão
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Informações da Sessão */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Criada por:</span>
              </div>
              <p className="text-blue-700">{creatorName}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Status:</span>
              </div>
              <Badge className={getStatusColor(session.status)}>
                {session.status.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Financeiro */}
        {summary && (
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-purple-800 text-lg">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-green-600 font-bold text-xl">
                    R$ {summary.total_entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-gray-600">Total Entradas</div>
                  {summary.total_pix > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      (incluindo R$ {summary.total_pix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em PIX)
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-red-600 font-bold text-xl">
                    R$ {summary.total_saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-gray-600">Total Saídas</div>
                </div>
                <div className="text-center">
                  <div className={`font-bold text-xl ${summary.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {summary.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-gray-600">Saldo Final</div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600 pt-2 border-t">
                Total de {summary.count_transactions} transações{summary.count_pix > 0 && ` e ${summary.count_pix} PIX`} registradas
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerta de Pagamentos Pendentes */}
        {pendingPaymentsInfo.hasPendingPayments && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-800">Atenção: Pagamentos Pendentes Detectados</AlertTitle>
            <AlertDescription className="text-orange-700">
              <p className="mb-3">
                As saídas excedem o dinheiro disponível em R$ {pendingPaymentsInfo.totalPending.toFixed(2)}. 
                Alguns pagamentos podem estar pendentes:
              </p>
              <div className="bg-white p-3 rounded border max-h-32 overflow-y-auto">
                {pendingPaymentsInfo.details.map((detail, index) => (
                  <div key={index} className="text-sm py-1">• {detail}</div>
                ))}
              </div>
              <p className="mt-3 text-sm font-medium">
                Esta situação não impede a validação da sessão, mas deve ser resolvida posteriormente.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Ações de Validação */}
        <div className="text-center space-y-4">
          {!canValidate ? (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-3" />
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                Não é possível validar esta sessão
              </h3>
              <p className="text-orange-700 text-sm">
                {session.created_by === profile?.id 
                  ? "Você não pode validar uma sessão criada por você mesmo."
                  : "Esta sessão não está disponível para validação."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <Shield className="h-12 w-12 mx-auto text-green-500 mb-3" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Pronto para Validação
                </h3>
                <p className="text-green-700 text-sm mb-4">
                  Escolha uma das opções abaixo para processar esta sessão:
                  {pendingPaymentsInfo.hasPendingPayments && (
                    <span className="block mt-2 font-medium">
                      Nota: Existem pagamentos pendentes que devem ser resolvidos posteriormente.
                    </span>
                  )}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={validateSession}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Validando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Validar Sessão
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={closeSession}
                    disabled={loading}
                    variant="outline"
                    className="border-gray-400 text-gray-700 hover:bg-gray-100"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                        Encerrando...
                      </>
                    ) : (
                      <>
                        <StopCircle className="h-4 w-4 mr-2" />
                        Encerrar Sessão
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={rejectValidation}
                    disabled={loading}
                    variant="outline"
                    className="border-red-400 text-red-700 hover:bg-red-50"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400 mr-2"></div>
                        Recusando...
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Recusar Validação
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4 text-xs text-gray-600 space-y-1">
                  <p><strong>Validar:</strong> Confirma os dados e trava todos os campos</p>
                  <p><strong>Encerrar:</strong> Finaliza a sessão sem validação (sem alterações)</p>
                  <p><strong>Recusar:</strong> Retorna a sessão para edição</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
