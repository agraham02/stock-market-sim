import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PatternHit } from "@/lib/types";

export function PatternList({ patterns }: { patterns: PatternHit[] }) {
  const sorted = [...patterns].reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detected Candlestick Patterns</CardTitle>
        <CardDescription>
          Most recent first — hover the matching marker on the chart to see where it fired.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 max-h-105 overflow-y-auto">
        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground">No recognizable patterns in this window.</p>
        )}
        {sorted.map((hit) => (
          <div key={hit.time} className="flex flex-col gap-2 border-b pb-3 last:border-b-0 last:pb-0">
            <span className="text-xs text-muted-foreground">{hit.time}</span>
            {hit.patterns.map((pattern) => (
              <div key={pattern.name} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant={pattern.direction === "bullish" ? "default" : "destructive"}>
                    {pattern.direction}
                  </Badge>
                  <span className="text-sm font-medium">{pattern.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">{pattern.explanation}</p>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
