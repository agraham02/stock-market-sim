"use client";

import { Briefcase, PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import { LessonPrompt } from "@/components/lesson-prompt";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { PositionsTable } from "@/components/positions-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortfolio } from "@/hooks/use-portfolio";
import { usePositions } from "@/hooks/use-positions";
import { cn } from "@/lib/utils";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function contractMultiplier(optionType: string) {
  return optionType === "none" ? 1 : 100;
}

export default function DashboardPage() {
  const { data: portfolio, isPending, isError, error } = usePortfolio();
  const { data: positions } = usePositions();

  const openPositions = positions?.filter((p) => p.status === "open") ?? [];
  const openMarketValue = openPositions.reduce(
    (sum, p) => sum + p.mark_price * p.quantity * contractMultiplier(p.option_type),
    0
  );
  const portfolioValue = portfolio ? portfolio.cash_balance + openMarketValue : undefined;
  const totalPnl = portfolioValue !== undefined ? portfolioValue - portfolio!.starting_balance : undefined;

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 max-w-5xl mx-auto w-full">
      <FadeIn>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Paper portfolio overview — practice the reasoning, not just the fill.
        </p>
      </FadeIn>

      {isError && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Couldn&apos;t reach the backend</CardTitle>
            <CardDescription>
              Make sure the FastAPI server is running on the configured API base URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{String(error)}</CardContent>
        </Card>
      )}

      <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <Wallet className="size-3.5" /> Cash Balance
              </CardDescription>
              <CardTitle className="text-2xl">
                {isPending ? "—" : formatCurrency(portfolio!.cash_balance)}
              </CardTitle>
            </CardHeader>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <PiggyBank className="size-3.5" /> Starting Balance
              </CardDescription>
              <CardTitle className="text-2xl">
                {isPending ? "—" : formatCurrency(portfolio!.starting_balance)}
              </CardTitle>
            </CardHeader>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                {totalPnl !== undefined && totalPnl < 0 ? (
                  <TrendingDown className="size-3.5" />
                ) : (
                  <TrendingUp className="size-3.5" />
                )}{" "}
                Total P&amp;L
              </CardDescription>
              <CardTitle
                className={cn(
                  "text-2xl",
                  totalPnl !== undefined && (totalPnl >= 0 ? "text-green-500" : "text-red-500")
                )}
              >
                {totalPnl === undefined ? "—" : formatCurrency(totalPnl)}
              </CardTitle>
            </CardHeader>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      <FadeIn delay={0.075}>
        <LessonPrompt maxOrder={9} />
      </FadeIn>

      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <Briefcase className="size-4" /> Open Positions
            </CardTitle>
            <CardDescription>
              {openPositions.length === 0
                ? "No open positions yet — place your first paper trade from a symbol view."
                : `${openPositions.length} open position${openPositions.length === 1 ? "" : "s"}.`}
            </CardDescription>
          </CardHeader>
          {openPositions.length > 0 && (
            <CardContent>
              <PositionsTable positions={openPositions} />
            </CardContent>
          )}
        </Card>
      </FadeIn>
    </div>
  );
}
