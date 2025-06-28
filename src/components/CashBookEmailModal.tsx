
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Mail, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
      // Gerar conteúdo do e-mail com resumo em HTML
      const htmlContent = generateHtmlEmailContent();
      
      // Fazer chamada para a Edge Function
      const { data, error } = await supabase.functions.invoke('send-cashbook-email', {
        body: {
          to: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
          htmlContent: htmlContent
        }
      });

      if (error) {
        console.error('Erro na Edge Function:', error);
        throw new Error(error.message || 'Erro ao enviar e-mail');
      }

      toast.success('E-mail enviado com sucesso!');
      onClose();
      
      // Reset form
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      toast.error(`Erro ao enviar e-mail: ${error.message || 'Tente novamente.'}`);
    } finally {
      setSending(false);
    }
  };

  const generateHtmlEmailContent = () => {
    const totalEntries = entries.length;
    const finalBalance = entries.length > 0 ? entries[entries.length - 1].balance : 0;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center; margin-bottom: 30px;">Relatório Livro Caixa</h2>
        
        ${message ? `
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 30px; border-left: 4px solid #007bff;">
            <h3 style="margin-top: 0; color: #666;">Mensagem:</h3>
            <p style="margin-bottom: 0; line-height: 1.5;">${message.replace(/\n/g, '<br>')}</p>
          </div>
        ` : ''}
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
          <div style="text-align: center; padding: 20px; border-radius: 8px; background-color: #e3f2fd; border: 2px solid #2196f3;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #1976d2; font-weight: bold;">Dinheiro Líquido</h4>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1976d2;">R$ ${summary.dinheiroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          
          <div style="text-align: center; padding: 20px; border-radius: 8px; background-color: #f3e5f5; border: 2px solid #9c27b0;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #7b1fa2; font-weight: bold;">Soma PIX</h4>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #7b1fa2;">R$ ${summary.somaPix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          
          <div style="text-align: center; padding: 20px; border-radius: 8px; background-color: #e8f5e8; border: 2px solid #4caf50;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #388e3c; font-weight: bold;">Soma Crédito</h4>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #388e3c;">R$ ${summary.somaCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          
          <div style="text-align: center; padding: 20px; border-radius: 8px; background-color: #fff3e0; border: 2px solid #ff9800;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #f57c00; font-weight: bold;">Soma Débito</h4>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #f57c00;">R$ ${summary.somaDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          
          <div style="text-align: center; padding: 20px; border-radius: 8px; background-color: #ffebee; border: 2px solid #f44336;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #d32f2f; font-weight: bold;">Soma Saída</h4>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #d32f2f;">R$ ${summary.somaSaida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Saldo Final</h3>
          <p style="margin: 0; font-size: 32px; font-weight: bold; color: ${finalBalance >= 0 ? '#28a745' : '#dc3545'};">
            R$ ${finalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        
        <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
          <h3 style="margin-top: 0; color: #333;">Resumo das Transações</h3>
          <p style="color: #666; margin-bottom: 20px;">Total de ${totalEntries} transações processadas</p>
          
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Data</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Descrição</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Tipo</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Valor</th>
                  <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Saldo</th>
                </tr>
              </thead>
              <tbody>
                ${entries.slice(0, 10).map(entry => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${new Date(entry.date).toLocaleDateString('pt-BR')}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${entry.description}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">
                      <span style="color: ${entry.type === 'entrada' ? '#28a745' : '#dc3545'};">
                        ${entry.type === 'entrada' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: ${entry.type === 'entrada' ? '#28a745' : '#dc3545'};">
                      ${entry.type === 'entrada' ? '+' : '-'}R$ ${entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">
                      R$ ${entry.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                `).join('')}
                ${entries.length > 10 ? `
                  <tr>
                    <td colspan="5" style="padding: 8px; border: 1px solid #ddd; text-align: center; color: #666; font-style: italic;">
                      ... e mais ${entries.length - 10} transações
                    </td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; text-align: center;">
          <p>Este e-mail foi enviado automaticamente pelo sistema de Livro Caixa</p>
          <p>Tesouraria CN Goiânia</p>
          <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
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
            <p className="font-medium text-gray-700 mb-2">Preview do resumo:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-100 p-2 rounded text-center">
                <p className="font-medium text-blue-800">Dinheiro Líquido</p>
                <p className="text-blue-600">R$ {summary.dinheiroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-purple-100 p-2 rounded text-center">
                <p className="font-medium text-purple-800">Soma PIX</p>
                <p className="text-purple-600">R$ {summary.somaPix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-green-100 p-2 rounded text-center">
                <p className="font-medium text-green-800">Soma Crédito</p>
                <p className="text-green-600">R$ {summary.somaCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-orange-100 p-2 rounded text-center">
                <p className="font-medium text-orange-800">Soma Débito</p>
                <p className="text-orange-600">R$ {summary.somaDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-red-100 p-2 rounded text-center col-span-2">
                <p className="font-medium text-red-800">Soma Saída</p>
                <p className="text-red-600">R$ {summary.somaSaida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <div className="mt-3 p-2 bg-gray-200 rounded text-center">
              <p className="font-bold text-gray-800">Saldo Final: R$ {(entries.length > 0 ? entries[entries.length - 1].balance : 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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
