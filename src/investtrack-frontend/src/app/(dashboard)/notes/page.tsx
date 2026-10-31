"use client";

import * as React from "react";
import { NotebookPen, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { NoteCard } from "@/features/notes/note-card";
import { NoteForm } from "@/features/notes/note-form";
import { useData } from "@/lib/data/data-provider";
import type { Note } from "@/types";

export default function NotesPage() {
  const { investments, notes, addNote, updateNote, deleteNote, ready } = useData();
  const [query, setQuery] = React.useState("");
  const [investmentFilter, setInvestmentFilter] = React.useState("ALL");
  const [dialog, setDialog] = React.useState<{ open: boolean; note?: Note }>({ open: false });
  const [toDelete, setToDelete] = React.useState<Note | null>(null);

  const investmentsById = React.useMemo(
    () => new Map(investments.map((i) => [i.id, i])),
    [investments],
  );
  const selectable = React.useMemo(
    () => investments.filter((i) => i.status !== "ARCHIVED"),
    [investments],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes
      .filter((n) => investmentFilter === "ALL" || n.investment_id === investmentFilter)
      .filter(
        (n) => !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
      )
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }, [notes, query, investmentFilter]);

  return (
    <>
      <PageHeader
        title="Notas"
        description="Observações e informações associadas aos seus investimentos."
        actions={
          <Button
            variant="brand"
            disabled={selectable.length === 0}
            onClick={() => setDialog({ open: true })}
          >
            <Plus /> Nova nota
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Pesquisar notas"
            placeholder="Pesquisar nas notas…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
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
      </div>

      {!ready ? (
        <Skeleton className="h-40" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title={notes.length === 0 ? "Sem notas" : "Nenhuma nota encontrada"}
          description={
            selectable.length === 0
              ? "Crie primeiro um investimento para lhe associar notas."
              : notes.length === 0
                ? "Crie a primeira nota."
                : "Ajuste a pesquisa ou o filtro."
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              investment={investmentsById.get(note.investment_id)}
              onEdit={(n) => setDialog({ open: true, note: n })}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      <Dialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((s) => ({ ...s, open }))}
        title={dialog.note ? "Editar nota" : "Nova nota"}
      >
        <NoteForm
          key={dialog.note?.id ?? "new"}
          investments={selectable.length > 0 ? selectable : investments}
          defaultValues={dialog.note}
          onSubmit={(values) => {
            if (dialog.note) updateNote(dialog.note.id, values);
            else addNote(values);
            setDialog({ open: false });
          }}
          onCancel={() => setDialog({ open: false })}
        />
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Apagar nota?"
        description="Esta acção não pode ser anulada."
        confirmLabel="Apagar"
        onConfirm={() => toDelete && deleteNote(toDelete.id)}
      />
    </>
  );
}
