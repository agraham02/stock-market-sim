"use client";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCloseTrade } from "@/hooks/use-positions";
import { ApiError } from "@/lib/api";
import type { Position } from "@/lib/types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export function PositionsTable({ positions }: { positions: Position[] }) {
  const closeTrade = useCloseTrade();

  if (positions.length === 0) {
    return <p className="text-sm text-muted-foreground">No positions yet — place your first paper trade from a symbol view.</p>;
  }

  function handleClose(positionId: number) {
    closeTrade.mutate(
      { positionId },
      {
        onSuccess: (position) => {
          toast.success(`Closed @ $${position.entry_price.toFixed(2)} — realized P&L ${formatCurrency(position.pnl)}`);
        },
        onError: (error) => {
          toast.error(error instanceof ApiError ? error.message : "Close failed");
        },
      }
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Strike</TableHead>
          <TableHead>Expiration</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Entry</TableHead>
          <TableHead>Mark</TableHead>
          <TableHead>P&amp;L</TableHead>
          <TableHead>DTE</TableHead>
          <TableHead>Status</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-medium">{p.symbol}</TableCell>
            <TableCell className="capitalize">{p.option_type}</TableCell>
            <TableCell>{p.strike ?? "—"}</TableCell>
            <TableCell>{p.expiration ?? "—"}</TableCell>
            <TableCell>{p.quantity}</TableCell>
            <TableCell>${p.entry_price.toFixed(2)}</TableCell>
            <TableCell>${p.mark_price.toFixed(2)}</TableCell>
            <TableCell className={p.pnl >= 0 ? "text-green-500" : "text-red-500"}>
              {formatCurrency(p.pnl)}
            </TableCell>
            <TableCell>{p.days_to_expiration ?? "—"}</TableCell>
            <TableCell>
              <Badge variant={p.status === "open" ? "default" : "secondary"}>{p.status}</Badge>
            </TableCell>
            <TableCell>
              {p.status === "open" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={closeTrade.isPending}
                  onClick={() => handleClose(p.id)}
                >
                  Close
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
