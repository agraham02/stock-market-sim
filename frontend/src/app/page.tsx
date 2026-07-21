"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortfolio } from "@/hooks/use-portfolio";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function DashboardPage() {
  const { data: portfolio, isPending, isError, error } = usePortfolio();

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Paper portfolio overview — practice the reasoning, not just the fill.
        </p>
      </div>

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Cash Balance</CardDescription>
            <CardTitle className="text-2xl">
              {isPending ? "—" : formatCurrency(portfolio!.cash_balance)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Starting Balance</CardDescription>
            <CardTitle className="text-2xl">
              {isPending ? "—" : formatCurrency(portfolio!.starting_balance)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total P&amp;L</CardDescription>
            <CardTitle className="text-2xl">
              {isPending
                ? "—"
                : formatCurrency(portfolio!.cash_balance - portfolio!.starting_balance)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
          <CardDescription>No open positions yet — place your first paper trade from a symbol view.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
