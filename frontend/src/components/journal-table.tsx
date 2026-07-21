import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { JournalEntry } from "@/lib/types";

function GradeBadge({ label, value }: { label: string; value: boolean | null }) {
  if (value === null) {
    return (
      <Badge variant="outline" className="justify-between gap-2 w-full">
        {label} <span className="text-muted-foreground">N/A</span>
      </Badge>
    );
  }
  return (
    <Badge variant={value ? "default" : "destructive"} className="justify-between gap-2 w-full">
      {label} <span>{value ? "✓" : "✗"}</span>
    </Badge>
  );
}

const CATALYST_LABELS: Record<string, string> = {
  earnings: "Earnings",
  news: "News",
  technical_setup: "Technical Setup",
  momentum: "Momentum",
  macro_event: "Macro Event",
  none: "None",
};

export function JournalTable({ entries }: { entries: JournalEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No journal entries yet — every trade you place records its thesis here, graded once it closes.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry) => {
        const isGraded = entry.status !== "open";
        const actualMovePct =
          entry.underlying_price_at_exit != null
            ? (entry.underlying_price_at_exit - entry.underlying_price_at_entry) / entry.underlying_price_at_entry
            : null;

        return (
          <Card key={entry.id}>
            <CardContent className="flex flex-col gap-3 pt-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{entry.symbol}</span>
                  <span className="text-sm text-muted-foreground capitalize">
                    {entry.option_type !== "none" &&
                      `${entry.strike} ${entry.option_type} · ${entry.expiration}`}
                  </span>
                  <Badge variant="secondary">{CATALYST_LABELS[entry.catalyst]}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
              </div>

              <p className="text-sm">{entry.timeframe_rationale}</p>

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>
                  Direction: <span className="text-foreground capitalize">{entry.direction}</span>
                </span>
                <span>
                  Expected move: <span className="text-foreground">{(entry.expected_magnitude * 100).toFixed(1)}%</span>
                </span>
                {entry.iv_at_entry != null && (
                  <span>
                    IV at entry: <span className="text-foreground">{(entry.iv_at_entry * 100).toFixed(0)}%</span>
                  </span>
                )}
                <span>
                  Confidence: <span className="text-foreground">{entry.confidence}/5</span>
                </span>
                <span>
                  Underlying: <span className="text-foreground">${entry.underlying_price_at_entry.toFixed(2)}</span>
                  {entry.underlying_price_at_exit != null && (
                    <>
                      {" → "}
                      <span className="text-foreground">${entry.underlying_price_at_exit.toFixed(2)}</span>
                      {actualMovePct != null && (
                        <span className={actualMovePct >= 0 ? "text-green-500" : "text-red-500"}>
                          {" "}
                          ({actualMovePct >= 0 ? "+" : ""}
                          {(actualMovePct * 100).toFixed(1)}%)
                        </span>
                      )}
                    </>
                  )}
                </span>
              </div>

              {isGraded ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <GradeBadge label="Direction" value={entry.grade_direction} />
                  <GradeBadge label="Magnitude" value={entry.grade_magnitude} />
                  <GradeBadge label="Timing" value={entry.grade_timing} />
                  <GradeBadge label="IV Crush" value={entry.grade_iv_crush} />
                </div>
              ) : (
                <Badge variant="outline" className="w-fit">
                  Grading pending — position still open
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
