"use client";

import { Layers } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CardHelp } from "@/components/card-help";
import { ExpirationDatePicker } from "@/components/expiration-date-picker";
import { OrderTicketDialog } from "@/components/order-ticket-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useOptionChain, useOptionExpirations } from "@/hooks/use-options-chain";
import { cn } from "@/lib/utils";
import type { OptionContract, OptionType } from "@/lib/types";

interface SelectedContract {
  strike: number;
  optionType: OptionType;
  bid: number;
  ask: number;
  impliedVolatility: number | null;
}

const COLUMN_HELP: Record<string, string> = {
  Bid: "The highest price a buyer is currently offering — what you'd receive if you sold this contract.",
  Ask: "The lowest price a seller is currently asking — the premium you'd pay to buy this contract.",
  IV: "Implied volatility — the size of move the market is already pricing in before expiration. Betting bigger than this is the actual bet.",
  Strike: "The fixed price this contract can be exercised at.",
  Vol: "Volume — how many contracts of this exact strike/expiration have traded today.",
  OI: "Open interest — how many contracts are currently open (bought but not yet closed or expired).",
};

function HeaderHelp({ label }: { label: keyof typeof COLUMN_HELP }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span className="cursor-help border-b border-dotted border-muted-foreground">{label}</span>}
      />
      <TooltipContent>{COLUMN_HELP[label]}</TooltipContent>
    </Tooltip>
  );
}

export function OptionsChain({ symbol, underlyingPrice }: { symbol: string; underlyingPrice?: number }) {
  const { data: expirations, isPending: expirationsPending } = useOptionExpirations(symbol);
  const [selectedExpiration, setSelectedExpiration] = useState<string>();
  const [selected, setSelected] = useState<SelectedContract | null>(null);

  const expiration = selectedExpiration ?? expirations?.[0];
  const { data: chain, isPending: chainPending } = useOptionChain(symbol, expiration);

  const strikes = chain
    ? Array.from(new Set([...chain.calls, ...chain.puts].map((c) => c.strike))).sort((a, b) => a - b)
    : [];
  const callsByStrike = new Map(chain?.calls.map((c) => [c.strike, c]));
  const putsByStrike = new Map(chain?.puts.map((c) => [c.strike, c]));

  const atmStrike =
    underlyingPrice != null && strikes.length > 0
      ? strikes.reduce((closest, s) =>
          Math.abs(s - underlyingPrice) < Math.abs(closest - underlyingPrice) ? s : closest
        )
      : undefined;

  const atmRowRef = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    const row = atmRowRef.current;
    const container = row?.closest<HTMLElement>('[data-slot="table-container"]');
    if (!row || !container) return;
    // Scroll only this container's own scrollbar — `row.scrollIntoView()` would cascade up
    // and also try to center the row in the page viewport, pushing the whole page down.
    const offset =
      row.offsetTop - container.clientHeight / 2 + row.clientHeight / 2;
    container.scrollTop = offset;
  }, [chain, underlyingPrice]);

  return (
    <Card data-tour="symbol-options">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-1.5">
            <Layers className="size-4" /> Options Chain
            {underlyingPrice != null && (
              <span className="text-sm font-normal text-muted-foreground">
                {symbol} ${underlyingPrice.toFixed(2)}
              </span>
            )}
            <CardHelp title="Options Chain">
              <ul className="flex flex-col gap-2 list-disc pl-4">
                <li>Calls (right to buy) on the left, puts (right to sell) on the right, sorted by strike price — the fixed price the contract can be exercised at.</li>
                <li><strong className="text-foreground">Bid/Ask</strong> — the premium: what you&apos;d receive to sell / pay to buy. Contracts are ×100 shares.</li>
                <li><strong className="text-foreground">IV</strong> (implied volatility) — the move the market is already pricing in before expiration.</li>
                <li><strong className="text-foreground">Vol / OI</strong> — contracts traded today / contracts currently open, a rough liquidity signal.</li>
                <li><strong className="text-foreground">Bold cells + the ATM badge</strong> mark in-the-money (ITM) and at-the-money strikes, relative to {symbol}&apos;s current price shown next to the title.</li>
                <li>Click any Bid or Ask to open the trade ticket for that contract.</li>
              </ul>
            </CardHelp>
          </CardTitle>
          <CardDescription>
            Every strike and expiration, with live bid/ask — click a price to open the trade ticket.
          </CardDescription>
        </div>
        {expirations && expirations.length > 0 && (
          <ExpirationDatePicker
            value={expiration}
            onValueChange={setSelectedExpiration}
            expirations={expirations}
          />
        )}
      </CardHeader>
      <CardContent>
        {(expirationsPending || chainPending) && (
          <p className="text-sm text-muted-foreground py-4 text-center">Loading chain…</p>
        )}
        {chain && strikes.length > 0 && (
          <Table containerClassName="max-h-125 overflow-y-auto contain-[layout] rounded-md border">
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead colSpan={5} className="text-center text-primary">
                  Calls
                </TableHead>
                <TableHead className="text-center">Strike</TableHead>
                <TableHead colSpan={5} className="text-center text-puts">
                  Puts
                </TableHead>
              </TableRow>
              <TableRow>
                <TableHead><HeaderHelp label="Bid" /></TableHead>
                <TableHead><HeaderHelp label="Ask" /></TableHead>
                <TableHead><HeaderHelp label="IV" /></TableHead>
                <TableHead><HeaderHelp label="Vol" /></TableHead>
                <TableHead><HeaderHelp label="OI" /></TableHead>
                <TableHead className="text-center">
                  <HeaderHelp label="Strike" />
                </TableHead>
                <TableHead><HeaderHelp label="Bid" /></TableHead>
                <TableHead><HeaderHelp label="Ask" /></TableHead>
                <TableHead><HeaderHelp label="IV" /></TableHead>
                <TableHead><HeaderHelp label="Vol" /></TableHead>
                <TableHead><HeaderHelp label="OI" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {strikes.map((strike) => {
                const call = callsByStrike.get(strike);
                const put = putsByStrike.get(strike);
                const isAtm = strike === atmStrike;
                return (
                  <TableRow
                    key={strike}
                    ref={isAtm ? atmRowRef : undefined}
                    className={cn(
                      "hover:bg-muted/50",
                      isAtm && "border-y-2 border-primary/50 bg-accent/60 hover:bg-accent/60"
                    )}
                  >
                    <ContractCells
                      side="call"
                      contract={call}
                      onBuy={(bid, ask, iv) =>
                        setSelected({ strike, optionType: "call", bid, ask, impliedVolatility: iv })
                      }
                    />
                    <TableCell className="text-center font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        {strike}
                        {isAtm && (
                          <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                            ATM
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <ContractCells
                      side="put"
                      contract={put}
                      onBuy={(bid, ask, iv) =>
                        setSelected({ strike, optionType: "put", bid, ask, impliedVolatility: iv })
                      }
                    />
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {selected && expiration && (
        <OrderTicketDialog
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
          symbol={symbol}
          expiration={expiration}
          strike={selected.strike}
          optionType={selected.optionType}
          bid={selected.bid}
          ask={selected.ask}
          impliedVolatility={selected.impliedVolatility}
        />
      )}
    </Card>
  );
}

function ContractCells({
  side,
  contract,
  onBuy,
}: {
  side: "call" | "put";
  contract: OptionContract | undefined;
  onBuy: (bid: number, ask: number, impliedVolatility: number | null) => void;
}) {
  // A faint always-on wash marks which side of the chain a cell belongs to; ITM strikes get a
  // stronger wash of the same hue on top, so moneyness reads at a glance while scrolling.
  const baseWash = side === "call" ? "bg-primary/[0.04]" : "bg-puts/[0.04]";
  const itmWash = side === "call" ? "bg-primary/15" : "bg-puts/15";

  if (!contract) {
    return (
      <>
        <TableCell colSpan={5} className={cn("text-muted-foreground text-center", baseWash)}>
          —
        </TableCell>
      </>
    );
  }

  const buy = () => onBuy(contract.bid, contract.ask, contract.implied_volatility);
  const cellClass = cn(contract.in_the_money ? itmWash : baseWash, contract.in_the_money && "font-medium");

  return (
    <>
      <TableCell className={cellClass}>
        <Button variant="ghost" size="sm" className="h-7" onClick={buy}>
          {contract.bid.toFixed(2)}
        </Button>
      </TableCell>
      <TableCell className={cellClass}>
        <Button variant="ghost" size="sm" className="h-7" onClick={buy}>
          {contract.ask.toFixed(2)}
        </Button>
      </TableCell>
      <TableCell className={cn(cellClass, "text-muted-foreground")}>
        {contract.implied_volatility != null ? `${(contract.implied_volatility * 100).toFixed(0)}%` : "—"}
      </TableCell>
      <TableCell className={cn(cellClass, "text-muted-foreground")}>{contract.volume}</TableCell>
      <TableCell className={cn(cellClass, "text-muted-foreground")}>{contract.open_interest}</TableCell>
    </>
  );
}
