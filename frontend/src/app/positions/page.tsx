"use client";

import { Briefcase } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { PositionsTable } from "@/components/positions-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePositions } from "@/hooks/use-positions";

export default function PositionsPage() {
  const { data: positions, isPending, isError } = usePositions();

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 max-w-6xl mx-auto w-full">
      <FadeIn>
        <h1 className="text-2xl font-semibold tracking-tight">Positions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Every open, closed, and expired paper trade.
        </p>
      </FadeIn>

      <FadeIn delay={0.05}>
        <Card data-tour="positions-table">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Briefcase className="size-4" /> All Positions
            </CardTitle>
            <CardDescription>Expired options are auto-settled at intrinsic value.</CardDescription>
          </CardHeader>
          <CardContent>
            {isPending && <p className="text-sm text-muted-foreground">Loading…</p>}
            {isError && <p className="text-sm text-destructive">Couldn&apos;t load positions.</p>}
            {positions && <PositionsTable positions={positions} />}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
