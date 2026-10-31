"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/features/auth/auth-provider";
import { profileSchema, type ProfileValues } from "@/features/auth/schemas";
import { CURRENCIES } from "@/lib/constants";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [saved, setSaved] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", currency: user?.currency ?? "AOA" },
  });

  async function onSubmit(values: ProfileValues) {
    await updateProfile(values);
    setSaved(true);
  }

  return (
    <>
      <PageHeader title="Definições" description="Gira o seu perfil e preferências." />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>
            A moeda preferida é a mostrada por omissão nos totais do dashboard e das análises.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            onChange={() => setSaved(false)}
            className="space-y-4"
            noValidate
          >
            <FormField label="Email" htmlFor="email" hint="O email não pode ser alterado aqui.">
              <Input id="email" value={user?.email ?? ""} disabled readOnly />
            </FormField>
            <FormField label="Nome" htmlFor="name" error={errors.name?.message}>
              <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
            </FormField>
            <FormField label="Moeda preferida" htmlFor="currency" error={errors.currency?.message}>
              <Select id="currency" {...register("currency")}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </FormField>
            <div className="flex items-center gap-3">
              <Button type="submit" variant="brand" disabled={isSubmitting}>
                Guardar
              </Button>
              {saved && (
                <span role="status" className="text-sm text-brand">
                  Alterações guardadas.
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
