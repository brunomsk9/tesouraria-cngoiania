
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CashBookEntry, Church } from '@/types/cashBook';
import { SessionDetails } from '@/types/cashBook';

interface HtmlGeneratorParams {
  churchName: string;
  logoUrl: string | null;
  sessions: SessionDetails['sessions'];
  profileMap: SessionDetails['profileMap'];
  startDate: string;
  endDate: string;
  entries: CashBookEntry[];
  initialBalance: number;
}

interface CashBookSummary {
  dinheiroLiquido: number;
  somaPix: number;
  somaCredito: number;
  somaDebito: number;
  somaSaida: number;
}

const calculateSummary = (entries: CashBookEntry[]): CashBookSummary => {
  let somaDinheiro = 0;
  let somaPix = 0;
  let somaCredito = 0;
  let somaDebito = 0;
  let somaSaida = 0;

  entries.forEach(entry => {
    if (entry.type === 'entrada') {
      switch (entry.category) {
        case 'dinheiro':
          somaDinheiro += entry.amount;
          break;
        case 'pix':
          somaPix += entry.amount;
          break;
        case 'cartao_credito':
          somaCredito += entry.amount;
          break;
        case 'cartao_debito':
          somaDebito += entry.amount;
          break;
      }
    } else if (entry.type === 'saida') {
      somaSaida += entry.amount;
    }
  });

  // Dinheiro líquido = Soma dinheiro - Todas as saídas
  const dinheiroLiquido = somaDinheiro - somaSaida;

  return {
    dinheiroLiquido,
    somaPix,
    somaCredito,
    somaDebito,
    somaSaida
  };
};

export const generateCashBookHtml = ({
  churchName,
  logoUrl,
  sessions,
  profileMap,
  startDate,
  endDate,
  entries,
  initialBalance
}: HtmlGeneratorParams): string => {
  // Agrupar informações dos tesoureiros
  const treasurers = {
    creators: [...new Set(sessions.map(s => profileMap[s.created_by]).filter(Boolean))],
    validators: [...new Set(sessions.map(s => profileMap[s.validated_by]).filter(Boolean))]
  };
  
  // Obter informações do primeiro culto/evento
  const firstSession = sessions[0];
  const serviceName = firstSession?.culto_evento || 'Não especificado';
  const serviceDate = firstSession?.date_session || startDate;

  // Calcular resumo financeiro
  const summary = calculateSummary(entries);

  return `
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
          .summary-cards {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 15px;
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 2px solid #dee2e6;
          }
          .summary-card {
            text-align: center;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
          }
          .summary-card.dinheiro { background-color: #e3f2fd; border-color: #2196f3; }
          .summary-card.pix { background-color: #f3e5f5; border-color: #9c27b0; }
          .summary-card.credito { background-color: #e8f5e8; border-color: #4caf50; }
          .summary-card.debito { background-color: #fff3e0; border-color: #ff9800; }
          .summary-card.saida { background-color: #ffebee; border-color: #f44336; }
          .summary-card h4 {
            margin: 0 0 8px 0;
            font-size: 12px;
            text-transform: uppercase;
            font-weight: bold;
            color: #666;
          }
          .summary-card .value {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
          }
          .summary-card.dinheiro .value { color: #1976d2; }
          .summary-card.pix .value { color: #7b1fa2; }
          .summary-card.credito .value { color: #388e3c; }
          .summary-card.debito .value { color: #f57c00; }
          .summary-card.saida .value { color: #d32f2f; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .amount { text-align: right; }
          .entrada { color: #059669; }
          .saida { color: #dc2626; }
          .balance { font-weight: bold; }
          .summary { margin-top: 20px; padding: 15px; background-color: #f9f9f9; }
          .footer-signatures { 
            margin-top: 50px; 
            padding-top: 20px;
            border-top: 1px solid #ddd;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .signature-box {
            text-align: center;
            min-width: 200px;
          }
          .signature-line {
            border-bottom: 1px solid #000;
            margin-bottom: 10px;
            height: 40px;
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
            <h1>${churchName}</h1>
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
              ${treasurers.validators.length > 0 ? treasurers.validators[0] : 'Aguardando validação'}
            </div>
          </div>
        </div>
        
        <div class="period">
          Período: ${format(new Date(startDate), 'dd/MM/yyyy', { locale: ptBR })} a ${format(new Date(endDate), 'dd/MM/yyyy', { locale: ptBR })}
        </div>
        
        <div class="summary-cards">
          <div class="summary-card dinheiro">
            <h4>Dinheiro Líquido</h4>
            <p class="value">R$ ${summary.dinheiroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div class="summary-card pix">
            <h4>Soma PIX</h4>
            <p class="value">R$ ${summary.somaPix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div class="summary-card credito">
            <h4>Soma Crédito</h4>
            <p class="value">R$ ${summary.somaCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div class="summary-card debito">
            <h4>Soma Débito</h4>
            <p class="value">R$ ${summary.somaDebito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div class="summary-card saida">
            <h4>Soma Saída</h4>
            <p class="value">R$ ${summary.somaSaida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
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
          <strong>Saldo Final: R$ ${entries.length > 0 ? entries[entries.length - 1].balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</strong>
        </div>
        
        <div style="text-align: center; margin: 30px 0; color: #666;">
          Relatório gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
        </div>
        
        <div class="footer-signatures">
          <div class="signature-box">
            <div class="signature-line"></div>
            <small>Assinatura do Tesoureiro</small>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <small>Assinatura do Responsável</small>
          </div>
        </div>
      </body>
    </html>
  `;
};
