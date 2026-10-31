"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Search, Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { InvestmentCard } from "@/features/investments/investment-card";
import { CATEGORIES } from "@/lib/constants";
import { useData } from "@/lib/data/data-provider";
import { withMetrics } from "@/lib/finance/calculations";

type StatusFilter = "OPEN" | "ACTIVE" | "CLOSED" | "ARCHIVED" | "ALL";

export default function InvestmentsPage() {
  const { investments, transactions, ready } = useData();
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("ALL");
  const [status, setStatus] = React.useState<StatusFilter>("OPEN");

  const items = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = investments.filter((i) => {
      if (category !== "ALL" && i.category_id !== category) return false;
      if (status === "OPEN" && i.status === "ARCHIVED") return false;
      if (status !== "OPEN" && status !== "ALL" && i.status !== status) return false;
      if (q && !i.name.toLowerCase().includes(q)) return false;
      return true;
    });
    return withMetrics(filtered, transactions);
  }, [investments, transactions, query, category, status]);

  const newLink = (
    <Link href="/investments/new" className={buttonVariants({ variant: "brand" })}>
      <Plus /> Novo investimento
    </Link>
  );

  return (
    <>
      <PageHeader
        title="Investimentos"
        description="Todos os investimentos que registou."
        actions={newLink}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Pesquisar investimentos"
            placeholder="Pesquisar por nome…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select
          aria-label="Filtrar por categoria"
          className="sm:w-48"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="ALL">Todas as categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filtrar por estado"
          className="sm:w-48"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
        >
          <option value="OPEN">Activos e concluídos</option>
          <option value="ACTIVE">Apenas activos</option>
          <option value="CLOSED">Concluídos</option>
          <option value="ARCHIVED">Arquivados</option>
          <option value="ALL">Todos</option>
        </Select>
      </div>

      {!ready ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : items.length === 0 ? (
        investments.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Ainda não tem investimentos"
            description="Comece por registar o seu primeiro investimento."
            action={newLink}
          />
        ) : (
          <EmptyState
            icon={Search}
            title="Nenhum investimento encontrado"
            description="Ajuste a pesquisa ou os filtros."
          />
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <InvestmentCard key={item.investment.id} {...item} />
          ))}
        </div>
      )}
    </>
  );
}
