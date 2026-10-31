import { z } from "zod";

export const transactionSchema = z.object({
  investment_id: z.string().min(1, "Seleccione o investimento."),
  type: z.enum(["CONTRIBUTION", "EXPENSE", "INCOME", "WITHDRAWAL"]),
  amount: z
    .number({ error: "Introduza um valor válido." })
    .positive("O valor deve ser superior a zero."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Indique uma data válida."),
  description: z.string().trim().max(300, "Máximo de 300 caracteres."),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
