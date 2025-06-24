
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Mail, Send } from 'lucide-react';

interface CashBookEntry {
  date: string;
  description: string;
  type: 'entrada' | 'saida';
  amount: number;
  balance: number;
  session: string;
  category?: string;
}

interface CashBookSummary {
  dinheiroLiquido: number;
  somaPix: number;
  somaCredito: number;
  somaDebito: number;
  somaSaida: number;
}

interface CashBookEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: CashBookEntry[];
  summary: CashBookSummary;
  initialBalance: number;
}

export const CashBookEmailModal = ({
  isOpen,
  onClose,
  entries,
  summary,
  initialBalance
}: CashBookEmailModalProps) => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Relatório Livro Caixa');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendEmail = async () => {
    if (!email.trim()) {
      toast.error('Por favor, digite um e-mail válido');
      return;
    }

    setSending(true);
    
    try {
      // Gerar conteúdo do e-mail com resumo
      const emailContent = generateEmailContent();
      
      // Aqui você implementaria a chamada para sua API de e-mail
      // Por exemplo, usando Supabase Edge Functions com Resend
      
      // Simulação do envio (remova esta parte quando implementar a API real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('E-mail enviado com sucesso!');
      onClose();
      
      // Reset form
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      toast.error('Erro ao enviar e-mail. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  const generateEmailContent = () => {
    const totalEntries = entries.length;
    const finalBalance = entries.length > 0 ? entries[entries.length - 1].balance : 0;
    
    return `
      ${message}
      
      === RESUMO DO LIVRO CAIXA ===
      
      Total de Transações: ${totalEntries}
      
      RESUMO FINANCEIRO:
      • Dinheiro Líquido: R$ ${summary.dinheiroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      • Soma PIX: R$ ${summary.somaPix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      • Soma Crédito: R$ ${summary.somaCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      • Soma Débito: R$ ${summary.somaDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      • Soma Saída: R$ ${summary.somaSaida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      
      SALDO FINAL: R$ ${finalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      
      === DETALHAMENTO DAS TRANSAÇÕES ===
      ${entries.map((entry, index) => 
        `${index + 1}. ${entry.date} - ${entry.description} (${entry.session}) - ${entry.type === 'entrada' ? '+' : '-'}R$ ${entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ).join('\n')}
    `;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Enviar Relatório por E-mail
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail do destinatário</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="subject">Assunto</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea
              id="message"
              placeholder="Digite uma mensagem adicional..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1 min-h-[80px]"
            />
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p className="font-medium text-gray-700 mb-2">Resumo a ser enviado:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>• Dinheiro Líquido: R$ {summary.dinheiroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p>• Soma PIX: R$ {summary.somaPix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p>• Soma Crédito: R$ {summary.somaCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p>• Soma Débito: R$ {summary.somaDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p>• Soma Saída: R$ {summary.somaSaida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p className="font-medium">• Total de {entries.length} transações</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={sending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendEmail}
              className="flex-1"
              disabled={sending || !email.trim()}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
