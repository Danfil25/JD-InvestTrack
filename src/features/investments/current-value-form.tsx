"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import type { CurrencyCode } from "@/types";
import { currentValueSchema, type CurrentValueFormValues } from "./schemas";

export function CurrentValueForm({
  currency,
  initialValue,
  onSubmit,
  onCancel,
}: {
  currency: CurrencyCode;
  initialValue: number | null;
  onSubmit: (value: number) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CurrentValueFormValues>({
    resolver: zodResolver(currentValueSchema),
    defaultValues: initialValue === null ? undefined : { current_value: initialValue },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit(v.current_value))}
      className="space-y-4"
      noValidate
    >
      <FormField
        label={`Valor actual estimado (${currency})`}
        htmlFor="current_value"
        error={errors.current_value?.message}
        hint="Avaliação manual do valor deste investimento hoje."
      >
        <Input
          id="current_value"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          autoFocus
          aria-invalid={!!errors.current_value}
          {...register("current_value", { valueAsNumber: true })}
        />
      </FormField>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="brand">
          Guardar valor
        </Button>
      </div>
    </form>
  );
}
