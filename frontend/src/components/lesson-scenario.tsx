"use client";

import { RotateCcw, Signpost } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Scenario } from "@/lib/types";

export function LessonScenario({ scenario }: { scenario: Scenario }) {
  const [nodeId, setNodeId] = useState(scenario.start);
  const node = scenario.nodes[nodeId];
  const isTerminal = node.choices.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Signpost className="size-4" /> What Would You Do?
        </CardTitle>
        <CardDescription>A short scenario — there&apos;s no single &quot;correct&quot; path, only tradeoffs.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {node.prompt && <p className="text-sm font-medium">{node.prompt}</p>}

        {!isTerminal && (
          <div className="flex flex-col gap-1.5">
            {node.choices.map((choice) => (
              <Button
                key={choice.text}
                variant="outline"
                className="h-auto justify-start whitespace-normal py-2 text-left"
                onClick={() => choice.next && setNodeId(choice.next)}
              >
                {choice.text}
              </Button>
            ))}
          </div>
        )}

        {isTerminal && node.outcome && (
          <div className="flex flex-col gap-3 rounded-md border bg-muted/50 p-3">
            <p className="text-sm">{node.outcome}</p>
            <Button
              size="sm"
              variant="outline"
              className="self-start"
              onClick={() => setNodeId(scenario.start)}
            >
              <RotateCcw className="size-4" /> Start over
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
