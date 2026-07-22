"use client";

import { NotebookText } from "lucide-react";

import { CardHelp } from "@/components/card-help";
import { FadeIn } from "@/components/motion/fade-in";
import { JournalTable } from "@/components/journal-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useJournal } from "@/hooks/use-journal";

export default function JournalPage() {
  const { data: entries, isPending, isError } = useJournal();

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 max-w-4xl mx-auto w-full">
      <FadeIn>
        <h1 className="text-2xl font-semibold tracking-tight">Journal</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Every trade&apos;s thesis, and whether direction, magnitude, timing, and IV read were right.
        </p>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card data-tour="journal-table">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <NotebookText className="size-4" /> Trade Journal
              <CardHelp title="Trade Journal">
                <p>Every closed trade&apos;s stated thesis, graded against what actually happened on four dimensions:</p>
                <ul className="flex flex-col gap-2 list-disc pl-4">
                  <li><strong className="text-foreground">Direction</strong> — did the underlying move the way you predicted?</li>
                  <li><strong className="text-foreground">Magnitude</strong> — was the move at least as big as you expected?</li>
                  <li><strong className="text-foreground">Timing</strong> — did it happen within your stated timeframe?</li>
                  <li><strong className="text-foreground">IV crush</strong> — even if you were right, did the drop in implied volatility after the catalyst eat the gain anyway?</li>
                </ul>
                <p>Grading only happens after a trade closes or expires — open positions won&apos;t show grades yet.</p>
              </CardHelp>
            </CardTitle>
            <CardDescription>Most recent first.</CardDescription>
          </CardHeader>
          <CardContent>
            {isPending && <p className="text-sm text-muted-foreground">Loading…</p>}
            {isError && <p className="text-sm text-destructive">Couldn&apos;t load the journal.</p>}
            {entries && <JournalTable entries={entries} />}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
