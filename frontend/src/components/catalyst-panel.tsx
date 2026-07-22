"use client";

import { formatDistanceToNow } from "date-fns";
import { CalendarClock, Loader2, Newspaper, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCatalystPanel, useSentiment } from "@/hooks/use-catalysts";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SentimentResult } from "@/lib/types";

function sentimentBadgeVariant(label: string): "default" | "destructive" | "outline" {
  if (label.includes("Bullish")) return "default";
  if (label.includes("Bearish")) return "destructive";
  return "outline";
}

export function CatalystPanel({ symbol }: { symbol: string }) {
  const { data, isPending, isError } = useCatalystPanel(symbol);
  const sentiment = useSentiment(symbol);

  const noKeysConfigured =
    !isPending && !isError && data?.news.length === 0 && data?.earnings.length === 0;

  return (
    <Card data-tour="symbol-catalysts">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-1.5">
            <Newspaper className="size-4" /> Catalysts & News
          </CardTitle>
          <CardDescription>Recent headlines, upcoming earnings, and on-demand sentiment.</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => sentiment.mutate()}
          disabled={sentiment.isPending}
        >
          {sentiment.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Check sentiment
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isPending && <p className="text-sm text-muted-foreground py-4 text-center">Loading catalysts…</p>}
        {isError && <p className="text-sm text-destructive py-4 text-center">Couldn&apos;t load catalyst data.</p>}

        {noKeysConfigured && (
          <p className="text-sm text-muted-foreground">
            No catalyst data available — add <code className="text-xs">FINNHUB_API_KEY</code> to{" "}
            <code className="text-xs">backend/.env</code> to enable news and earnings.
          </p>
        )}

        {data && data.earnings.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.earnings.map((event) => (
              <Badge key={event.date} variant="secondary" className="gap-1.5 h-6 px-2.5">
                <CalendarClock className="size-3" />
                Earnings {event.date}
                {event.hour ? ` (${event.hour})` : ""}
              </Badge>
            ))}
          </div>
        )}

        {data && data.news.length > 0 && (
          <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
            {data.news.map((article) => (
              <a
                key={article.url}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0 -mx-2 px-2 py-1 rounded-md transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">{article.source}</span>
                  <span>{formatDistanceToNow(new Date(article.datetime), { addSuffix: true })}</span>
                </div>
                <p className="text-sm font-medium leading-snug">{article.headline}</p>
              </a>
            ))}
          </div>
        )}

        {sentiment.isError && (
          <p className="text-sm text-destructive">
            {sentiment.error instanceof ApiError ? sentiment.error.message : "Sentiment request failed."}
          </p>
        )}

        {sentiment.data && <SentimentSummary result={sentiment.data} />}
      </CardContent>
    </Card>
  );
}

function SentimentSummary({ result }: { result: SentimentResult }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Alpha Vantage sentiment</span>
        {result.average_sentiment_label && (
          <Badge variant={sentimentBadgeVariant(result.average_sentiment_label)}>
            {result.average_sentiment_label}
            {result.average_sentiment_score != null && ` (${result.average_sentiment_score.toFixed(2)})`}
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {result.cached ? "Cached" : "Fresh"} · {formatDistanceToNow(new Date(result.fetched_at), { addSuffix: true })}
      </p>
      {result.articles.length === 0 && (
        <p className="text-sm text-muted-foreground">No recent sentiment-scored articles found.</p>
      )}
      {result.articles.slice(0, 5).map((article) => (
        <a
          key={article.url}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("flex items-center justify-between gap-2 text-sm hover:underline")}
        >
          <span className="truncate">{article.title}</span>
          {article.ticker_sentiment && (
            <Badge variant={sentimentBadgeVariant(article.ticker_sentiment.sentiment_label)} className="shrink-0">
              {article.ticker_sentiment.sentiment_label}
            </Badge>
          )}
        </a>
      ))}
    </div>
  );
}
