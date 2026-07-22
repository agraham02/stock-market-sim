"use client";

import { Check, ListChecks, X } from "lucide-react";
import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/types";

export function LessonQuiz({ questions }: { questions: QuizQuestion[] }) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <ListChecks className="size-4" /> Check Yourself
        </CardTitle>
        <CardDescription>Optional — pick an answer to see if you&apos;re right and why.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {questions.map((question) => {
          const selectedChoiceId = selected[question.id];
          const selectedChoice = question.choices.find((c) => c.id === selectedChoiceId);

          return (
            <div key={question.id} className="flex flex-col gap-2">
              <p className="text-sm font-medium">{question.prompt}</p>
              <div className="flex flex-col gap-1.5">
                {question.choices.map((choice) => {
                  const isSelected = choice.id === selectedChoiceId;
                  return (
                    <div key={choice.id} className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => setSelected((prev) => ({ ...prev, [question.id]: choice.id }))}
                        className={cn(
                          "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                          isSelected && choice.correct && "border-green-500/50 bg-green-500/10",
                          isSelected && !choice.correct && "border-destructive/50 bg-destructive/10",
                          !isSelected && "hover:bg-muted"
                        )}
                      >
                        {isSelected &&
                          (choice.correct ? (
                            <Check className="size-4 shrink-0 text-green-600 dark:text-green-500" />
                          ) : (
                            <X className="size-4 shrink-0 text-destructive" />
                          ))}
                        <span>{choice.text}</span>
                      </button>
                      {isSelected && (
                        <p className="px-3 text-sm text-muted-foreground">{choice.explanation}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              {selectedChoice && !selectedChoice.correct && (
                <p className="text-xs text-muted-foreground">Try another option, or move on — this isn&apos;t graded.</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
