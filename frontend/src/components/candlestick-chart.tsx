"use client";

import {
  CandlestickSeries,
  ColorType,
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type SeriesMarker,
  type Time,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

import type { Candle, PatternHit } from "@/lib/types";

interface CandlestickChartProps {
  candles: Candle[];
  patterns: PatternHit[];
}

export function CandlestickChart({ candles, patterns }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#a1a1aa",
      },
      grid: {
        vertLines: { color: "#27272a" },
        horzLines: { color: "#27272a" },
      },
      timeScale: { borderColor: "#27272a" },
      rightPriceScale: { borderColor: "#27272a" },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    series.setData(
      candles.map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    const markers: SeriesMarker<Time>[] = patterns.map((hit) => {
      const bullish = hit.patterns.some((p) => p.direction === "bullish");
      return {
        time: hit.time as Time,
        position: bullish ? "belowBar" : "aboveBar",
        color: bullish ? "#22c55e" : "#ef4444",
        shape: bullish ? "arrowUp" : "arrowDown",
      };
    });
    createSeriesMarkers(series, markers);

    chartRef.current?.timeScale().fitContent();
  }, [candles, patterns]);

  return <div ref={containerRef} className="h-105 w-full" />;
}
