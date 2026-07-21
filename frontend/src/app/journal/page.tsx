"use client";

import { NotebookText } from "lucide-react";

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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <NotebookText className="size-4" /> Trade Journal
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
