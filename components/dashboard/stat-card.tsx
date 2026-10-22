import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ACCENTS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"];

export function StatCard({
  title,
  value,
  sub,
  trend,
  accent = 0,
}: {
  title: string;
  value: string | number;
  sub?: string;
  trend?: number;
  /** Rotates through the chart-color tokens for the top accent strip. */
  accent?: number;
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className={cn("h-1 w-full", ACCENTS[accent % ACCENTS.length])} />
      <CardContent className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">{title}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {trend >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-4 w-28 mb-4" />
        <Skeleton className="h-8 w-32 mb-1" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}
