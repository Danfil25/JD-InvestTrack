"use client";

import { Select } from "@/components/ui/input";
import { CURRENCIES } from "@/lib/constants";
import type { CurrencyCode } from "@/types";

/**
 * Selector de moeda para vistas agregadas. Os totais nunca misturam moedas
 * (regra 8): cada vista mostra uma moeda de cada vez.
 */
export function CurrencySwitcher({
  value,
  available,
  onChange,
}: {
  value: CurrencyCode;
  available: CurrencyCode[];
  onChange: (currency: CurrencyCode) => void;
}) {
  if (available.length <= 1) return null;
  return (
    <Select
      aria-label="Moeda"
      className="h-9 w-auto min-w-36"
      value={value}
      onChange={(e) => onChange(e.target.value as CurrencyCode)}
    >
      {CURRENCIES.filter((c) => available.includes(c.code)).map((c) => (
        <option key={c.code} value={c.code}>
          {c.label}
        </option>
      ))}
    </Select>
  );
}

/** Moeda a mostrar: a escolhida (se existir nos dados), senão a preferida, senão a primeira. */
export function resolveCurrency(
  chosen: CurrencyCode | null,
  preferred: CurrencyCode,
  available: CurrencyCode[],
): CurrencyCode {
  if (chosen && available.includes(chosen)) return chosen;
  if (available.includes(preferred)) return preferred;
  return available[0] ?? preferred;
}
