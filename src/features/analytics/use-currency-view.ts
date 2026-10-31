"use client";

import * as React from "react";
import { resolveCurrency } from "@/components/shared/currency-switcher";
import type { CurrencyCode, Investment } from "@/types";

/**
 * Escolhe a moeda a mostrar em vistas agregadas.
 * Nunca soma moedas diferentes (regra 8): mostra uma de cada vez.
 */
export function useCurrencyView(investments: Investment[], preferred: CurrencyCode) {
  const [chosen, setChosen] = React.useState<CurrencyCode | null>(null);

  const available = React.useMemo(
    () => [...new Set(investments.map((i) => i.currency))],
    [investments],
  );
  const currency = resolveCurrency(chosen, preferred, available);

  return { currency, setCurrency: setChosen, available };
}
