"use client";

import { HelpCircle, Layers } from "lucide-react";
import { useState } from "react";

import { OrderTicketDialog } from "@/components/order-ticket-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button variant="ghost" size="icon-sm" className="size-5">
                    <HelpCircle className="size-3.5" />
                    <span className="sr-only">What is this table?</span>
                  </Button>
                }
              />
              <TooltipContent>
                Calls on the left, puts on the right, sorted by strike. Bold cells are in the money
                (ITM) — the strike is already favorable relative to {symbol}&apos;s current price.
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription>
            Every strike and expiration, with live bid/ask — click a price to open the trade ticket.
          </CardDescription>
        </div>
        {expirations && expirations.length > 0 && (
          <Select
            value={expiration}
            onValueChange={(value) => setSelectedExpiration(value ?? undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Expiration" />
            </SelectTrigger>
            <SelectContent>
              {expirations.map((exp) => (
                <SelectItem key={exp} value={exp}>
                  {exp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        {(expirationsPending || chainPending) && (
          <p className="text-sm text-muted-foreground py-4 text-center">Loading chain…</p>
        )}
        {chain && strikes.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead colSpan={5} className="text-center">
                  Calls
                </TableHead>
                <TableHead className="text-center">Strike</TableHead>
                <TableHead colSpan={5} className="text-center">
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
                return (
                  <TableRow key={strike}>
                    <ContractCells
                      contract={call}
                      onBuy={(bid, ask, iv) =>
                        setSelected({ strike, optionType: "call", bid, ask, impliedVolatility: iv })
                      }
                    />
                    <TableCell className="text-center font-medium">{strike}</TableCell>
                    <ContractCells
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
  contract,
  onBuy,
}: {
  contract: OptionContract | undefined;
  onBuy: (bid: number, ask: number, impliedVolatility: number | null) => void;
}) {
  if (!contract) {
    return (
      <>
        <TableCell colSpan={5} className="text-muted-foreground text-center">
          —
        </TableCell>
      </>
    );
  }

  const buy = () => onBuy(contract.bid, contract.ask, contract.implied_volatility);

  return (
    <>
      <TableCell className={cn(contract.in_the_money && "text-foreground font-medium")}>
        <Button variant="ghost" size="sm" className="h-7" onClick={buy}>
          {contract.bid.toFixed(2)}
        </Button>
      </TableCell>
      <TableCell className={cn(contract.in_the_money && "text-foreground font-medium")}>
        <Button variant="ghost" size="sm" className="h-7" onClick={buy}>
          {contract.ask.toFixed(2)}
        </Button>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {contract.implied_volatility != null ? `${(contract.implied_volatility * 100).toFixed(0)}%` : "—"}
      </TableCell>
      <TableCell className="text-muted-foreground">{contract.volume}</TableCell>
      <TableCell className="text-muted-foreground">{contract.open_interest}</TableCell>
    </>
  );
}
