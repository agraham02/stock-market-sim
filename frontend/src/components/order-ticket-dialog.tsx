"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInCalendarDays } from "date-fns";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { CardHelp } from "@/components/card-help";
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
import type { Catalyst, OptionType } from "@/lib/types";

const CATALYSTS: { value: Catalyst; label: string }[] = [
  { value: "earnings", label: "Earnings" },
  { value: "news", label: "News" },
  { value: "technical_setup", label: "Technical Setup" },
  { value: "momentum", label: "Momentum" },
  { value: "macro_event", label: "Macro Event" },
  { value: "none", label: "None" },
];

const orderTicketSchema = z
  .object({
    catalyst: z.enum(["earnings", "news", "technical_setup", "momentum", "macro_event", "none"]),
    direction: z.enum(["up", "down"]),
    expectedMagnitude: z.number({ error: "Enter a number" }).positive("Must be greater than 0"),
    timeframeRationale: z
      .string()
      .trim()
      .min(10, "Explain your reasoning in a bit more detail (at least 10 characters)"),
    confidence: z.number().int().min(1).max(5),
    quantity: z.number({ error: "Enter a number" }).int("Whole contracts only").positive("Must be at least 1"),
    orderType: z.enum(["market", "limit"]),
    limitPrice: z.number().positive("Enter a limit price").optional(),
  })
  .refine((data) => data.orderType !== "limit" || data.limitPrice != null, {
    message: "Enter a limit price",
    path: ["limitPrice"],
  });

type OrderTicketFormValues = z.infer<typeof orderTicketSchema>;

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
  const openTrade = useOpenTrade();

  const daysToExpiration = differenceInCalendarDays(new Date(expiration), new Date());
  const isShortDated = daysToExpiration <= 2;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<OrderTicketFormValues>({
    resolver: zodResolver(orderTicketSchema),
    defaultValues: {
      catalyst: "none",
      direction: optionType === "put" ? "down" : "up",
      expectedMagnitude: 5,
      timeframeRationale: "",
      confidence: 3,
      quantity: 1,
      orderType: "market",
      limitPrice: Number(ask.toFixed(2)),
    },
  });

  const orderType = useWatch({ control, name: "orderType" });
  const quantity = useWatch({ control, name: "quantity" });
  const limitPrice = useWatch({ control, name: "limitPrice" });

  const price = orderType === "market" ? ask : Number(limitPrice) || 0;
  const estimatedCost = (Number(quantity) || 0) * price * 100;

  function onSubmit(values: OrderTicketFormValues) {
    openTrade.mutate(
      {
        symbol,
        option_type: optionType,
        strike,
        expiration,
        quantity: values.quantity,
        order_type: values.orderType,
        limit_price: values.orderType === "limit" ? values.limitPrice : undefined,
        catalyst: values.catalyst,
        direction: values.direction,
        expected_magnitude: values.expectedMagnitude / 100,
        timeframe_rationale: values.timeframeRationale,
        confidence: values.confidence,
      },
      {
        onSuccess: (data) => {
          toast.success(
            `Bought ${values.quantity} ${symbol} ${strike} ${optionType} @ $${data.position.entry_price.toFixed(2)}`
          );
          if (data.warning) toast.warning(data.warning);
          onOpenChange(false);
          reset();
        },
        onError: (error) => {
          toast.error(error instanceof ApiError ? error.message : "Order failed");
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-start justify-between gap-4 pr-6">
          <div>
            <DialogTitle>
              Buy to Open — {symbol} {expiration} ${strike} {optionType}
            </DialogTitle>
            <DialogDescription>
              Bid ${bid.toFixed(2)} / Ask ${ask.toFixed(2)} — contracts are ×100 shares.
            </DialogDescription>
          </div>
          <CardHelp title="The Decision Framework" className="mt-0.5 shrink-0">
            <p>Every trade requires five answers before you can submit — this is the core teaching mechanic of the app.</p>
            <ul className="flex flex-col gap-2 list-disc pl-4">
              <li><strong className="text-foreground">Catalyst</strong> — the specific, named reason you expect a move (earnings, news, a technical setup, momentum, a macro event) — not a vibe.</li>
              <li><strong className="text-foreground">Direction</strong> — up or down, auto-filled from call/put but overridable.</li>
              <li><strong className="text-foreground">Expected Move</strong> — your predicted % move by expiration, compared against current IV. The market has already priced in a move; you&apos;re betting the real one is bigger.</li>
              <li><strong className="text-foreground">Why this move, why now</strong> — the reasoning tying your catalyst to this specific expiration.</li>
              <li><strong className="text-foreground">Confidence</strong> — a 1-5 self-rating, tracked over time so you can see whether your high-confidence trades actually win more often.</li>
            </ul>
            <p>After the trade closes, the Journal grades direction, magnitude, timing, and IV-crush separately — so you can see exactly which part of your thesis was right.</p>
          </CardHelp>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {isShortDated && <LessonPrompt maxOrder={7} />}

          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Decision Framework
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Catalyst</Label>
              <Controller
                control={control}
                name="catalyst"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
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
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Direction</Label>
              <Controller
                control={control}
                name="direction"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="up">Up</SelectItem>
                      <SelectItem value="down">Down</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expected-magnitude">Expected Move (% by expiration)</Label>
              <Input
                id="expected-magnitude"
                type="number"
                min={0.1}
                step={0.1}
                {...register("expectedMagnitude", { valueAsNumber: true })}
              />
              {errors.expectedMagnitude ? (
                <p className="text-xs text-destructive">{errors.expectedMagnitude.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Current IV:{" "}
                  {impliedVolatility != null ? (
                    <span className="text-foreground font-medium">
                      {(impliedVolatility * 100).toFixed(0)}%
                    </span>
                  ) : (
                    "—"
                  )}{" "}
                  — the move the market is already pricing in.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Confidence</Label>
              <Controller
                control={control}
                name="confidence"
                render={({ field }) => (
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Button
                        key={n}
                        type="button"
                        size="sm"
                        variant={field.value === n ? "default" : "outline"}
                        className={cn("flex-1", field.value === n && "font-semibold")}
                        onClick={() => field.onChange(n)}
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                )}
              />
              <p className="text-xs text-muted-foreground">1 = low conviction · 5 = very confident</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="timeframe-rationale">Why this move, why now?</Label>
            <Textarea
              id="timeframe-rationale"
              placeholder="What's the catalyst, and why does this expiration match when you expect the move?"
              rows={3}
              {...register("timeframeRationale")}
            />
            {errors.timeframeRationale && (
              <p className="text-xs text-destructive">{errors.timeframeRationale.message}</p>
            )}
          </div>

          <Separator />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Order</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quantity">Contracts</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                step={1}
                {...register("quantity", { valueAsNumber: true })}
              />
              {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Order Type</Label>
              <Controller
                control={control}
                name="orderType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => v && field.onChange(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {orderType === "limit" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="limit-price">Limit Price</Label>
                <Input
                  id="limit-price"
                  type="number"
                  step={0.01}
                  {...register("limitPrice", { valueAsNumber: true })}
                />
                {errors.limitPrice && <p className="text-xs text-destructive">{errors.limitPrice.message}</p>}
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Estimated cost: <span className="text-foreground font-medium">${estimatedCost.toFixed(2)}</span>
          </p>

          <DialogFooter>
            <Button type="submit" disabled={openTrade.isPending}>
              {openTrade.isPending ? "Placing…" : "Place Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
