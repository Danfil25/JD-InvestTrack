"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { TRANSACTION_TYPES } from "@/lib/constants";
import { todayISO } from "@/lib/utils/format";
import type { Investment, TransactionType } from "@/types";
import { transactionSchema, type TransactionFormValues } from "./schemas";

interface TransactionFormProps {
  /** Investimentos disponíveis (não arquivados). */
  investments: Investment[];
  /** Quando definido, o investimento fica fixo (ex.: página de detalhe). */
  fixedInvestmentId?: string;
  defaultType?: TransactionType;
  onSubmit: (values: TransactionFormValues) => void;
  onCancel: () => void;
}

export function TransactionForm({
  investments,
  fixedInvestmentId,
  defaultType = "CONTRIBUTION",
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      investment_id: fixedInvestmentId ?? investments[0]?.id ?? "",
      type: defaultType,
      date: todayISO(),
      description: "",
    },
  });

  const investmentId = useWatch({ control, name: "investment_id" });
  const type = useWatch({ control, name: "type" });
  const investment = investments.find((i) => i.id === investmentId);
  const typeInfo = TRANSACTION_TYPES.find((t) => t.value === type);

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
                {i.name} ({i.currency})
              </option>
            ))}
          </Select>
        </FormField>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Tipo"
          htmlFor="type"
          error={errors.type?.message}
          hint={typeInfo?.description}
        >
          <Select id="type" {...register("type")}>
            {TRANSACTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Data" htmlFor="date" error={errors.date?.message}>
          <Input id="date" type="date" aria-invalid={!!errors.date} {...register("date")} />
        </FormField>
      </div>

      <FormField
        label={`Valor${investment ? ` (${investment.currency})` : ""}`}
        htmlFor="amount"
        error={errors.amount?.message}
        hint="A movimentação usa sempre a moeda do investimento."
      >
        <Input
          id="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          aria-invalid={!!errors.amount}
          {...register("amount", { valueAsNumber: true })}
        />
      </FormField>

      <FormField
        label="Descrição"
        htmlFor="description"
        error={errors.description?.message}
      >
        <Textarea id="description" rows={2} {...register("description")} />
      </FormField>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="brand" disabled={isSubmitting || !investment}>
          Registar movimentação
        </Button>
      </div>
    </form>
  );
}
