"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { InvestmentForm } from "@/features/investments/investment-form";
import type { InvestmentFormValues } from "@/features/investments/schemas";
import { useData } from "@/lib/data/data-provider";

export default function EditInvestmentPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { investments, updateInvestment, ready } = useData();
  const investment = investments.find((i) => i.id === id);

  if (!ready) return <Skeleton className="h-96 max-w-3xl" />;

  if (!investment) {
    return (
      <EmptyState
        icon={Wallet}
        title="Investimento não encontrado"
        action={
          <Link href="/investments" className={buttonVariants({ variant: "outline" })}>
            Voltar aos investimentos
          </Link>
        }
      />
    );
  }

  const defaultValues: InvestmentFormValues = {
    name: investment.name,
    category_id: investment.category_id,
    description: investment.description ?? "",
    initial_date: investment.initial_date,
    status: investment.status,
    risk_level: investment.risk_level,
    currency: investment.currency,
    current_value: investment.current_value,
    initial_capital: null,
    details: investment.details,
  };

  return (
    <>
      <PageHeader title="Editar investimento" description={investment.name} />
      <Card className="max-w-3xl">
        <CardContent className="p-5 sm:p-6">
          <InvestmentForm
            mode="edit"
            defaultValues={defaultValues}
            onSubmit={(values) => {
              updateInvestment(investment.id, values);
              router.push(`/investments/${investment.id}`);
            }}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </>
  );
}
