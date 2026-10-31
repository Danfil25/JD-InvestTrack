import type { CategoryCode } from "@/types";

export interface DetailField {
  key: string;
  label: string;
  type: "text" | "select";
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

/**
 * Campos específicos de cada categoria (guardados em `details`, JSONB).
 * A mesma configuração gera o formulário e alimenta a validação (Zod),
 * garantindo que `details` é sempre validado de acordo com a categoria.
 */
export const CATEGORY_DETAIL_FIELDS: Record<CategoryCode, DetailField[]> = {
  FINANCIAL: [
    {
      key: "asset_type",
      label: "Tipo de activo",
      type: "select",
      required: true,
      options: ["Acções", "Obrigações", "Fundos", "Criptomoedas", "Depósito a prazo"],
    },
    { key: "institution", label: "Instituição / plataforma", type: "text", placeholder: "Ex.: Banco, corretora" },
    { key: "instrument", label: "Instrumento / emitente", type: "text", placeholder: "Ex.: Obrigações do Tesouro" },
  ],
  REAL_ESTATE: [
    {
      key: "property_type",
      label: "Tipo de investimento",
      type: "select",
      required: true,
      options: ["Terreno", "Imóvel", "Arrendamento", "Construção", "Reabilitação"],
    },
    { key: "location", label: "Localização", type: "text", placeholder: "Ex.: Viana, Luanda" },
    { key: "area", label: "Área (m²)", type: "text", placeholder: "Ex.: 450" },
  ],
  BUSINESS: [
    {
      key: "business_type",
      label: "Tipo de investimento",
      type: "select",
      required: true,
      options: [
        "Criação de negócio",
        "Participação em empresa",
        "Aquisição de equipamentos",
        "Financiamento de actividade",
      ],
    },
    { key: "company", label: "Empresa / negócio", type: "text" },
    { key: "ownership", label: "Participação (%)", type: "text", placeholder: "Ex.: 25" },
  ],
  PERSONAL: [
    {
      key: "personal_type",
      label: "Tipo de investimento",
      type: "select",
      required: true,
      options: ["Curso", "Formação", "Certificação", "Desenvolvimento de competências"],
    },
    { key: "institution", label: "Instituição / formador", type: "text" },
    { key: "expected_end", label: "Conclusão prevista", type: "text", placeholder: "Ex.: Dezembro 2026" },
  ],
};

/** Mantém apenas as chaves permitidas pela categoria (descarta o resto). */
export function pickDetails(
  category: CategoryCode,
  details: Record<string, string | undefined>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of CATEGORY_DETAIL_FIELDS[category]) {
    const value = details[field.key]?.trim();
    if (value) result[field.key] = value;
  }
  return result;
}
