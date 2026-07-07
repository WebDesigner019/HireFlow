import { ShieldCheck, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPercent } from "@/lib/utils";

export function ConfidenceBadge({ value }) {
  const percent = value <= 1 ? value * 100 : value;
  const variant = percent >= 85 ? "green" : percent >= 75 ? "amber" : "red";
  const Icon = percent >= 75 ? ShieldCheck : TriangleAlert;

  return (
    <Badge variant={variant}>
      <Icon className="h-3.5 w-3.5" />
      {formatPercent(value)} confidence
    </Badge>
  );
}
