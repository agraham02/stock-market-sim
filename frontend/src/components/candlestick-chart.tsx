"use client";

import {
  CandlestickSeries,
  ColorType,
  createChart,
  createSeriesMarkers,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type MouseEventParams,
  type SeriesMarker,
  type Time,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import type { Candle, PatternHit } from "@/lib/types";

const THEME_COLORS = {
  dark: { text: "#a1a1aa", grid: "#27272a" },
  light: { text: "#71717a", grid: "#e4e4e7" },
};

export interface CandlestickChartHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
}

interface CandlestickChartProps {
  candles: Candle[];
  patterns: PatternHit[];
  highlightedTime?: string | null;
}

function buildMarkers(patterns: PatternHit[], highlightedTime?: string | null): SeriesMarker<Time>[] {
  const markers: SeriesMarker<Time>[] = [];
  for (const hit of patterns) {
    const highlighted = hit.time === highlightedTime;
    const hasBullish = hit.patterns.some((p) => p.direction === "bullish");
    const hasBearish = hit.patterns.some((p) => p.direction === "bearish");

    if (hasBullish) {
      markers.push({
        time: hit.time as Time,
        position: "belowBar",
        color: highlighted ? "#3b82f6" : "#22c55e",
        shape: "arrowUp",
        size: highlighted ? 2 : 1,
      });
    }
    if (hasBearish) {
      markers.push({
        time: hit.time as Time,
        position: "aboveBar",
        color: highlighted ? "#3b82f6" : "#ef4444",
        shape: "arrowDown",
        size: highlighted ? 2 : 1,
      });
    }
  }
  return markers;
}

/** Clamps a `{from, to}` logical range to `[0, maxIndex]`, shifting (not truncating) the window
 * so its width is preserved when it would otherwise run off either edge. */
function clampRange(from: number, to: number, maxIndex: number): { from: number; to: number } {
  if (from < 0) {
    to -= from;
    from = 0;
  }
  if (to > maxIndex) {
    from -= to - maxIndex;
    to = maxIndex;
  }
  return { from: Math.max(0, from), to: Math.min(maxIndex, to) };
}

export const CandlestickChart = forwardRef<CandlestickChartHandle, CandlestickChartProps>(
  function CandlestickChart({ candles, patterns, highlightedTime }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const markersApiRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null);
    const patternsRef = useRef<PatternHit[]>(patterns);
    patternsRef.current = patterns;
    const { resolvedTheme } = useTheme();
    const [tooltip, setTooltip] = useState<{ x: number; y: number; flipX: boolean; hit: PatternHit } | null>(
      null
    );

    useImperativeHandle(
      ref,
      () => ({
        zoomIn: () => zoomByFactor(0.8),
        zoomOut: () => zoomByFactor(1.25),
        reset: () => chartRef.current?.timeScale().fitContent(),
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [candles.length]
    );

    function zoomByFactor(factor: number) {
      const chart = chartRef.current;
      if (!chart || candles.length === 0) return;
      const timeScale = chart.timeScale();
      const range = timeScale.getVisibleLogicalRange();
      if (!range) return;

      const center = (range.from + range.to) / 2;
      const halfWidth = ((range.to - range.from) * factor) / 2;
      const { from, to } = clampRange(center - halfWidth, center + halfWidth, candles.length - 1);
      timeScale.setVisibleLogicalRange({ from, to });
    }

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

      // Volume, pinned to the bottom ~20% of the same pane via a dedicated price scale — reads as
      // background context rather than a full second chart.
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });
      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.82, bottom: 0 },
      });

      chartRef.current = chart;
      seriesRef.current = series;
      volumeSeriesRef.current = volumeSeries;

      function handleCrosshairMove(param: MouseEventParams<Time>) {
        if (!param.point || param.time === undefined) {
          setTooltip(null);
          return;
        }
        const hit = patternsRef.current.find((p) => p.time === (param.time as unknown as string));
        if (!hit) {
          setTooltip(null);
          return;
        }
        const containerWidth = container?.clientWidth ?? 0;
        setTooltip({
          x: param.point.x,
          y: param.point.y,
          flipX: containerWidth > 0 && param.point.x > containerWidth / 2,
          hit,
        });
      }
      chart.subscribeCrosshairMove(handleCrosshairMove);

      return () => {
        chart.unsubscribeCrosshairMove(handleCrosshairMove);
        chart.remove();
        chartRef.current = null;
        seriesRef.current = null;
        volumeSeriesRef.current = null;
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

      volumeSeriesRef.current?.setData(
        candles.map((c) => ({
          time: c.time as Time,
          value: c.volume,
          color: c.close >= c.open ? "rgba(34, 197, 94, 0.35)" : "rgba(239, 68, 68, 0.35)",
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
      if (!chart || candles.length === 0) return;
      const idx = candles.findIndex((c) => c.time === highlightedTime);
      if (idx === -1) return;

      const timeScale = chart.timeScale();
      const visibleRange = timeScale.getVisibleLogicalRange();

      // Already on-screen — don't recenter, avoids the chart snapping on every hover.
      if (visibleRange && idx >= visibleRange.from && idx <= visibleRange.to) return;

      const width = visibleRange ? visibleRange.to - visibleRange.from : 30;
      const { from, to } = clampRange(idx - width / 2, idx + width / 2, candles.length - 1);
      timeScale.setVisibleLogicalRange({ from, to });
    }, [highlightedTime, patterns, candles]);

    return (
      <div className="relative h-105 w-full">
        <div ref={containerRef} className="h-full w-full" />
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 flex max-w-64 flex-col gap-2 rounded-lg border bg-popover p-2.5 text-xs text-popover-foreground shadow-md"
            style={{
              left: tooltip.flipX ? undefined : tooltip.x + 14,
              right: tooltip.flipX ? `calc(100% - ${tooltip.x - 14}px)` : undefined,
              top: Math.max(0, tooltip.y - 8),
            }}
          >
            <span className="font-medium text-muted-foreground">{tooltip.hit.time}</span>
            {tooltip.hit.patterns.map((pattern) => (
              <div key={pattern.name} className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Badge variant={pattern.direction === "bullish" ? "default" : "destructive"} className="h-4 px-1.5 text-[10px]">
                    {pattern.direction}
                  </Badge>
                  <span className="font-medium">{pattern.label}</span>
                </div>
                <p className="text-muted-foreground">{pattern.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
