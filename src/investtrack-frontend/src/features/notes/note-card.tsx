"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format";
import type { Investment, Note } from "@/types";

export function NoteCard({
  note,
  investment,
  showInvestment = true,
  onEdit,
  onDelete,
}: {
  note: Note;
  investment?: Investment;
  showInvestment?: boolean;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}) {
  return (
    <Card className="flex flex-col gap-2 p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-navy">{note.title}</h3>
        <div className="-mr-2 -mt-1 flex shrink-0">
          <Button variant="ghost" size="icon" aria-label="Editar nota" onClick={() => onEdit(note)}>
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Apagar nota"
            onClick={() => onDelete(note)}
          >
            <Trash2 className="text-danger" />
          </Button>
        </div>
      </div>
      <p className="whitespace-pre-line text-sm text-muted-foreground">{note.content}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {showInvestment && investment && (
          <Link
            href={`/investments/${investment.id}`}
            className="font-medium text-brand hover:underline"
          >
            {investment.name}
          </Link>
        )}
        <span>Actualizada em {formatDate(note.updated_at)}</span>
      </div>
    </Card>
  );
}
