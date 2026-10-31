"use client";

import * as React from "react";
import Link from "next/link";
import { Coins, LineChart, PiggyBank, Plus, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { CurrencySwitcher } from "@/components/shared/currency-switcher";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { EvolutionChart } from "@/components/dashboard/evolution-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { useAuth } from "@/features/auth/auth-provider";
import { useCurrencyView } from "@/features/analytics/use-currency-view";
import { useData } from "@/lib/data/data-provider";
import {
  aggregateMetrics,
  cumulativeCapitalByMonth,
  distributionByCategory,
  withMetrics,
} from "@/lib/finance/calculations";
import { formatCurrency, formatPercent } from "@/lib/utils/format";

export default function DashboardPage() {
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
      aggregate: aggregateMetrics(items),
      distribution: distributionByCategory(items),
      series: cumulativeCapitalByMonth(transactions.filter((t) => ids.has(t.investment_id))),
    };
  }, [active, transactions, currency]);

  const recent = React.useMemo(() => {
    const ids = new Set(active.map((i) => i.id));
    return transactions
      .filter((t) => ids.has(t.investment_id))
      .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))
      .slice(0, 6);
  }, [active, transactions]);

  const investmentsById = React.useMemo(
    () => new Map(investments.map((i) => [i.id, i])),
    [investments],
  );

  if (!ready) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  const newInvestmentLink = (
    <Link href="/investments/new" className={buttonVariants({ variant: "brand" })}>
      <Plus /> Novo investimento
    </Link>
  );

  if (active.length === 0) {
    return (
      <>
        <PageHeader title="Dashboard" description="Visão geral dos seus investimentos." />
        <EmptyState
          icon={Wallet}
          title="Ainda não tem investimentos"
          description="Registe o seu primeiro investimento para ver aqui os indicadores, gráficos e actividade recente."
          action={newInvestmentLink}
        />
      </>
    );
  }

  const { aggregate } = view;
  const resultTone =
    aggregate.roi === null && aggregate.result === 0
      ? "default"
      : aggregate.result >= 0
        ? "positive"
        : "negative";
  const hasValuation = aggregate.count > aggregate.unvaluedCount;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral dos seus investimentos."
        actions={
          <>
            <CurrencySwitcher value={currency} available={available} onChange={setCurrency} />
            {newInvestmentLink}
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Investimentos"
          value={active.length}
          icon={Wallet}
          hint={
            available.length > 1
              ? `${aggregate.count} em ${currency} · totais abaixo apenas em ${currency}`
              : "Activos e concluídos"
          }
        />
        <StatCard
          label="Capital aplicado"
          value={formatCurrency(aggregate.capitalApplied, currency)}
          icon={PiggyBank}
          hint="Soma das contribuições"
        />
        <StatCard
          label="Valor actual estimado"
          value={formatCurrency(aggregate.currentValue, currency)}
          icon={Coins}
          hint={
            aggregate.unvaluedCount > 0
              ? `${aggregate.unvaluedCount} sem valor actual definido`
              : "Avaliação manual"
          }
        />
        <StatCard
          label="Resultado"
          value={hasValuation ? formatCurrency(aggregate.result, currency) : "—"}
          icon={LineChart}
          tone={hasValuation ? resultTone : "default"}
          hint={
            aggregate.roi !== null
              ? `ROI simplificado: ${formatPercent(aggregate.roi)}`
              : "Defina o valor actual para calcular"
          }
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Evolução do capital aplicado</CardTitle>
          </CardHeader>
          <CardContent>
            <EvolutionChart series={view.series} currency={currency} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribuição por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart slices={view.distribution} currency={currency} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Actividade recente</CardTitle>
          <Link href="/transactions" className="text-sm font-medium text-brand hover:underline">
            Ver todas
          </Link>
        </CardHeader>
        <CardContent>
          <RecentActivity transactions={recent} investmentsById={investmentsById} />
        </CardContent>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        Resultado e ROI são simplificados: Valor actual + Rendimentos + Levantamentos −
        Contribuições − Despesas. Não representam retorno anualizado. Moedas diferentes nunca
        são somadas.
      </p>
    </>
  );
}
