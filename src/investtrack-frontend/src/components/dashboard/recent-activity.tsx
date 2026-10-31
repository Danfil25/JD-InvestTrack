import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Receipt, Wallet } from "lucide-react";
import { TRANSACTION_LABEL } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Investment, Transaction, TransactionType } from "@/types";

const ICONS: Record<TransactionType, { icon: typeof Wallet; className: string }> = {
  CONTRIBUTION: { icon: ArrowUpRight, className: "bg-navy/10 text-navy" },
  EXPENSE: { icon: Receipt, className: "bg-danger-soft text-danger" },
  INCOME: { icon: ArrowDownLeft, className: "bg-brand-soft text-brand" },
  WITHDRAWAL: { icon: Wallet, className: "bg-brand-soft text-brand" },
};

export function RecentActivity({
  transactions,
  investmentsById,
}: {
  transactions: Transaction[];
  investmentsById: Map<string, Investment>;
}) {
  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Ainda não há movimentações registadas.
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {transactions.map((t) => {
        const { icon: Icon, className } = ICONS[t.type];
        const investment = investmentsById.get(t.investment_id);
        return (
          <li key={t.id} className="flex items-center gap-3 py-3">
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${className}`}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-navy">
                {TRANSACTION_LABEL[t.type]}
                {investment && (
                  <>
                    {" · "}
                    <Link
                      href={`/investments/${investment.id}`}
                      className="text-muted-foreground hover:text-brand hover:underline"
                    >
                      {investment.name}
                    </Link>
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold text-navy">
              {formatCurrency(t.amount, t.currency)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
