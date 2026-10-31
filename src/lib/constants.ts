import {
  Briefcase,
  Building2,
  GraduationCap,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import type {
  CategoryCode,
  CurrencyCode,
  InvestmentStatus,
  RiskLevel,
  TransactionType,
} from "@/types";

export interface CategoryConfig {
  id: CategoryCode;
  name: string;
  description: string;
  icon: LucideIcon;
  /** Cor usada nos gráficos. */
  color: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: "FINANCIAL",
    name: "Financeiro",
    description: "Acções, obrigações, fundos, criptomoedas e depósitos a prazo.",
    icon: Landmark,
    color: "#142B45",
  },
  {
    id: "REAL_ESTATE",
    name: "Imobiliário",
    description: "Terrenos, imóveis, arrendamento, construção e reabilitação.",
    icon: Building2,
    color: "#16A37A",
  },
  {
    id: "BUSINESS",
    name: "Empresarial",
    description: "Negócios, participações, equipamentos e financiamento.",
    icon: Briefcase,
    color: "#4F7CAC",
  },
  {
    id: "PERSONAL",
    name: "Pessoal",
    description: "Cursos, formações, certificações e competências.",
    icon: GraduationCap,
    color: "#9AA9BC",
  },
];

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryCode, CategoryConfig>;

export const CURRENCIES: { code: CurrencyCode; label: string }[] = [
  { code: "AOA", label: "Kwanza (AOA)" },
  { code: "USD", label: "Dólar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
];

export const TRANSACTION_TYPES: {
  value: TransactionType;
  label: string;
  description: string;
  /** Tom visual: positivo/negativo do ponto de vista do utilizador. */
  tone: "neutral" | "positive" | "negative";
}[] = [
  {
    value: "CONTRIBUTION",
    label: "Contribuição",
    description: "Dinheiro aplicado no investimento.",
    tone: "neutral",
  },
  {
    value: "EXPENSE",
    label: "Despesa",
    description: "Custo associado ao investimento.",
    tone: "negative",
  },
  {
    value: "INCOME",
    label: "Rendimento",
    description: "Dinheiro recebido do investimento.",
    tone: "positive",
  },
  {
    value: "WITHDRAWAL",
    label: "Levantamento",
    description: "Capital retirado do investimento.",
    tone: "positive",
  },
];

export const TRANSACTION_LABEL = Object.fromEntries(
  TRANSACTION_TYPES.map((t) => [t.value, t.label]),
) as Record<TransactionType, string>;

export const STATUS_OPTIONS: { value: InvestmentStatus; label: string }[] = [
  { value: "ACTIVE", label: "Activo" },
  { value: "CLOSED", label: "Concluído" },
  { value: "ARCHIVED", label: "Arquivado" },
];

export const STATUS_LABEL = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.label]),
) as Record<InvestmentStatus, string>;

export const RISK_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: "LOW", label: "Baixo" },
  { value: "MEDIUM", label: "Médio" },
  { value: "HIGH", label: "Alto" },
];

export const RISK_LABEL = Object.fromEntries(
  RISK_OPTIONS.map((r) => [r.value, r.label]),
) as Record<RiskLevel, string>;

export const DEFAULT_CURRENCY: CurrencyCode = "AOA";
