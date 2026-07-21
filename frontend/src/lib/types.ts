export interface Portfolio {
  id: number;
  cash_balance: number;
  starting_balance: number;
  created_at: string;
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PatternMatch {
  name: string;
  label: string;
  explanation: string;
  direction: "bullish" | "bearish";
}

export interface PatternHit {
  time: string;
  patterns: PatternMatch[];
}

export interface SymbolChart {
  symbol: string;
  candles: Candle[];
  patterns: PatternHit[];
}

export type OptionType = "call" | "put" | "none";
export type PositionStatus = "open" | "closed" | "expired";
export type OrderType = "market" | "limit";

export interface OptionContract {
  strike: number;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  open_interest: number;
  implied_volatility: number | null;
  in_the_money: boolean;
}

export interface OptionChain {
  symbol: string;
  expiration: string;
  calls: OptionContract[];
  puts: OptionContract[];
}

export interface Position {
  id: number;
  symbol: string;
  option_type: OptionType;
  strike: number | null;
  expiration: string | null;
  quantity: number;
  entry_price: number;
  status: PositionStatus;
  created_at: string;
  mark_price: number;
  pnl: number;
  days_to_expiration: number | null;
}

export interface OpenTradeRequest {
  symbol: string;
  option_type: OptionType;
  strike?: number | null;
  expiration?: string | null;
  quantity: number;
  order_type: OrderType;
  limit_price?: number | null;
}

export interface OpenTradeResponse {
  position: Position;
  warning: string | null;
}
