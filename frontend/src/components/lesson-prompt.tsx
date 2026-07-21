"use client";

import { Lightbulb } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { useLessons } from "@/hooks/use-lessons";

/** Surfaces the next incomplete lesson at or below `maxOrder`, or nothing once caught up. */
export function LessonPrompt({ maxOrder }: { maxOrder: number }) {
  const { data: lessons } = useLessons();
  const nextIncomplete = lessons?.find((l) => l.order <= maxOrder && !l.completed_at);

  if (!nextIncomplete) return null;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex items-center gap-3 py-3">
        <Lightbulb className="size-4 text-primary shrink-0" />
        <p className="text-sm flex-1">
          <Link href="/learn" className="underline font-medium">
            Lesson {nextIncomplete.order}: {nextIncomplete.title}
          </Link>{" "}
          covers this — worth a 5-minute read before you go further.
        </p>
      </CardContent>
    </Card>
  );
}
