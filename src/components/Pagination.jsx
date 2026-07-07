import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({ page = 1, pageSize = 5, total = 5, onPageChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
      <span>{start}-{end} of {total}</span>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="outline" aria-label="Next page" disabled={page >= pageCount} onClick={() => onPageChange?.(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
