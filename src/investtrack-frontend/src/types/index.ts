/**
 * Tipos de domínio do InvestTrack.
 * Os nomes dos campos seguem o modelo de dados (snake_case) para que a
 * futura ligação ao Supabase não exija conversões.
 */

export type CategoryCode = "FINANCIAL" | "REAL_ESTATE" | "BUSINESS" | "PERSONAL";
export type CurrencyCode = "AOA" | "USD" | "EUR";
export type InvestmentStatus = "ACTIVE" | "CLOSED" | "ARCHIVED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type TransactionType = "CONTRIBUTION" | "EXPENSE" | "INCOME" | "WITHDRAWAL";

export interface Profile {
  id: string;
  name: string;
  email: string;
  currency: CurrencyCode;
  created_at: string;
}

export interface Investment {
  id: string;
  user_id: string;
  category_id: CategoryCode;
  name: string;
  description: string | null;
  /** Data no formato YYYY-MM-DD */
  initial_date: string;
  status: InvestmentStatus;
  risk_level: RiskLevel;
  currency: CurrencyCode;
  /** Valor actual estimado (introduzido manualmente). */
  current_value: number | null;
  current_value_updated_at: string | null;
  /** Atributos específicos da categoria (JSONB no Supabase). */
  details: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  investment_id: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  /** Data no formato YYYY-MM-DD */
  date: string;
  description: string | null;
  created_at: string;
}

export interface Note {
  id: string;
  investment_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}
