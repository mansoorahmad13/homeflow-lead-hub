import { Badge } from "@/components/ui/badge";
import type { LeadStatus } from "@/data/mockLeads";
import { cn } from "@/lib/utils";

const statusStyles: Record<LeadStatus, string> = {
  Sold: "bg-status-sold/15 text-status-sold border-status-sold/30",
  Rejected: "bg-status-rejected/15 text-status-rejected border-status-rejected/30",
  Pending: "bg-status-pending/15 text-status-pending border-status-pending/30",
  Error: "bg-status-error/15 text-status-error border-status-error/30",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", statusStyles[status])}>
      {status}
    </Badge>
  );
}
