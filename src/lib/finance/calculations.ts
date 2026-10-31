/**
 * Cálculos financeiros centralizados (regra de negócio 10).
 * Funções puras, sem dependências de React, prontas para testes unitários.
 *
 * Fórmulas do MVP (aproximação para acompanhamento — NÃO é retorno anualizado):
 *   Capital aplicado  = Σ contribuições
 *   Resultado         = Valor actual + Rendimentos + Levantamentos − Contribuições − Despesas
 *   ROI simplificado  = Resultado / Capital aplicado × 100
 *
 * O capital inicial é uma transacção CONTRIBUTION; por isso nunca é somado
 * separadamente (regra 5).
 * Valores de moedas diferentes nunca são somados (regra 8): quem agrega deve
 * filtrar por moeda antes de chamar estas funções.
 */
import type {
  CategoryCode,
  Investment,
  Transaction,
  TransactionType,
} from "@/types";

export interface InvestmentMetrics {
  contributions: number;
  expenses: number;
  income: number;
  withdrawals: number;
  currentValue: number | null;
  /** null quando o valor actual ainda não foi indicado. */
  result: number | null;
  /** null quando não há resultado ou capital aplicado é 0. */
  roi: number | null;
}

export function sumByType(
  transactions: Transaction[],
  type: TransactionType,
): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((acc, t) => acc + t.amount, 0);
}

export function computeMetrics(
  investment: Pick<Investment, "current_value">,
  transactions: Transaction[],
): InvestmentMetrics {
  const contributions = sumByType(transactions, "CONTRIBUTION");
  const expenses = sumByType(transactions, "EXPENSE");
  const income = sumByType(transactions, "INCOME");
  const withdrawals = sumByType(transactions, "WITHDRAWAL");
  const currentValue = investment.current_value;

  const result =
    currentValue === null
      ? null
      : currentValue + income + withdrawals - contributions - expenses;
  const roi =
    result === null || contributions <= 0 ? null : (result / contributions) * 100;

  return { contributions, expenses, income, withdrawals, currentValue, result, roi };
}

export interface InvestmentWithMetrics {
  investment: Investment;
  metrics: InvestmentMetrics;
}

export function withMetrics(
  investments: Investment[],
  transactions: Transaction[],
): InvestmentWithMetrics[] {
  return investments.map((investment) => ({
    investment,
    metrics: computeMetrics(
      investment,
      transactions.filter((t) => t.investment_id === investment.id),
    ),
  }));
}

export interface AggregateMetrics {
  count: number;
  capitalApplied: number;
  currentValue: number;
  /** Soma dos resultados dos investimentos com valor actual definido. */
  result: number;
  /** ROI calculado apenas sobre os investimentos com valor actual definido. */
  roi: number | null;
  /** Investimentos sem valor actual (não entram no resultado/ROI). */
  unvaluedCount: number;
}

/** Agrega métricas. Todos os itens devem partilhar a mesma moeda. */
export function aggregateMetrics(items: InvestmentWithMetrics[]): AggregateMetrics {
  let capitalApplied = 0;
  let currentValue = 0;
  let result = 0;
  let valuedContributions = 0;
  let unvaluedCount = 0;

  for (const { metrics } of items) {
    capitalApplied += metrics.contributions;
    if (metrics.result === null || metrics.currentValue === null) {
      unvaluedCount += 1;
      continue;
    }
    currentValue += metrics.currentValue;
    result += metrics.result;
    valuedContributions += metrics.contributions;
  }

  return {
    count: items.length,
    capitalApplied,
    currentValue,
    result,
    roi: valuedContributions > 0 ? (result / valuedContributions) * 100 : null,
    unvaluedCount,
  };
}

export interface CategorySlice {
  category: CategoryCode;
  capitalApplied: number;
  currentValue: number;
  result: number;
  count: number;
}

export function distributionByCategory(items: InvestmentWithMetrics[]): CategorySlice[] {
  const map = new Map<CategoryCode, CategorySlice>();
  for (const { investment, metrics } of items) {
    const slice = map.get(investment.category_id) ?? {
      category: investment.category_id,
      capitalApplied: 0,
      currentValue: 0,
      result: 0,
      count: 0,
    };
    slice.capitalApplied += metrics.contributions;
    slice.count += 1;
    if (metrics.result !== null && metrics.currentValue !== null) {
      slice.currentValue += metrics.currentValue;
      slice.result += metrics.result;
    }
    map.set(investment.category_id, slice);
  }
  return [...map.values()];
}

export interface SeriesPoint {
  /** YYYY-MM */
  month: string;
  value: number;
}

/**
 * Capital aplicado acumulado por mês (apenas contribuições), preenchendo
 * meses sem movimentos. Devolve [] se não houver contribuições.
 */
export function cumulativeCapitalByMonth(transactions: Transaction[]): SeriesPoint[] {
  const contributions = transactions.filter((t) => t.type === "CONTRIBUTION");
  if (contributions.length === 0) return [];

  const byMonth = new Map<string, number>();
  for (const t of contributions) {
    const key = t.date.slice(0, 7);
    byMonth.set(key, (byMonth.get(key) ?? 0) + t.amount);
  }
  const keys = [...byMonth.keys()].sort();
  const [startY, startM] = keys[0].split("-").map(Number);
  const [endY, endM] = keys[keys.length - 1].split("-").map(Number);

  const points: SeriesPoint[] = [];
  let acc = 0;
  let y = startY;
  let m = startM;
  while (y < endY || (y === endY && m <= endM)) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    acc += byMonth.get(key) ?? 0;
    points.push({ month: key, value: acc });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return points;
}
