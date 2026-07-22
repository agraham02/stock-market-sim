"use client";

import { CandlestickChart as CandlestickChartIcon, Maximize, ZoomIn, ZoomOut } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";

import { CandlestickChart, type CandlestickChartHandle } from "@/components/candlestick-chart";
import { CardHelp } from "@/components/card-help";
import { CatalystPanel } from "@/components/catalyst-panel";
import { LessonPrompt } from "@/components/lesson-prompt";
import { FadeIn } from "@/components/motion/fade-in";
import { OptionsChain } from "@/components/options-chain";
import { PatternList } from "@/components/pattern-list";
import { TutorButton, type TutorButtonHandle } from "@/components/tutor-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSymbolChart } from "@/hooks/use-symbol-chart";
import type { PatternHit, PatternMatch } from "@/lib/types";

export default function SymbolPage() {
  const params = useParams<{ symbol: string }>();
  const symbol = params.symbol.toUpperCase();

  const { data, isPending, isError, error } = useSymbolChart(symbol);
  const [hoveredTime, setHoveredTime] = useState<string | null>(null);
  const chartRef = useRef<CandlestickChartHandle>(null);
  const tutorRef = useRef<TutorButtonHandle>(null);

  function handleAskAboutPattern(hit: PatternHit, pattern: PatternMatch) {
    tutorRef.current?.openWithDraft(
      `Explain the ${pattern.label} pattern that fired on ${symbol} on ${hit.time} — I don't fully understand what it means or why it matters.`
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 max-w-6xl mx-auto w-full">
      <FadeIn className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{symbol}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Daily candlesticks with recognized patterns explained in plain language.
          </p>
        </div>
        <TutorButton ref={tutorRef} contextType="symbol" contextId={symbol} label={`Ask about ${symbol}`} />
      </FadeIn>

      <FadeIn delay={0.02}>
        <LessonPrompt maxOrder={4} />
      </FadeIn>

      {isError && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Couldn&apos;t load {symbol}</CardTitle>
            <CardDescription>{String(error)}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {isPending && !isError && (
        <Card>
          <CardContent className="text-sm text-muted-foreground py-8 text-center">
            Loading chart…
          </CardContent>
        </Card>
      )}

      {data && (
        <FadeIn delay={0.05} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" data-tour="symbol-chart">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-1.5">
                <CandlestickChartIcon className="size-4" /> Price
                <CardHelp title="Reading This Chart">
                  <ul className="flex flex-col gap-2 list-disc pl-4">
                    <li><strong className="text-foreground">Candles</strong> — one per day: the thick body spans open→close (green if close is higher, red if lower), the thin wicks show the day&apos;s high and low.</li>
                    <li><strong className="text-foreground">The faded bars along the bottom are volume</strong> — how many shares traded that day, colored to match that day&apos;s candle. Taller means more shares changed hands.</li>
                    <li><strong className="text-foreground">Arrows above/below candles</strong> — detected candlestick patterns (green up = bullish, red down = bearish, blue = whichever one you&apos;re hovering in the list on the right). Hover an arrow for details.</li>
                    <li><strong className="text-foreground">Dotted horizontal line</strong> — the most recent closing price.</li>
                    <li><strong className="text-foreground">Zoom/reset buttons</strong> (top right) — or just scroll to zoom and drag to pan.</li>
                  </ul>
                </CardHelp>
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => chartRef.current?.zoomIn()}>
                  <ZoomIn className="size-4" />
                  <span className="sr-only">Zoom in</span>
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => chartRef.current?.zoomOut()}>
                  <ZoomOut className="size-4" />
                  <span className="sr-only">Zoom out</span>
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => chartRef.current?.reset()}>
                  <Maximize className="size-4" />
                  <span className="sr-only">Reset view</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CandlestickChart
                ref={chartRef}
                candles={data.candles}
                patterns={data.patterns}
                highlightedTime={hoveredTime}
              />
            </CardContent>
          </Card>
          <PatternList
            patterns={data.patterns}
            hoveredTime={hoveredTime}
            onHoverChange={setHoveredTime}
            onAskAboutPattern={handleAskAboutPattern}
          />
        </FadeIn>
      )}

      <FadeIn delay={0.1}>
        <CatalystPanel symbol={symbol} />
      </FadeIn>

      <FadeIn delay={0.15}>
        <OptionsChain symbol={symbol} underlyingPrice={data?.candles.at(-1)?.close} />
      </FadeIn>
    </div>
  );
}
