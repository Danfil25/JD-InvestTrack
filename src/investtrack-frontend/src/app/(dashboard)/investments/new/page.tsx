"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/features/auth/auth-provider";
import {
  InvestmentForm,
  emptyInvestmentValues,
} from "@/features/investments/investment-form";
import { useData } from "@/lib/data/data-provider";

export default function NewInvestmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createInvestment } = useData();

  return (
    <>
      <PageHeader
        title="Novo investimento"
        description="Registe onde investiu, quanto e quando."
      />
      <Card className="max-w-3xl">
        <CardContent className="p-5 sm:p-6">
          <InvestmentForm
            mode="create"
            defaultValues={emptyInvestmentValues(user?.currency ?? "AOA")}
            onSubmit={(values) => {
              const created = createInvestment(values);
              router.push(`/investments/${created.id}`);
            }}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </>
  );
}
