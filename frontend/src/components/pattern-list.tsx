import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PatternHit } from "@/lib/types";

interface PatternListProps {
  patterns: PatternHit[];
  hoveredTime?: string | null;
  onHoverChange?: (time: string | null) => void;
}

export function PatternList({ patterns, hoveredTime, onHoverChange }: PatternListProps) {
  const sorted = [...patterns].reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Sparkles className="size-4" /> Detected Candlestick Patterns
        </CardTitle>
        <CardDescription>
          Most recent first — hover an entry to see where it fired on the chart.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 max-h-105 overflow-y-auto">
        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground">No recognizable patterns in this window.</p>
        )}
        {sorted.map((hit) => (
          <div
            key={hit.time}
            onMouseEnter={() => onHoverChange?.(hit.time)}
            onMouseLeave={() => onHoverChange?.(null)}
            className={cn(
              "flex flex-col gap-2 border-b pb-3 last:border-b-0 last:pb-0 -mx-2 px-2 rounded-md transition-colors",
              hoveredTime === hit.time && "bg-muted"
            )}
          >
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
