"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import {
  CATEGORIES,
  CATEGORY_BY_ID,
  CURRENCIES,
  RISK_OPTIONS,
  STATUS_OPTIONS,
} from "@/lib/constants";
import { todayISO } from "@/lib/utils/format";
import type { CurrencyCode } from "@/types";
import { CATEGORY_DETAIL_FIELDS } from "./category-config";
import { investmentSchema, type InvestmentFormValues } from "./schemas";

export function emptyInvestmentValues(currency: CurrencyCode): InvestmentFormValues {
  return {
    name: "",
    category_id: "FINANCIAL",
    description: "",
    initial_date: todayISO(),
    status: "ACTIVE",
    risk_level: "MEDIUM",
    currency,
    current_value: null,
    initial_capital: null,
    details: {},
  };
}

/** "" → null, senão número. Permite deixar o campo vazio. */
const toNullableNumber = (v: unknown) =>
  v === "" || v === null || v === undefined ? null : Number(v);

interface InvestmentFormProps {
  mode: "create" | "edit";
  defaultValues: InvestmentFormValues;
  onSubmit: (values: InvestmentFormValues) => void;
  onCancel: () => void;
}

export function InvestmentForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
}: InvestmentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentSchema),
    defaultValues,
  });

  const category = useWatch({ control, name: "category_id" });
  const currency = useWatch({ control, name: "currency" });
  const isEdit = mode === "edit";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Informação geral */}
      <section className="grid gap-4 sm:grid-cols-2">
        <FormField
          className="sm:col-span-2"
          label="Nome do investimento"
          htmlFor="name"
          error={errors.name?.message}
        >
          <Input
            id="name"
            placeholder="Ex.: Terreno em Viana"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </FormField>

        <FormField
          label="Categoria"
          htmlFor="category_id"
          error={errors.category_id?.message}
          hint={isEdit ? "A categoria não pode ser alterada." : undefined}
        >
          {isEdit ? (
            <Select id="category_id" disabled value={category}>
              <option value={category}>{CATEGORY_BY_ID[category].name}</option>
            </Select>
          ) : (
            <Select
              id="category_id"
              {...register("category_id", { onChange: () => setValue("details", {}) })}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField
          label="Moeda"
          htmlFor="currency"
          error={errors.currency?.message}
          hint={isEdit ? "A moeda não pode ser alterada." : undefined}
        >
          {isEdit ? (
            <Select id="currency" disabled value={currency}>
              <option value={currency}>
                {CURRENCIES.find((c) => c.code === currency)?.label}
              </option>
            </Select>
          ) : (
            <Select id="currency" {...register("currency")}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </Select>
          )}
        </FormField>

        <FormField
          label="Data do investimento"
          htmlFor="initial_date"
          error={errors.initial_date?.message}
        >
          <Input
            id="initial_date"
            type="date"
            aria-invalid={!!errors.initial_date}
            {...register("initial_date")}
          />
        </FormField>

        <FormField label="Estado" htmlFor="status" error={errors.status?.message}>
          <Select id="status" {...register("status")}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Nível de risco" htmlFor="risk_level" error={errors.risk_level?.message}>
          <Select id="risk_level" {...register("risk_level")}>
            {RISK_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label={`Valor actual estimado (${currency})`}
          htmlFor="current_value"
          error={errors.current_value?.message}
          hint="Opcional. Introduzido manualmente; pode actualizar mais tarde."
        >
          <Input
            id="current_value"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            aria-invalid={!!errors.current_value}
            {...register("current_value", { setValueAs: toNullableNumber })}
          />
        </FormField>

        {!isEdit && (
          <FormField
            className="sm:col-span-2"
            label={`Capital inicial (${currency})`}
            htmlFor="initial_capital"
            error={errors.initial_capital?.message}
            hint="Opcional. É registado como a primeira contribuição do investimento."
          >
            <Input
              id="initial_capital"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              aria-invalid={!!errors.initial_capital}
              {...register("initial_capital", { setValueAs: toNullableNumber })}
            />
          </FormField>
        )}

        <FormField
          className="sm:col-span-2"
          label="Descrição"
          htmlFor="description"
          error={errors.description?.message}
        >
          <Textarea id="description" rows={3} {...register("description")} />
        </FormField>
      </section>

      {/* Detalhes específicos da categoria */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-navy">
          Detalhes — {CATEGORY_BY_ID[category].name}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CATEGORY_DETAIL_FIELDS[category].map((field) => {
            const error = errors.details?.[field.key]?.message;
            const id = `details-${field.key}`;
            return (
              <FormField
                key={`${category}-${field.key}`}
                label={field.required ? `${field.label} *` : field.label}
                htmlFor={id}
                error={error}
              >
                {field.type === "select" ? (
                  <Select id={id} aria-invalid={!!error} {...register(`details.${field.key}`)}>
                    <option value="">Seleccione…</option>
                    {field.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    id={id}
                    placeholder={field.placeholder}
                    aria-invalid={!!error}
                    {...register(`details.${field.key}`)}
                  />
                )}
              </FormField>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="brand" disabled={isSubmitting}>
          {isEdit ? "Guardar alterações" : "Criar investimento"}
        </Button>
      </div>
    </form>
  );
}
