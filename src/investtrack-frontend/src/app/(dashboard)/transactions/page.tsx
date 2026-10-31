"use client";

import * as React from "react";
import { ArrowLeftRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { TransactionForm } from "@/features/transactions/transaction-form";
import { TransactionTable } from "@/features/transactions/transaction-table";
import { TRANSACTION_TYPES } from "@/lib/constants";
import { useData } from "@/lib/data/data-provider";
import type { Transaction } from "@/types";

export default function TransactionsPage() {
  const { investments, transactions, addTransaction, deleteTransaction, ready } = useData();
  const [investmentFilter, setInvestmentFilter] = React.useState("ALL");
  const [typeFilter, setTypeFilter] = React.useState("ALL");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<Transaction | null>(null);

  const investmentsById = React.useMemo(
    () => new Map(investments.map((i) => [i.id, i])),
    [investments],
  );
  const selectable = React.useMemo(
    () => investments.filter((i) => i.status !== "ARCHIVED"),
    [investments],
  );

  const filtered = React.useMemo(
    () =>
      transactions
        .filter((t) => investmentFilter === "ALL" || t.investment_id === investmentFilter)
        .filter((t) => typeFilter === "ALL" || t.type === typeFilter)
        .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at)),
    [transactions, investmentFilter, typeFilter],
  );

  return (
    <>
      <PageHeader
        title="Movimentações"
        description="Histórico de contribuições, despesas, rendimentos e levantamentos."
        actions={
          <Button
            variant="brand"
            disabled={selectable.length === 0}
            onClick={() => setDialogOpen(true)}
          >
            <Plus /> Nova movimentação
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <Select
          aria-label="Filtrar por investimento"
          className="sm:w-64"
          value={investmentFilter}
          onChange={(e) => setInvestmentFilter(e.target.value)}
        >
          <option value="ALL">Todos os investimentos</option>
          {investments.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filtrar por tipo"
          className="sm:w-48"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="ALL">Todos os tipos</option>
          {TRANSACTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      {!ready ? (
        <Skeleton className="h-64" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title={transactions.length === 0 ? "Sem movimentações" : "Nenhuma movimentação encontrada"}
          description={
            selectable.length === 0
              ? "Crie primeiro um investimento para registar movimentações."
              : transactions.length === 0
                ? "Registe a primeira movimentação."
                : "Ajuste os filtros."
          }
        />
      ) : (
        <Card>
          <CardContent className="p-5">
            <TransactionTable
              transactions={filtered}
              investmentsById={investmentsById}
              showInvestment
              onDelete={setToDelete}
            />
          </CardContent>
        </Card>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Nova movimentação"
        description="O valor fica sempre na moeda do investimento."
      >
        <TransactionForm
          investments={selectable}
          onSubmit={(values) => {
            addTransaction(values);
            setDialogOpen(false);
          }}
          onCancel={() => setDialogOpen(false)}
        />
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Eliminar movimentação?"
        description="Isto altera o histórico e os cálculos do investimento."
        confirmLabel="Eliminar"
        onConfirm={() => toDelete && deleteTransaction(toDelete.id)}
      />
    </>
  );
}
