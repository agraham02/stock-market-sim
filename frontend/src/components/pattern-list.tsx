import { MessageCircleQuestion, Sparkles } from "lucide-react";

import { CardHelp } from "@/components/card-help";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PatternHit, PatternMatch } from "@/lib/types";

interface PatternListProps {
  patterns: PatternHit[];
  hoveredTime?: string | null;
  onHoverChange?: (time: string | null) => void;
  onAskAboutPattern?: (hit: PatternHit, pattern: PatternMatch) => void;
}

export function PatternList({ patterns, hoveredTime, onHoverChange, onAskAboutPattern }: PatternListProps) {
  const sorted = [...patterns].reverse();

  return (
    <Card data-tour="symbol-patterns">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Sparkles className="size-4" /> Detected Candlestick Patterns
          <CardHelp title="Detected Candlestick Patterns">
            <p>A pattern is a specific, named shape one or more candles form — each one is checked independently against the price data.</p>
            <ul className="flex flex-col gap-2 list-disc pl-4">
              <li><strong className="text-foreground">Bullish / bearish badge</strong> — which direction that specific pattern suggests, not a verdict on the whole day.</li>
              <li><strong className="text-foreground">Why a day can show several patterns, sometimes disagreeing</strong> — around 58 pattern definitions are checked independently, some looking at just one candle (like a Doji), others at 2-3 candles ending that day. A single candle&apos;s shape can satisfy multiple definitions at once, and different patterns can genuinely point in different directions on the same day. That&apos;s normal, not a bug — real technical signals conflict, and weighing disagreeing signals is part of the skill.</li>
              <li><strong className="text-foreground">Hovering</strong> a pattern highlights where it fired on the chart; hovering a marker on the chart itself shows the same explanation.</li>
              <li>The <MessageCircleQuestion className="inline size-3.5 -translate-y-px" /> icon opens the AI tutor with a question pre-filled about that specific pattern.</li>
            </ul>
          </CardHelp>
        </CardTitle>
        <CardDescription>
          Most recent first — hover an entry to see where it fired on the chart.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 max-h-105 overflow-y-auto contain-[layout]">
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
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={pattern.direction === "bullish" ? "default" : "destructive"}>
                      {pattern.direction}
                    </Badge>
                    <span className="text-sm font-medium">{pattern.label}</span>
                  </div>
                  {onAskAboutPattern && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0"
                      onClick={() => onAskAboutPattern(hit, pattern)}
                    >
                      <MessageCircleQuestion className="size-3.5" />
                      <span className="sr-only">Ask the AI tutor about {pattern.label}</span>
                    </Button>
                  )}
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
