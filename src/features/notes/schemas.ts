import { z } from "zod";

export const noteSchema = z.object({
  investment_id: z.string().min(1, "Seleccione o investimento."),
  title: z.string().trim().min(2, "Introduza um título.").max(120),
  content: z.string().trim().min(1, "Escreva o conteúdo da nota.").max(5000),
});

export type NoteFormValues = z.infer<typeof noteSchema>;
