"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import type { Investment } from "@/types";
import { noteSchema, type NoteFormValues } from "./schemas";

export function NoteForm({
  investments,
  fixedInvestmentId,
  defaultValues,
  submitLabel = "Guardar nota",
  onSubmit,
  onCancel,
}: {
  investments: Investment[];
  fixedInvestmentId?: string;
  defaultValues?: Partial<NoteFormValues>;
  submitLabel?: string;
  onSubmit: (values: NoteFormValues) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      investment_id: fixedInvestmentId ?? investments[0]?.id ?? "",
      title: "",
      content: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {!fixedInvestmentId && (
        <FormField
          label="Investimento"
          htmlFor="investment_id"
          error={errors.investment_id?.message}
        >
          <Select id="investment_id" {...register("investment_id")}>
            {investments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </Select>
        </FormField>
      )}
      <FormField label="Título" htmlFor="title" error={errors.title?.message}>
        <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
      </FormField>
      <FormField label="Conteúdo" htmlFor="content" error={errors.content?.message}>
        <Textarea
          id="content"
          rows={6}
          aria-invalid={!!errors.content}
          {...register("content")}
        />
      </FormField>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="brand" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
