"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  ArrowLeftRight,
  Coins,
  LineChart,
  NotebookPen,
  Pencil,
  PiggyBank,
  Plus,
  Percent,
  RefreshCw,
  Trash2,
  Undo2,
  Wallet,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import {
  CategoryBadge,
  RiskBadge,
  StatusBadge,
} from "@/components/shared/investment-badges";
import { CATEGORY_DETAIL_FIELDS } from "@/features/investments/category-config";
import { CurrentValueForm } from "@/features/investments/current-value-form";
import { NoteCard } from "@/features/notes/note-card";
import { NoteForm } from "@/features/notes/note-form";
import { TransactionForm } from "@/features/transactions/transaction-form";
import { TransactionTable } from "@/features/transactions/transaction-table";
import { useData } from "@/lib/data/data-provider";
import { computeMetrics } from "@/lib/finance/calculations";
import { formatCurrency, formatDate, formatPercent } from "@/lib/utils/format";
import type { Note, Transaction } from "@/types";

export default function InvestmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const data = useData();
  const investment = data.investments.find((i) => i.id === id);

  const [transactionOpen, setTransactionOpen] = React.useState(false);
  const [valueOpen, setValueOpen] = React.useState(false);
  const [noteDialog, setNoteDialog] = React.useState<{ open: boolean; note?: Note }>({
    open: false,
  });
  const [deleteInvestmentOpen, setDeleteInvestmentOpen] = React.useState(false);
  const [transactionToDelete, setTransactionToDelete] = React.useState<Transaction | null>(null);
  const [noteToDelete, setNoteToDelete] = React.useState<Note | null>(null);

  const transactions = React.useMemo(
    () =>
      data.transactions
        .filter((t) => t.investment_id === id)
        .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at)),
    [data.transactions, id],
  );
  const notes = React.useMemo(
    () => data.notes.filter((n) => n.investment_id === id),
    [data.notes, id],
  );

  if (!data.ready) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-28" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!investment) {
    return (
      <EmptyState
        icon={Wallet}
        title="Investimento não encontrado"
        description="Pode ter sido eliminado."
        action={
          <Link href="/investments" className={buttonVariants({ variant: "outline" })}>
            Voltar aos investimentos
          </Link>
        }
      />
    );
  }

  const metrics = computeMetrics(investment, transactions);
  const { currency } = investment;
  const archived = investment.status === "ARCHIVED";
  const resultTone =
    metrics.result === null ? "default" : metrics.result >= 0 ? "positive" : "negative";

  return (
    <>
      <Link
        href="/investments"
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy"
      >
        <ArrowLeft className="size-4" /> Investimentos
      </Link>

      <PageHeader
        title={investment.name}
        description={investment.description ?? undefined}
        actions={
          <>
            <Link
              href={`/investments/${investment.id}/edit`}
              className={buttonVariants({ variant: "outline" })}
            >
              <Pencil /> Editar
            </Link>
            <Button
              variant="outline"
              onClick={() =>
                data.setInvestmentStatus(investment.id, archived ? "ACTIVE" : "ARCHIVED")
              }
            >
              {archived ? <Undo2 /> : <Archive />}
              {archived ? "Restaurar" : "Arquivar"}
            </Button>
            <Button variant="destructive-outline" onClick={() => setDeleteInvestmentOpen(true)}>
              <Trash2 /> Eliminar
            </Button>
          </>
        }
      />

      <div className="-mt-3 mb-6 flex flex-wrap gap-1.5">
        <CategoryBadge category={investment.category_id} />
        <StatusBadge status={investment.status} />
        <RiskBadge risk={investment.risk_level} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Capital aplicado"
          value={formatCurrency(metrics.contributions, currency)}
          icon={PiggyBank}
          hint="Soma das contribuições"
        />
        <StatCard
          label="Valor actual estimado"
          value={metrics.currentValue === null ? "—" : formatCurrency(metrics.currentValue, currency)}
          icon={Coins}
          hint={
            <span className="flex items-center justify-between gap-2">
              <span>
                {investment.current_value_updated_at
                  ? `Actualizado em ${formatDate(investment.current_value_updated_at)}`
                  : "Ainda não definido"}
              </span>
              <button
                type="button"
                onClick={() => setValueOpen(true)}
                className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
              >
                <RefreshCw className="size-3" /> Actualizar
              </button>
            </span>
          }
        />
        <StatCard
          label="Resultado"
          value={metrics.result === null ? "—" : formatCurrency(metrics.result, currency)}
          icon={LineChart}
          tone={resultTone}
          hint={metrics.result === null ? "Defina o valor actual" : "Simplificado"}
        />
        <StatCard
          label="ROI simplificado"
          value={metrics.roi === null ? "—" : formatPercent(metrics.roi)}
          icon={Percent}
          tone={metrics.roi === null ? "default" : metrics.roi >= 0 ? "positive" : "negative"}
          hint="Não é retorno anualizado"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Movimentações</CardTitle>
              <Button variant="brand" size="sm" onClick={() => setTransactionOpen(true)}>
                <Plus /> Nova movimentação
              </Button>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <EmptyState
                  icon={ArrowLeftRight}
                  title="Sem movimentações"
                  description="Registe contribuições, despesas, rendimentos ou levantamentos."
                />
              ) : (
                <TransactionTable
                  transactions={transactions}
                  onDelete={setTransactionToDelete}
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Notas</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNoteDialog({ open: true })}
              >
                <Plus /> Nova nota
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {notes.length === 0 ? (
                <EmptyState
                  icon={NotebookPen}
                  title="Sem notas"
                  description="Guarde observações e informações adicionais."
                />
              ) : (
                notes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    showInvestment={false}
                    onEdit={(n) => setNoteDialog({ open: true, note: n })}
                    onDelete={setNoteToDelete}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2.5 text-sm">
                <SummaryRow label="Contribuições" value={formatCurrency(metrics.contributions, currency)} />
                <SummaryRow label="Despesas" value={formatCurrency(metrics.expenses, currency)} />
                <SummaryRow label="Rendimentos" value={formatCurrency(metrics.income, currency)} />
                <SummaryRow label="Levantamentos" value={formatCurrency(metrics.withdrawals, currency)} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2.5 text-sm">
                <SummaryRow label="Data do investimento" value={formatDate(investment.initial_date)} />
                <SummaryRow label="Moeda" value={currency} />
                {CATEGORY_DETAIL_FIELDS[investment.category_id].map((field) => (
                  <SummaryRow
                    key={field.key}
                    label={field.label}
                    value={investment.details[field.key] || "—"}
                  />
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diálogos */}
      <Dialog
        open={transactionOpen}
        onOpenChange={setTransactionOpen}
        title="Nova movimentação"
        description={investment.name}
      >
        <TransactionForm
          investments={[investment]}
          fixedInvestmentId={investment.id}
          onSubmit={(values) => {
            data.addTransaction(values);
            setTransactionOpen(false);
          }}
          onCancel={() => setTransactionOpen(false)}
        />
      </Dialog>

      <Dialog
        open={valueOpen}
        onOpenChange={setValueOpen}
        title="Actualizar valor actual"
        description={investment.name}
      >
        <CurrentValueForm
          currency={currency}
          initialValue={investment.current_value}
          onSubmit={(value) => {
            data.setCurrentValue(investment.id, value);
            setValueOpen(false);
          }}
          onCancel={() => setValueOpen(false)}
        />
      </Dialog>

      <Dialog
        open={noteDialog.open}
        onOpenChange={(open) => setNoteDialog((s) => ({ ...s, open }))}
        title={noteDialog.note ? "Editar nota" : "Nova nota"}
        description={investment.name}
      >
        <NoteForm
          key={noteDialog.note?.id ?? "new"}
          investments={[investment]}
          fixedInvestmentId={investment.id}
          defaultValues={noteDialog.note}
          onSubmit={(values) => {
            if (noteDialog.note) data.updateNote(noteDialog.note.id, values);
            else data.addNote(values);
            setNoteDialog({ open: false });
          }}
          onCancel={() => setNoteDialog({ open: false })}
        />
      </Dialog>

      <ConfirmDialog
        open={deleteInvestmentOpen}
        onOpenChange={setDeleteInvestmentOpen}
        title="Eliminar investimento?"
        description="Serão eliminadas também todas as movimentações e notas associadas. Esta acção não pode ser anulada. Se apenas quer deixar de o ver, arquive-o."
        confirmLabel="Eliminar"
        onConfirm={() => {
          data.deleteInvestment(investment.id);
          router.replace("/investments");
        }}
      />

      <ConfirmDialog
        open={!!transactionToDelete}
        onOpenChange={(open) => !open && setTransactionToDelete(null)}
        title="Eliminar movimentação?"
        description="Isto altera o histórico e os cálculos deste investimento."
        confirmLabel="Eliminar"
        onConfirm={() => transactionToDelete && data.deleteTransaction(transactionToDelete.id)}
      />

      <ConfirmDialog
        open={!!noteToDelete}
        onOpenChange={(open) => !open && setNoteToDelete(null)}
        title="Apagar nota?"
        description="Esta acção não pode ser anulada."
        confirmLabel="Apagar"
        onConfirm={() => noteToDelete && data.deleteNote(noteToDelete.id)}
      />
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-navy">{value}</dd>
    </div>
  );
}
