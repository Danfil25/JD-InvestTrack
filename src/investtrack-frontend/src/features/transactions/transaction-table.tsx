"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TRANSACTION_LABEL } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { Investment, Transaction, TransactionType } from "@/types";

const TYPE_BADGE: Record<TransactionType, "navy" | "danger" | "brand"> = {
  CONTRIBUTION: "navy",
  EXPENSE: "danger",
  INCOME: "brand",
  WITHDRAWAL: "brand",
};

export function TransactionTable({
  transactions,
  investmentsById,
  showInvestment = false,
  onDelete,
}: {
  transactions: Transaction[];
  investmentsById?: Map<string, Investment>;
  showInvestment?: boolean;
  onDelete?: (transaction: Transaction) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="py-2 pr-3 font-medium">Data</th>
            <th className="py-2 pr-3 font-medium">Tipo</th>
            {showInvestment && <th className="py-2 pr-3 font-medium">Investimento</th>}
            <th className="py-2 pr-3 font-medium">Descrição</th>
            <th className="py-2 pr-3 text-right font-medium">Valor</th>
            {onDelete && <th className="w-10 py-2" />}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const investment = investmentsById?.get(t.investment_id);
            return (
              <tr key={t.id} className="border-b last:border-0">
                <td className="whitespace-nowrap py-3 pr-3 text-muted-foreground">
                  {formatDate(t.date)}
                </td>
                <td className="py-3 pr-3">
                  <Badge variant={TYPE_BADGE[t.type]}>{TRANSACTION_LABEL[t.type]}</Badge>
                </td>
                {showInvestment && (
                  <td className="py-3 pr-3">
                    {investment ? (
                      <Link
                        href={`/investments/${investment.id}`}
                        className="font-medium text-navy hover:text-brand hover:underline"
                      >
                        {investment.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                )}
                <td className="max-w-xs truncate py-3 pr-3 text-muted-foreground">
                  {t.description ?? "—"}
                </td>
                <td className="whitespace-nowrap py-3 pr-3 text-right font-medium text-navy">
                  {formatCurrency(t.amount, t.currency)}
                </td>
                {onDelete && (
                  <td className="py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Eliminar movimentação"
                      onClick={() => onDelete(t)}
                    >
                      <Trash2 className="text-danger" />
                    </Button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
