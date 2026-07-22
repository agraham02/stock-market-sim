"use client";

import { Briefcase } from "lucide-react";

import { CardHelp } from "@/components/card-help";
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
              <CardHelp title="All Positions">
                <ul className="flex flex-col gap-2 list-disc pl-4">
                  <li><strong className="text-foreground">Status</strong> — open, closed (you exited), or expired (settled automatically at expiration).</li>
                  <li><strong className="text-foreground">Days to expiration</strong> — shown on open positions; the closer to 0, the faster theta decay and gamma risk accelerate (see Lesson 7).</li>
                  <li><strong className="text-foreground">P&amp;L</strong> — (mark price − entry price) × quantity × 100, since one contract controls 100 shares.</li>
                  <li><strong className="text-foreground">Expired</strong> options are auto-settled at intrinsic value — no action needed from you.</li>
                </ul>
              </CardHelp>
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
