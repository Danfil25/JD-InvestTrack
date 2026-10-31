"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/auth-provider";
import { DataProvider } from "@/lib/data/data-provider";

/**
 * Protecção das rotas privadas (provisória, do lado do cliente).
 * Com o Supabase, a protecção real passa para o middleware/proxy do Next.js
 * + RLS na base de dados; este guard fica apenas como apoio de UX.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <DataProvider userId={user.id}>
      <AppShell>{children}</AppShell>
    </DataProvider>
  );
}
