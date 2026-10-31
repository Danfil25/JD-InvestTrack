"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORY_BY_ID } from "@/lib/constants";
import { formatCurrency, formatPercent } from "@/lib/utils/format";
import type { CategorySlice } from "@/lib/finance/calculations";
import type { CurrencyCode } from "@/types";

export function CategoryChart({
  slices,
  currency,
}: {
  slices: CategorySlice[];
  currency: CurrencyCode;
}) {
  const data = slices
    .filter((s) => s.capitalApplied > 0)
    .map((s) => ({
      name: CATEGORY_BY_ID[s.category].name,
      value: s.capitalApplied,
      color: CATEGORY_BY_ID[s.category].color,
    }));
  const total = data.reduce((acc, d) => acc + d.value, 0);

  if (total === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Registe contribuições para ver a distribuição por categoria.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-52 w-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-2.5 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-navy">
              <span
                className="size-3 rounded-sm"
                style={{ backgroundColor: d.color }}
                aria-hidden
              />
              {d.name}
            </span>
            <span className="text-right text-muted-foreground">
              <span className="font-medium text-navy">
                {formatCurrency(d.value, currency)}
              </span>{" "}
              · {formatPercent((d.value / total) * 100)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
