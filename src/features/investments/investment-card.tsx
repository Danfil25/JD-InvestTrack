import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CategoryBadge, RiskBadge, StatusBadge } from "@/components/shared/investment-badges";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils/format";
import type { InvestmentWithMetrics } from "@/lib/finance/calculations";

export function InvestmentCard({ investment, metrics }: InvestmentWithMetrics) {
  const { currency } = investment;
  return (
    <Link href={`/investments/${investment.id}`} className="group block">
      <Card className="h-full p-5 transition-shadow group-hover:shadow-md">
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={investment.category_id} />
          <StatusBadge status={investment.status} />
          <RiskBadge risk={investment.risk_level} />
        </div>

        <h3 className="mt-3 truncate text-base font-semibold text-navy group-hover:text-brand">
          {investment.name}
        </h3>
        <p className="text-xs text-muted-foreground">
          Desde {formatDate(investment.initial_date)} · {currency}
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Capital aplicado</dt>
            <dd className="font-semibold text-navy">
              {formatCurrency(metrics.contributions, currency)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Valor actual</dt>
            <dd className="font-semibold text-navy">
              {metrics.currentValue === null
                ? "—"
                : formatCurrency(metrics.currentValue, currency)}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-muted-foreground">Resultado</dt>
            <dd
              className={cn(
                "font-semibold",
                metrics.result === null
                  ? "text-muted-foreground"
                  : metrics.result >= 0
                    ? "text-brand"
                    : "text-danger",
              )}
            >
              {metrics.result === null ? (
                "Defina o valor actual"
              ) : (
                <>
                  {formatCurrency(metrics.result, currency)}
                  {metrics.roi !== null && (
                    <span className="ml-1.5 text-xs font-medium">
                      ({formatPercent(metrics.roi)})
                    </span>
                  )}
                </>
              )}
            </dd>
          </div>
        </dl>
      </Card>
    </Link>
  );
}
