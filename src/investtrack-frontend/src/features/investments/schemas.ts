import { z } from "zod";
import { CATEGORIES, CURRENCIES, RISK_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";
import { CATEGORY_DETAIL_FIELDS } from "./category-config";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Indique uma data válida.");
const optionalMoney = z
  .number({ error: "Introduza um valor válido." })
  .min(0, "O valor não pode ser negativo.")
  .nullable();

export const investmentSchema = z
  .object({
    name: z.string().trim().min(2, "Introduza o nome do investimento.").max(120),
    category_id: z.enum(CATEGORIES.map((c) => c.id) as ["FINANCIAL", "REAL_ESTATE", "BUSINESS", "PERSONAL"]),
    description: z.string().trim().max(500, "Máximo de 500 caracteres."),
    initial_date: dateString,
    status: z.enum(STATUS_OPTIONS.map((s) => s.value) as ["ACTIVE", "CLOSED", "ARCHIVED"]),
    risk_level: z.enum(RISK_OPTIONS.map((r) => r.value) as ["LOW", "MEDIUM", "HIGH"]),
    currency: z.enum(CURRENCIES.map((c) => c.code) as ["AOA", "USD", "EUR"]),
    current_value: optionalMoney,
    /** Só usado na criação: gera a primeira transacção CONTRIBUTION. */
    initial_capital: optionalMoney,
    details: z.record(z.string(), z.string()),
  })
  .superRefine((value, ctx) => {
    // `details` é validado de acordo com a categoria escolhida.
    for (const field of CATEGORY_DETAIL_FIELDS[value.category_id]) {
      if (field.required && !value.details[field.key]?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["details", field.key],
          message: "Campo obrigatório.",
        });
      }
      if (field.type === "select" && value.details[field.key]) {
        if (!field.options?.includes(value.details[field.key])) {
          ctx.addIssue({
            code: "custom",
            path: ["details", field.key],
            message: "Opção inválida.",
          });
        }
      }
    }
  });

export type InvestmentFormValues = z.infer<typeof investmentSchema>;

export const currentValueSchema = z.object({
  current_value: z
    .number({ error: "Introduza um valor válido." })
    .min(0, "O valor não pode ser negativo."),
});
export type CurrentValueFormValues = z.infer<typeof currentValueSchema>;
