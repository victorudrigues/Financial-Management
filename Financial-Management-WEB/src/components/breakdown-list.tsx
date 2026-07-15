import { formatCurrency } from "@/lib/format";

interface BreakdownEntry {
  key: string;
  name: string;
  amount: number;
  color?: string | null;
}

export function BreakdownList({ entries, emptyLabel }: { entries: BreakdownEntry[]; emptyLabel: string }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const percent = total === 0 ? 0 : Math.round((entry.amount / total) * 100);
        return (
          <div key={entry.key} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color ?? "var(--primary)" }}
                />
                {entry.name}
              </span>
              <span className="text-muted-foreground">{formatCurrency(entry.amount)} · {percent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full"
                style={{ width: `${percent}%`, backgroundColor: entry.color ?? "var(--primary)" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
