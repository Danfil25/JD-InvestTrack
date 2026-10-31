"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, LineChart, NotebookPen } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { useAuth } from "@/features/auth/auth-provider";

const HIGHLIGHTS = [
  { icon: NotebookPen, text: "Registe onde investiu, quanto e quando." },
  { icon: LineChart, text: "Acompanhe resultados e distribuição por categoria." },
  { icon: ShieldCheck, text: "Os seus dados são privados e só seus." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-navy p-12 text-white lg:flex">
        <Logo light />
        <div>
          <h2 className="max-w-md text-3xl font-semibold leading-tight">
            Todos os seus investimentos, organizados num só lugar.
          </h2>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/80">
                <span className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="size-[18px]" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/50">
          O InvestTrack é uma ferramenta de registo e acompanhamento. Não executa
          transacções financeiras.
        </p>
      </div>

      <div className="flex flex-col justify-center bg-white px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Logo className="mb-8 lg:hidden" />
          {children}
        </div>
      </div>
    </div>
  );
}
