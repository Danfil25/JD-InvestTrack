import { z } from "zod";
import { CURRENCIES } from "@/lib/constants";

const email = z.string().trim().min(1, "Introduza o email.").email("Email inválido.");
const password = z.string().min(8, "A palavra-passe deve ter pelo menos 8 caracteres.");
const currencyCodes = CURRENCIES.map((c) => c.code) as ["AOA", "USD", "EUR"];

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Introduza a palavra-passe."),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Introduza o seu nome."),
    email,
    currency: z.enum(currencyCodes),
    password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "As palavras-passe não coincidem.",
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Introduza o seu nome."),
  currency: z.enum(currencyCodes),
});
export type ProfileValues = z.infer<typeof profileSchema>;
