"use client";

import { differenceInCalendarDays } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

import { LessonPrompt } from "@/components/lesson-prompt";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useOpenTrade } from "@/hooks/use-positions";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Catalyst, Direction, OptionType, OrderType } from "@/lib/types";

const CATALYSTS: { value: Catalyst; label: string }[] = [
  { value: "earnings", label: "Earnings" },
  { value: "news", label: "News" },
  { value: "technical_setup", label: "Technical Setup" },
  { value: "momentum", label: "Momentum" },
  { value: "macro_event", label: "Macro Event" },
  { value: "none", label: "None" },
];

interface OrderTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
  expiration: string;
  strike: number;
  optionType: OptionType;
  bid: number;
  ask: number;
  impliedVolatility: number | null;
}

export function OrderTicketDialog({
  open,
  onOpenChange,
  symbol,
  expiration,
  strike,
  optionType,
  bid,
  ask,
  impliedVolatility,
}: OrderTicketDialogProps) {
  const [quantity, setQuantity] = useState("1");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [limitPrice, setLimitPrice] = useState(ask.toFixed(2));

  const [catalyst, setCatalyst] = useState<Catalyst>("none");
  const [direction, setDirection] = useState<Direction>(optionType === "put" ? "down" : "up");
  const [expectedMagnitude, setExpectedMagnitude] = useState("5");
  const [timeframeRationale, setTimeframeRationale] = useState("");
  const [confidence, setConfidence] = useState(3);

  const openTrade = useOpenTrade();

  const daysToExpiration = differenceInCalendarDays(new Date(expiration), new Date());
  const isShortDated = daysToExpiration <= 2;

  const qty = Number(quantity) || 0;
  const price = orderType === "market" ? ask : Number(limitPrice) || 0;
  const estimatedCost = qty * price * 100;
  const canSubmit = qty > 0 && timeframeRationale.trim().length > 0 && Number(expectedMagnitude) > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    openTrade.mutate(
      {
        symbol,
        option_type: optionType,
        strike,
        expiration,
        quantity: qty,
        order_type: orderType,
        limit_price: orderType === "limit" ? Number(limitPrice) : undefined,
        catalyst,
        direction,
        expected_magnitude: Number(expectedMagnitude) / 100,
        timeframe_rationale: timeframeRationale,
        confidence,
      },
      {
        onSuccess: (data) => {
          toast.success(
            `Bought ${qty} ${symbol} ${strike} ${optionType} @ $${data.position.entry_price.toFixed(2)}`
          );
          if (data.warning) toast.warning(data.warning);
          onOpenChange(false);
          setQuantity("1");
          setTimeframeRationale("");
        },
        onError: (error) => {
          toast.error(error instanceof ApiError ? error.message : "Order failed");
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Buy to Open — {symbol} {expiration} ${strike} {optionType}
          </DialogTitle>
          <DialogDescription>
            Bid ${bid.toFixed(2)} / Ask ${ask.toFixed(2)} — contracts are ×100 shares.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1 *:shrink-0"
        >
          {isShortDated && <LessonPrompt maxOrder={7} />}

          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Decision Framework
          </p>

          <div className="flex flex-col gap-1.5">
            <Label>Catalyst</Label>
            <Select value={catalyst} onValueChange={(v) => v && setCatalyst(v as Catalyst)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATALYSTS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Direction</Label>
            <Select value={direction} onValueChange={(v) => v && setDirection(v as Direction)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="up">Up</SelectItem>
                <SelectItem value="down">Down</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expected-magnitude">Expected Move (% by expiration)</Label>
            <Input
              id="expected-magnitude"
              type="number"
              min={0.1}
              step={0.1}
              value={expectedMagnitude}
              onChange={(e) => setExpectedMagnitude(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Current IV:{" "}
              {impliedVolatility != null ? (
                <span className="text-foreground font-medium">
                  {(impliedVolatility * 100).toFixed(0)}%
                </span>
              ) : (
                "—"
              )}{" "}
              — the move the market is already pricing in. Betting bigger than this is the actual bet.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="timeframe-rationale">Why this move, why now?</Label>
            <Textarea
              id="timeframe-rationale"
              placeholder="What's the catalyst, and why does this expiration match when you expect the move?"
              value={timeframeRationale}
              onChange={(e) => setTimeframeRationale(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Confidence</Label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Button
                  key={n}
                  type="button"
                  size="sm"
                  variant={confidence === n ? "default" : "outline"}
                  className={cn("flex-1", confidence === n && "font-semibold")}
                  onClick={() => setConfidence(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>

          <Separator />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Order</p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="quantity">Contracts</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Order Type</Label>
            <Select value={orderType} onValueChange={(v) => v && setOrderType(v as OrderType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="limit">Limit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {orderType === "limit" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="limit-price">Limit Price</Label>
              <Input
                id="limit-price"
                type="number"
                step={0.01}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
              />
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Estimated cost: <span className="text-foreground font-medium">${estimatedCost.toFixed(2)}</span>
          </p>

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit || openTrade.isPending}>
              {openTrade.isPending ? "Placing…" : "Place Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
