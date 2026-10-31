"use client";

/**
 * ⚠️ CAMADA DE DADOS PROVISÓRIA (localStorage, isolada por utilizador).
 *
 * Expõe a mesma API que a futura camada Supabase deverá expor
 * (investimentos, movimentações, notas + operações CRUD). Ao ligar o backend,
 * substituir a implementação interna mantendo `useData()` inalterado, para
 * que as páginas não precisem de mudar.
 */
import * as React from "react";
import type {
  Investment,
  InvestmentStatus,
  Note,
  Transaction,
} from "@/types";
import type { InvestmentFormValues } from "@/features/investments/schemas";
import type { TransactionFormValues } from "@/features/transactions/schemas";
import type { NoteFormValues } from "@/features/notes/schemas";
import { pickDetails } from "@/features/investments/category-config";
import { newId } from "@/lib/utils/format";

interface DataState {
  investments: Investment[];
  transactions: Transaction[];
  notes: Note[];
}

const EMPTY: DataState = { investments: [], transactions: [], notes: [] };
const storageKey = (userId: string) => `investtrack:data:v1:${userId}`;

interface DataContextValue extends DataState {
  ready: boolean;
  createInvestment: (values: InvestmentFormValues) => Investment;
  updateInvestment: (id: string, values: InvestmentFormValues) => void;
  setCurrentValue: (id: string, value: number) => void;
  setInvestmentStatus: (id: string, status: InvestmentStatus) => void;
  deleteInvestment: (id: string) => void;
  addTransaction: (values: TransactionFormValues) => void;
  deleteTransaction: (id: string) => void;
  addNote: (values: NoteFormValues) => void;
  updateNote: (id: string, values: NoteFormValues) => void;
  deleteNote: (id: string) => void;
}

const DataContext = React.createContext<DataContextValue | null>(null);

export function DataProvider({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<DataState>(EMPTY);
  const [loadedFor, setLoadedFor] = React.useState<string | null>(null);

  // Carregar dados do utilizador (só no cliente).
  React.useEffect(() => {
    let loaded = EMPTY;
    try {
      const raw = localStorage.getItem(storageKey(userId));
      if (raw) loaded = { ...EMPTY, ...(JSON.parse(raw) as Partial<DataState>) };
    } catch {
      loaded = EMPTY;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loaded);
    setLoadedFor(userId);
  }, [userId]);

  // Persistir alterações (só depois de carregar, para não apagar dados).
  React.useEffect(() => {
    if (loadedFor !== userId) return;
    try {
      localStorage.setItem(storageKey(userId), JSON.stringify(state));
    } catch {
      // Quota cheia / modo privado: os dados continuam em memória.
    }
  }, [state, loadedFor, userId]);

  const value = React.useMemo<DataContextValue>(() => {
    const now = () => new Date().toISOString();

    return {
      ...state,
      ready: loadedFor === userId,

      createInvestment: (values) => {
        const id = newId();
        const timestamp = now();
        const investment: Investment = {
          id,
          user_id: userId,
          category_id: values.category_id,
          name: values.name.trim(),
          description: values.description.trim() || null,
          initial_date: values.initial_date,
          status: values.status,
          risk_level: values.risk_level,
          currency: values.currency,
          current_value: values.current_value,
          current_value_updated_at: values.current_value === null ? null : timestamp,
          details: pickDetails(values.category_id, values.details),
          created_at: timestamp,
          updated_at: timestamp,
        };
        // Regra 4/5: o capital inicial é UMA contribuição (nunca somado à parte).
        const initialContribution: Transaction[] =
          values.initial_capital !== null && values.initial_capital > 0
            ? [
                {
                  id: newId(),
                  investment_id: id,
                  type: "CONTRIBUTION",
                  amount: values.initial_capital,
                  currency: values.currency,
                  date: values.initial_date,
                  description: "Capital inicial",
                  created_at: timestamp,
                },
              ]
            : [];
        setState((s) => ({
          ...s,
          investments: [investment, ...s.investments],
          transactions: [...initialContribution, ...s.transactions],
        }));
        return investment;
      },

      updateInvestment: (id, values) =>
        setState((s) => ({
          ...s,
          investments: s.investments.map((inv) => {
            if (inv.id !== id) return inv;
            const valueChanged = values.current_value !== inv.current_value;
            return {
              ...inv,
              name: values.name.trim(),
              description: values.description.trim() || null,
              initial_date: values.initial_date,
              status: values.status,
              risk_level: values.risk_level,
              current_value: values.current_value,
              current_value_updated_at: valueChanged
                ? values.current_value === null
                  ? null
                  : now()
                : inv.current_value_updated_at,
              // categoria e moeda não mudam depois de criadas
              details: pickDetails(inv.category_id, values.details),
              updated_at: now(),
            };
          }),
        })),

      setCurrentValue: (id, newValue) =>
        setState((s) => ({
          ...s,
          investments: s.investments.map((inv) =>
            inv.id === id
              ? {
                  ...inv,
                  current_value: newValue,
                  current_value_updated_at: now(),
                  updated_at: now(),
                }
              : inv,
          ),
        })),

      setInvestmentStatus: (id, status) =>
        setState((s) => ({
          ...s,
          investments: s.investments.map((inv) =>
            inv.id === id ? { ...inv, status, updated_at: now() } : inv,
          ),
        })),

      deleteInvestment: (id) =>
        setState((s) => ({
          investments: s.investments.filter((i) => i.id !== id),
          transactions: s.transactions.filter((t) => t.investment_id !== id),
          notes: s.notes.filter((n) => n.investment_id !== id),
        })),

      addTransaction: (values) =>
        setState((s) => {
          const investment = s.investments.find((i) => i.id === values.investment_id);
          if (!investment) return s;
          const transaction: Transaction = {
            id: newId(),
            investment_id: investment.id,
            type: values.type,
            amount: values.amount,
            // A moeda da movimentação é sempre a do investimento (regra 8).
            currency: investment.currency,
            date: values.date,
            description: values.description.trim() || null,
            created_at: now(),
          };
          return { ...s, transactions: [transaction, ...s.transactions] };
        }),

      deleteTransaction: (id) =>
        setState((s) => ({
          ...s,
          transactions: s.transactions.filter((t) => t.id !== id),
        })),

      addNote: (values) =>
        setState((s) => {
          const timestamp = now();
          const note: Note = {
            id: newId(),
            investment_id: values.investment_id,
            title: values.title.trim(),
            content: values.content.trim(),
            created_at: timestamp,
            updated_at: timestamp,
          };
          return { ...s, notes: [note, ...s.notes] };
        }),

      updateNote: (id, values) =>
        setState((s) => ({
          ...s,
          notes: s.notes.map((n) =>
            n.id === id
              ? {
                  ...n,
                  investment_id: values.investment_id,
                  title: values.title.trim(),
                  content: values.content.trim(),
                  updated_at: now(),
                }
              : n,
          ),
        })),

      deleteNote: (id) =>
        setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) })),
    };
  }, [state, loadedFor, userId]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = React.useContext(DataContext);
  if (!ctx) throw new Error("useData deve ser usado dentro de <DataProvider>.");
  return ctx;
}
