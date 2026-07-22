"use client";

import {
  CandlestickSeries,
  ColorType,
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type SeriesMarker,
  type Time,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

import type { Candle, PatternHit } from "@/lib/types";

const THEME_COLORS = {
  dark: { text: "#a1a1aa", grid: "#27272a" },
  light: { text: "#71717a", grid: "#e4e4e7" },
};

interface CandlestickChartProps {
  candles: Candle[];
  patterns: PatternHit[];
  highlightedTime?: string | null;
}

function buildMarkers(patterns: PatternHit[], highlightedTime?: string | null): SeriesMarker<Time>[] {
  return patterns.map((hit) => {
    const bullish = hit.patterns.some((p) => p.direction === "bullish");
    const highlighted = hit.time === highlightedTime;
    return {
      time: hit.time as Time,
      position: bullish ? "belowBar" : "aboveBar",
      color: highlighted ? "#3b82f6" : bullish ? "#22c55e" : "#ef4444",
      shape: bullish ? "arrowUp" : "arrowDown",
      size: highlighted ? 2 : 1,
    };
  });
}

export function CandlestickChart({ candles, patterns, highlightedTime }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const markersApiRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = THEME_COLORS[resolvedTheme === "light" ? "light" : "dark"];
    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      timeScale: { borderColor: colors.grid },
      rightPriceScale: { borderColor: colors.grid },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const colors = THEME_COLORS[resolvedTheme === "light" ? "light" : "dark"];
    chartRef.current?.applyOptions({
      layout: { textColor: colors.text },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      timeScale: { borderColor: colors.grid },
      rightPriceScale: { borderColor: colors.grid },
    });
  }, [resolvedTheme]);

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

    markersApiRef.current = createSeriesMarkers(series, buildMarkers(patterns, highlightedTime));

    chartRef.current?.timeScale().fitContent();
    // highlightedTime intentionally excluded — initial load shouldn't refit the view on hover
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candles, patterns]);

  useEffect(() => {
    markersApiRef.current?.setMarkers(buildMarkers(patterns, highlightedTime));

    if (!highlightedTime) return;
    const chart = chartRef.current;
    if (!chart) return;
    const idx = candles.findIndex((c) => c.time === highlightedTime);
    if (idx === -1) return;

    const timeScale = chart.timeScale();
    const visibleRange = timeScale.getVisibleLogicalRange();
    const width = visibleRange ? visibleRange.to - visibleRange.from : 30;
    timeScale.setVisibleLogicalRange({ from: idx - width / 2, to: idx + width / 2 });
  }, [highlightedTime, patterns, candles]);

  return <div ref={containerRef} className="h-105 w-full" />;
}
