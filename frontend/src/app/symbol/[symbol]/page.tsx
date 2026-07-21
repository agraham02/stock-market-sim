"use client";

import { CandlestickChart as CandlestickChartIcon } from "lucide-react";
import { useParams } from "next/navigation";

import { CandlestickChart } from "@/components/candlestick-chart";
import { LessonPrompt } from "@/components/lesson-prompt";
import { FadeIn } from "@/components/motion/fade-in";
import { OptionsChain } from "@/components/options-chain";
import { PatternList } from "@/components/pattern-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSymbolChart } from "@/hooks/use-symbol-chart";

export default function SymbolPage() {
  const params = useParams<{ symbol: string }>();
  const symbol = params.symbol.toUpperCase();

  const { data, isPending, isError, error } = useSymbolChart(symbol);

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 max-w-6xl mx-auto w-full">
      <FadeIn>
        <h1 className="text-2xl font-semibold tracking-tight">{symbol}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Daily candlesticks with recognized patterns explained in plain language.
        </p>
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
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5">
                <CandlestickChartIcon className="size-4" /> Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CandlestickChart candles={data.candles} patterns={data.patterns} />
            </CardContent>
          </Card>
          <PatternList patterns={data.patterns} />
        </FadeIn>
      )}

      <FadeIn delay={0.1}>
        <OptionsChain symbol={symbol} />
      </FadeIn>
    </div>
  );
}
