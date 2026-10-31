"use client";

import * as React from "react";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencySwitcher } from "@/components/shared/currency-switcher";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { EvolutionChart } from "@/components/dashboard/evolution-chart";
import { useAuth } from "@/features/auth/auth-provider";
import { PerformanceChart } from "@/features/analytics/performance-chart";
import { useCurrencyView } from "@/features/analytics/use-currency-view";
import { CATEGORY_BY_ID } from "@/lib/constants";
import { useData } from "@/lib/data/data-provider";
import {
  aggregateMetrics,
  cumulativeCapitalByMonth,
  distributionByCategory,
  withMetrics,
} from "@/lib/finance/calculations";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { investments, transactions, ready } = useData();

  const active = React.useMemo(
    () => investments.filter((i) => i.status !== "ARCHIVED"),
    [investments],
  );
  const { currency, setCurrency, available } = useCurrencyView(
    active,
    user?.currency ?? "AOA",
  );

  const view = React.useMemo(() => {
    const inCurrency = active.filter((i) => i.currency === currency);
    const ids = new Set(inCurrency.map((i) => i.id));
    const items = withMetrics(inCurrency, transactions);
    return {
      items,
      aggregate: aggregateMetrics(items),
      distribution: distributionByCategory(items),
      series: cumulativeCapitalByMonth(transactions.filter((t) => ids.has(t.investment_id))),
    };
  }, [active, transactions, currency]);

  if (!ready) return <Skeleton className="h-96" />;

  if (active.length === 0) {
    return (
      <>
        <PageHeader title="Análises" description="Resultados e distribuição dos seus investimentos." />
        <EmptyState
          icon={BarChart3}
          title="Sem dados para analisar"
          description="Registe investimentos e movimentações para ver as análises."
        />
      </>
    );
  }

  const { aggregate } = view;

  return (
    <>
      <PageHeader
        title="Análises"
        description="Resultados e distribuição dos seus investimentos."
        actions={<CurrencySwitcher value={currency} available={available} onChange={setCurrency} />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Capital aplicado vs. valor actual</CardTitle>
            <CardDescription>Por investimento, em {currency}.</CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceChart items={view.items} currency={currency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por categoria</CardTitle>
            <CardDescription>Pelo capital aplicado.</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryChart slices={view.distribution} currency={currency} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Evolução do capital aplicado</CardTitle>
          <CardDescription>Contribuições acumuladas mês a mês.</CardDescription>
        </CardHeader>
        <CardContent>
          <EvolutionChart series={view.series} currency={currency} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Resultados por investimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Investimento</th>
                  <th className="py-2 pr-3 font-medium">Categoria</th>
                  <th className="py-2 pr-3 text-right font-medium">Capital</th>
                  <th className="py-2 pr-3 text-right font-medium">Valor actual</th>
                  <th className="py-2 pr-3 text-right font-medium">Resultado</th>
                  <th className="py-2 text-right font-medium">ROI simpl.</th>
                </tr>
              </thead>
              <tbody>
                {view.items.map(({ investment, metrics }) => (
                  <tr key={investment.id} className="border-b">
                    <td className="py-3 pr-3 font-medium">
                      <Link
                        href={`/investments/${investment.id}`}
                        className="text-navy hover:text-brand hover:underline"
                      >
                        {investment.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">
                      {CATEGORY_BY_ID[investment.category_id].name}
                    </td>
                    <td className="py-3 pr-3 text-right">
                      {formatCurrency(metrics.contributions, currency)}
                    </td>
                    <td className="py-3 pr-3 text-right">
                      {metrics.currentValue === null
                        ? "—"
                        : formatCurrency(metrics.currentValue, currency)}
                    </td>
                    <td
                      className={cn(
                        "py-3 pr-3 text-right font-medium",
                        metrics.result !== null &&
                          (metrics.result >= 0 ? "text-brand" : "text-danger"),
                      )}
                    >
                      {metrics.result === null ? "—" : formatCurrency(metrics.result, currency)}
                    </td>
                    <td className="py-3 text-right">
                      {metrics.roi === null ? "—" : formatPercent(metrics.roi)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-navy">
                  <td className="py-3 pr-3" colSpan={2}>
                    Total ({currency})
                  </td>
                  <td className="py-3 pr-3 text-right">
                    {formatCurrency(aggregate.capitalApplied, currency)}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    {formatCurrency(aggregate.currentValue, currency)}
                  </td>
                  <td className="py-3 pr-3 text-right">
                    {formatCurrency(aggregate.result, currency)}
                  </td>
                  <td className="py-3 text-right">
                    {aggregate.roi === null ? "—" : formatPercent(aggregate.roi)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {aggregate.unvaluedCount > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              {aggregate.unvaluedCount} investimento(s) sem valor actual não entram no
              resultado nem no ROI.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4 bg-navy text-white">
        <CardContent className="p-5">
          <h2 className="font-semibold">Como são calculados os indicadores</h2>
          <ul className="mt-2 space-y-1 text-sm text-white/80">
            <li>Capital aplicado = soma das contribuições (o capital inicial é uma contribuição).</li>
            <li>
              Resultado = Valor actual + Rendimentos + Levantamentos − Contribuições − Despesas.
            </li>
            <li>ROI simplificado = Resultado ÷ Capital aplicado × 100.</li>
            <li>
              É uma aproximação para acompanhamento: não é retorno anualizado nem uma medida
              universal de rentabilidade.
            </li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
