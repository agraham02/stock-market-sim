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
