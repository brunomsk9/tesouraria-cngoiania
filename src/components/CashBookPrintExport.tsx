
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

interface Church {
  id: string;
  name: string;
}

interface CashBookPrintExportProps {
  entries: CashBookEntry[];
  initialBalance: number;
  startDate: string;
  endDate: string;
  selectedChurch: string;
  churches: Church[];
}

export const useCashBookPrintExport = ({
  entries,
  initialBalance,
  startDate,
  endDate,
  selectedChurch,
  churches
}: CashBookPrintExportProps) => {
  
  const getSessionDetails = async (churchId: string, startDate: string, endDate: string) => {
    try {
      const { data: sessions, error } = await supabase
        .from('cash_sessions')
        .select(`
          culto_evento,
          date_session,
          created_by,
          validated_by,
          profiles!cash_sessions_created_by_fkey(name),
          profiles!cash_sessions_validated_by_fkey(name)
        `)
        .eq('church_id', churchId)
        .gte('date_session', startDate)
        .lte('date_session', endDate)
        .order('date_session', { ascending: true });

      if (error) throw error;
      return sessions || [];
    } catch (error) {
      console.error('Erro ao buscar detalhes das sessões:', error);
      return [];
    }
  };

  const exportToPrint = async () => {
    const churchName = churches.find(c => c.id === selectedChurch)?.name || 'Igreja';
    const logoUrl = localStorage.getItem(`church-logo-${selectedChurch}`);
    
    // Buscar detalhes das sessões
    const sessions = await getSessionDetails(selectedChurch, startDate, endDate);
    
    // Agrupar informações dos tesoureiros
    const treasurers = {
      creators: [...new Set(sessions.map(s => s.profiles?.name).filter(Boolean))],
      validators: [...new Set(sessions.map(s => s.profiles?.name).filter(Boolean))]
    };
    
    // Obter informações do primeiro culto/evento
    const firstSession = sessions[0];
    const serviceName = firstSession?.culto_evento || 'Não especificado';
    const serviceDate = firstSession?.date_session || startDate;
    
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Livro Caixa - ${churchName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { 
              display: flex; 
              align-items: flex-start; 
              justify-content: space-between; 
              margin-bottom: 30px; 
              min-height: 80px;
            }
            .logo { 
              max-width: 80px; 
              max-height: 80px; 
              object-fit: contain; 
            }
            .title-section { 
              flex: 1; 
              text-align: center; 
              padding: 0 20px;
            }
            .service-info {
              background-color: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
              border-left: 4px solid #007bff;
            }
            .treasurers-info {
              background-color: #e8f5e8;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
              border-left: 4px solid #28a745;
            }
            .period { text-align: center; margin-bottom: 20px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .amount { text-align: right; }
            .entrada { color: #059669; }
            .saida { color: #dc2626; }
            .balance { font-weight: bold; }
            .summary { margin-top: 20px; padding: 15px; background-color: #f9f9f9; }
            .footer-info { 
              margin-top: 30px; 
              padding-top: 20px;
              border-top: 1px solid #ddd;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo da Igreja" class="logo">` : '<div style="width: 80px;"></div>'}
            <div class="title-section">
              <h1>LIVRO CAIXA</h1>
              <h2>${churchName}</h2>
            </div>
            <div style="width: 80px;"></div>
          </div>
          
          <div class="service-info">
            <strong>Culto/Evento:</strong> ${serviceName}<br>
            <strong>Data do Culto:</strong> ${format(new Date(serviceDate), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
          
          <div class="treasurers-info">
            <div style="display: flex; gap: 30px;">
              <div style="flex: 1;">
                <strong>Tesoureiro(s) Responsável:</strong><br>
                ${treasurers.creators.length > 0 ? treasurers.creators.join(', ') : 'Não identificado'}
              </div>
              <div style="flex: 1;">
                <strong>Validado por:</strong><br>
                ${treasurers.validators.length > 0 ? treasurers.validators.join(', ') : 'Aguardando validação'}
              </div>
            </div>
          </div>
          
          <div class="period">
            Período: ${format(new Date(startDate), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(endDate), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
          
          <div class="summary">
            <strong>Saldo Inicial: R$ ${initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Sessão/Evento</th>
                <th>Categoria</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              ${entries.map(entry => `
                <tr>
                  <td>${format(new Date(entry.date), 'dd/MM/yyyy', { locale: ptBR })}</td>
                  <td>${entry.description}</td>
                  <td>${entry.session}</td>
                  <td>${entry.category || '-'}</td>
                  <td class="amount ${entry.type === 'entrada' ? 'entrada' : ''}">
                    ${entry.type === 'entrada' ? `R$ ${entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td class="amount ${entry.type === 'saida' ? 'saida' : ''}">
                    ${entry.type === 'saida' ? `R$ ${entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                  </td>
                  <td class="amount balance">R$ ${entry.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="summary">
            <strong>Saldo Final: R$ ${entries.length > 0 ? entries[entries.length - 1].balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : initialBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
          
          <div class="footer-info">
            <div>
              Relatório gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </div>
            <div style="text-align: right;">
              <div style="margin-bottom: 40px; border-bottom: 1px solid #000; width: 200px;">
                &nbsp;
              </div>
              <small>Assinatura do Tesoureiro</small>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return { exportToPrint };
};
