
export interface CashBookEntry {
  date: string;
  description: string;
  type: 'entrada' | 'saida';
  amount: number;
  balance: number;
  session: string;
  category?: string;
}

export interface Church {
  id: string;
  name: string;
}

export interface CashBookPrintExportProps {
  entries: CashBookEntry[];
  initialBalance: number;
  startDate: string;
  endDate: string;
  selectedChurch: string;
  churches: Church[];
}

export interface SessionDetails {
  sessions: Array<{
    culto_evento: string;
    date_session: string;
    created_by: string;
    validated_by: string;
  }>;
  profileMap: Record<string, string>;
}
