import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page, pageSize, total, onPageChange,
}: { page: number; pageSize: number; total: number; onPageChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border p-3">
      <span className="text-xs text-muted-foreground">
        Menampilkan {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} dari {total}
      </span>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="outline" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((p) => (
          <Button key={p} size="sm" variant={p === page ? "default" : "outline"} onClick={() => onPageChange(p)}>
            {p}
          </Button>
        ))}
        <Button size="sm" variant="outline" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
