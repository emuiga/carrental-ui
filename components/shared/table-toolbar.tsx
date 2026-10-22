import { MoreHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

/** "Show: [10] entries" + an overflow "Actions" trigger, above a table. Purely presentational — wire actions up per page. */
export function TableToolbar({
  pageSize,
  onPageSizeChange,
  actions,
}: {
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>Show:</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange?.(Number(v))}>
          <SelectTrigger className="h-7 w-16 text-xs" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50].map((n) => (
              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>entries</span>
      </div>
      {actions ?? (
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <MoreHorizontal className="mr-1 h-3.5 w-3.5" />
          Actions
        </Button>
      )}
    </div>
  );
}
