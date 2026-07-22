"use client";

import { BookOpen, CheckCircle2, GraduationCap, MapPinned } from "lucide-react";

import { CardHelp } from "@/components/card-help";
import { LessonContent } from "@/components/lesson-content";
import { LessonQuiz } from "@/components/lesson-quiz";
import { LessonScenario } from "@/components/lesson-scenario";
import { FadeIn } from "@/components/motion/fade-in";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TutorButton } from "@/components/tutor-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCompleteLesson, useLesson, useLessons } from "@/hooks/use-lessons";
import { useTourStore } from "@/store/tour-store";
import type { Lesson } from "@/lib/types";

export default function LearnHubPage() {
  const { data: lessons, isPending, isError } = useLessons();
  const completedCount = lessons?.filter((l) => l.completed_at).length ?? 0;
  const total = lessons?.length ?? 0;

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 max-w-3xl mx-auto w-full">
      <FadeIn>
        <h1 className="text-2xl font-semibold tracking-tight">Learn Hub</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Short lessons, meant to be read right when they become relevant.
        </p>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <GraduationCap className="size-4" /> Curriculum Progress
            </CardTitle>
            <CardDescription>
              {total > 0 ? `${completedCount} of ${total} lessons completed` : "Loading…"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={total > 0 ? (completedCount / total) * 100 : 0} />
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card data-tour="learn-accordion">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <BookOpen className="size-4" /> Curriculum
              <CardHelp title="The Curriculum">
                <ul className="flex flex-col gap-2 list-disc pl-4">
                  <li><strong className="text-foreground">Lessons</strong> — short, plain-language reading, surfaced right when a screen makes them relevant.</li>
                  <li><strong className="text-foreground">Check Yourself</strong> quizzes — optional multiple-choice questions with an explanation either way. Not graded, not required to complete the lesson.</li>
                  <li><strong className="text-foreground">What Would You Do?</strong> scenarios — a branching decision to walk through; there&apos;s no single correct path, only tradeoffs.</li>
                  <li><strong className="text-foreground">Walk me through it</strong> — on lessons with a matching screen, this navigates there and highlights exactly what the lesson is talking about.</li>
                </ul>
              </CardHelp>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {isPending && <p className="text-sm text-muted-foreground">Loading…</p>}
            {isError && <p className="text-sm text-destructive">Couldn&apos;t load lessons.</p>}
            {lessons && (
              <Accordion>
                {lessons.map((lesson) => (
                  <AccordionItem key={lesson.id} value={String(lesson.id)}>
                    <LessonAccordionTrigger lesson={lesson} />
                    <AccordionContent>
                      <LessonAccordionBody lessonId={lesson.id} completed={!!lesson.completed_at} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}

function LessonAccordionTrigger({ lesson }: { lesson: Lesson }) {
  return (
    <AccordionTrigger>
      <span className="flex items-center gap-2">
        <span className="text-muted-foreground w-5 shrink-0">{lesson.order}.</span>
        {lesson.title}
        {lesson.completed_at && <CheckCircle2 className="size-4 text-green-500 shrink-0" />}
      </span>
    </AccordionTrigger>
  );
}

function LessonAccordionBody({ lessonId, completed }: { lessonId: number; completed: boolean }) {
  const { data: lesson, isPending } = useLesson(lessonId);
  const completeLesson = useCompleteLesson();

  if (isPending || !lesson) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const hasWalkthrough = !!lesson.walkthrough_json && lesson.walkthrough_json.length > 0;
  const hasQuiz = !!lesson.quiz_json && lesson.quiz_json.length > 0;
  const hasScenario = !!lesson.scenario_json;

  return (
    <div className="flex flex-col gap-3">
      <LessonContent markdown={lesson.content_md} />
      {hasQuiz && <LessonQuiz questions={lesson.quiz_json!} />}
      {hasScenario && <LessonScenario scenario={lesson.scenario_json!} />}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant={completed ? "outline" : "default"}
          disabled={completeLesson.isPending}
          onClick={() => completeLesson.mutate(lessonId)}
        >
          {completed ? "Completed ✓" : "Mark Complete"}
        </Button>
        {hasWalkthrough && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => useTourStore.getState().start(`lesson-${lessonId}`, lesson.walkthrough_json!)}
          >
            <MapPinned className="size-4" /> Walk me through it
          </Button>
        )}
        <TutorButton contextType="lesson" contextId={String(lessonId)} label="Ask about this lesson" />
      </div>
    </div>
  );
}
