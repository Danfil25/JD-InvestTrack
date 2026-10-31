import { Badge } from "@/components/ui/badge";
import { CATEGORY_BY_ID, RISK_LABEL, STATUS_LABEL } from "@/lib/constants";
import type { CategoryCode, InvestmentStatus, RiskLevel } from "@/types";

export function CategoryBadge({ category }: { category: CategoryCode }) {
  const config = CATEGORY_BY_ID[category];
  const Icon = config.icon;
  return (
    <Badge variant="neutral">
      <Icon className="size-3" />
      {config.name}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: InvestmentStatus }) {
  return (
    <Badge variant={status === "ACTIVE" ? "brand" : "neutral"}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return (
    <Badge variant={risk === "HIGH" ? "danger" : risk === "MEDIUM" ? "neutral" : "brand"}>
      Risco {RISK_LABEL[risk].toLowerCase()}
    </Badge>
  );
}
