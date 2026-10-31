"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact, formatCurrency } from "@/lib/utils/format";
import type { SeriesPoint } from "@/lib/finance/calculations";
import type { CurrencyCode } from "@/types";

function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-PT", { month: "short", year: "2-digit" }).format(
    new Date(y, m - 1, 1),
  );
}

/** Capital aplicado acumulado. Só desenha com pelo menos 2 meses de dados. */
export function EvolutionChart({
  series,
  currency,
}: {
  series: SeriesPoint[];
  currency: CurrencyCode;
}) {
  if (series.length < 2) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        A evolução aparece quando existirem contribuições em pelo menos dois meses
        diferentes.
      </p>
    );
  }

  const data = series.map((p) => ({ label: monthLabel(p.month), value: p.value }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16A37A" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#16A37A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E1E6ED" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={48}
            tickFormatter={(v) => formatCompact(Number(v))}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(Number(value), currency), "Capital aplicado"]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#16A37A"
            strokeWidth={2}
            fill="url(#capitalGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
