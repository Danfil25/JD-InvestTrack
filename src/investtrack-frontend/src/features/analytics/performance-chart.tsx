"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact, formatCurrency } from "@/lib/utils/format";
import type { InvestmentWithMetrics } from "@/lib/finance/calculations";
import type { CurrencyCode } from "@/types";

/** Capital aplicado vs. valor actual estimado, por investimento. */
export function PerformanceChart({
  items,
  currency,
}: {
  items: InvestmentWithMetrics[];
  currency: CurrencyCode;
}) {
  const data = items.map(({ investment, metrics }) => ({
    name: investment.name.length > 16 ? `${investment.name.slice(0, 15)}…` : investment.name,
    capital: metrics.contributions,
    value: metrics.currentValue ?? 0,
  }));

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Sem investimentos nesta moeda.
      </p>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E1E6ED" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={48}
            tickFormatter={(v) => formatCompact(Number(v))}
          />
          <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
          <Legend />
          <Bar dataKey="capital" name="Capital aplicado" fill="#142B45" radius={[4, 4, 0, 0]} />
          <Bar dataKey="value" name="Valor actual" fill="#16A37A" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
