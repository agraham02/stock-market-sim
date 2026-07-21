"use client";

import { useState } from "react";
import { toast } from "sonner";

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
import { useOpenTrade } from "@/hooks/use-positions";
import { ApiError } from "@/lib/api";
import type { OptionType, OrderType } from "@/lib/types";

interface OrderTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
  expiration: string;
  strike: number;
  optionType: OptionType;
  bid: number;
  ask: number;
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
}: OrderTicketDialogProps) {
  const [quantity, setQuantity] = useState("1");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [limitPrice, setLimitPrice] = useState(ask.toFixed(2));
  const openTrade = useOpenTrade();

  const qty = Number(quantity) || 0;
  const price = orderType === "market" ? ask : Number(limitPrice) || 0;
  const estimatedCost = qty * price * 100;

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
      },
      {
        onSuccess: (data) => {
          toast.success(
            `Bought ${qty} ${symbol} ${strike} ${optionType} @ $${data.position.entry_price.toFixed(2)}`
          );
          if (data.warning) toast.warning(data.warning);
          onOpenChange(false);
          setQuantity("1");
        },
        onError: (error) => {
          toast.error(error instanceof ApiError ? error.message : "Order failed");
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Buy to Open — {symbol} {expiration} ${strike} {optionType}
          </DialogTitle>
          <DialogDescription>
            Bid ${bid.toFixed(2)} / Ask ${ask.toFixed(2)} — contracts are ×100 shares.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
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
            <Button type="submit" disabled={qty <= 0 || openTrade.isPending}>
              {openTrade.isPending ? "Placing…" : "Place Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
