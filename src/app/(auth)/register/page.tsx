"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/constants";
import { useAuth } from "@/features/auth/auth-provider";
import { registerSchema, type RegisterValues } from "@/features/auth/schemas";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { currency: DEFAULT_CURRENCY },
  });

  async function onSubmit(values: RegisterValues) {
    setError(null);
    try {
      await signUp({ 
        name: values.name, 
        email: values.email, 
        currency: values.currency,
        password: values.password 
      });
      router.replace("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível criar a conta.");
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-navy">Criar conta</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Comece a organizar os seus investimentos.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <FormField label="Nome" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FormField>
        <FormField
          label="Moeda preferida"
          htmlFor="currency"
          error={errors.currency?.message}
          hint="Moeda mostrada por omissão nos totais."
        >
          <Select id="currency" {...register("currency")}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Palavra-passe" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>
        <FormField
          label="Confirmar palavra-passe"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </FormField>

        {error && (
          <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" variant="brand" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "A criar conta…" : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Iniciar sessão
        </Link>
      </p>
    </>
  );
}
