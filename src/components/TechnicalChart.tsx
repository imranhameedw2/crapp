import React, { useState, useMemo, useRef } from 'react';
import {
  CandlestickChart,
  LineChart,
  Eye,
  Sliders,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Target,
} from 'lucide-react';
import type { Candle, SignalRecommendation, TechnicalIndicators } from '../types/crypto.ts';
import { calculateEMA } from '../utils/indicators.ts';

interface TechnicalChartProps {
  candles: Candle[];
  signal: SignalRecommendation;
  indicators: TechnicalIndicators;
  symbol: string;
  currentPrice: number;
  language: 'ur' | 'en';
}

export const TechnicalChart: React.FC<TechnicalChartProps> = ({
  candles,
  signal,
  indicators,
  symbol,
  currentPrice,
  language,
}) => {
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M'>('6M');
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [showEMA, setShowEMA] = useState(true);
  const [showSR, setShowSR] = useState(true);
  const [showTargets, setShowTargets] = useState(true);

  // Mouse hover state for crosshair tooltip
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Filter candles based on timeframe
  const displayCandles = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    if (timeframe === '1M') return candles.slice(-30);
    if (timeframe === '3M') return candles.slice(-90);
    return candles.slice(-180); // 6M full
  }, [candles, timeframe]);

  // Calculate moving averages for the slice
  const { ema20Line, ema50Line } = useMemo(() => {
    const closes = displayCandles.map((c) => c.close);
    const ema20Full = calculateEMA(closes, 20);
    const ema50Full = calculateEMA(closes, Math.min(50, closes.length));
    return { ema20Line: ema20Full, ema50Line: ema50Full };
  }, [displayCandles]);

  // SVG dimensions
  const width = 900;
  const height = 440;
  const margin = { top: 30, right: 75, bottom: 65, left: 20 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const volumeHeight = 55;
  const priceChartHeight = chartHeight - volumeHeight - 15;

  // Compute price and volume bounds
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (displayCandles.length === 0) {
      return { minPrice: 0, maxPrice: 100, maxVolume: 100 };
    }

    let min = Math.min(...displayCandles.map((c) => c.low));
    let max = Math.max(...displayCandles.map((c) => c.high));
    const maxVol = Math.max(...displayCandles.map((c) => c.volume), 1);

    // If targets or stop loss are shown, expand min/max so they are visible
    if (showTargets) {
      signal.targets.forEach((t) => {
        if (t.price > max) max = t.price;
        if (t.price < min) min = t.price;
      });
      if (signal.stopLoss.price < min) min = signal.stopLoss.price;
      if (signal.stopLoss.price > max) max = signal.stopLoss.price;
    }

    const padding = (max - min) * 0.06;
    return {
      minPrice: Math.max(0.000001, min - padding),
      maxPrice: max + padding,
      maxVolume: maxVol,
    };
  }, [displayCandles, showTargets, signal]);

  // Price to Y coordinate conversion
  const priceToY = (price: number) => {
    const range = maxPrice - minPrice;
    if (range <= 0) return margin.top + priceChartHeight / 2;
    return margin.top + (1 - (price - minPrice) / range) * priceChartHeight;
  };

  // Candle index to X coordinate
  const candleToX = (index: number) => {
    if (displayCandles.length <= 1) return margin.left;
    return margin.left + (index / (displayCandles.length - 1)) * chartWidth;
  };

  // Volume to Y coordinate
  const volumeToY = (vol: number) => {
    const bottom = margin.top + chartHeight;
    const top = bottom - volumeHeight;
    return bottom - (vol / (maxVolume || 1)) * volumeHeight;
  };

  // Handle mouse move for crosshair
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || displayCandles.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relX = (mouseX / rect.width) * width - margin.left;
    const ratio = Math.max(0, Math.min(1, relX / chartWidth));
    const index = Math.round(ratio * (displayCandles.length - 1));
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activeCandle =
    hoverIndex !== null && displayCandles[hoverIndex]
      ? displayCandles[hoverIndex]
      : displayCandles[displayCandles.length - 1];

  // Price Grid Lines (5 intervals)
  const priceGridLevels = useMemo(() => {
    const count = 5;
    const step = (maxPrice - minPrice) / count;
    return Array.from({ length: count + 1 }, (_, i) => minPrice + i * step);
  }, [minPrice, maxPrice]);

  // Date labels
  const dateIntervals = useMemo(() => {
    if (displayCandles.length === 0) return [];
    const count = 5;
    const step = Math.floor(displayCandles.length / count);
    return Array.from({ length: count }, (_, i) => {
      const idx = Math.min(i * step, displayCandles.length - 1);
      return { index: idx, candle: displayCandles[idx] };
    });
  }, [displayCandles]);

  // Line chart path builder
  const linePath = useMemo(() => {
    if (displayCandles.length === 0) return '';
    return displayCandles
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${candleToX(i).toFixed(1)} ${priceToY(c.close).toFixed(1)}`)
      .join(' ');
  }, [displayCandles, maxPrice, minPrice]);

  // Area chart path builder
  const areaPath = useMemo(() => {
    if (displayCandles.length === 0) return '';
    const bottomY = margin.top + priceChartHeight;
    const firstX = candleToX(0);
    const lastX = candleToX(displayCandles.length - 1);
    return `${linePath} L ${lastX.toFixed(1)} ${bottomY} L ${firstX.toFixed(1)} ${bottomY} Z`;
  }, [linePath, displayCandles]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Chart Top Controls & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
        {/* Title & Timeframe */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white font-bold text-base sm:text-lg">
            <CandlestickChart className="w-5 h-5 text-amber-400" />
            <span>{symbol}/USDT</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-normal">
              {timeframe} Daily
            </span>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            {(['1M', '3M', '6M'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                  timeframe === tf
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View & Overlay Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setChartType('candles')}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                chartType === 'candles'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Candlestick Chart"
              aria-label="Candlestick Chart"
            >
              <CandlestickChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                chartType === 'line'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Area Line Chart"
              aria-label="Area Line Chart"
            >
              <LineChart className="w-4 h-4" />
            </button>
          </div>

          {/* Overlay Toggles */}
          <button
            onClick={() => setShowEMA(!showEMA)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              showEMA
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>EMA 20/50</span>
          </button>

          <button
            onClick={() => setShowSR(!showSR)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              showSR
                ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <span>Support / Resistance</span>
          </button>

          <button
            onClick={() => setShowTargets(!showTargets)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
              showTargets
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Targets & Stop Loss</span>
          </button>
        </div>
      </div>

      {/* Floating HUD Tooltip for Active / Hovered Candle */}
      {activeCandle && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 px-3.5 mb-3 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-white">{activeCandle.dateStr}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <span>
              O: <strong className="text-white">${activeCandle.open}</strong>
            </span>
            <span>
              H: <strong className="text-emerald-400">${activeCandle.high}</strong>
            </span>
            <span>
              L: <strong className="text-rose-400">${activeCandle.low}</strong>
            </span>
            <span>
              C:{' '}
              <strong className={activeCandle.close >= activeCandle.open ? 'text-emerald-400' : 'text-rose-400'}>
                ${activeCandle.close}
              </strong>
            </span>
            <span>
              Vol:{' '}
              <strong className="text-slate-300">
                ${(activeCandle.volume / 1000000).toFixed(2)}M
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* SVG Canvas Container */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Area Gradient */}
            <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background Grid */}
          {priceGridLevels.map((price, i) => {
            const y = priceToY(price);
            return (
              <g key={i}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                {/* Right Axis Price Label */}
                <text
                  x={width - margin.right + 8}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  ${price < 1 ? price.toFixed(4) : price.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </text>
              </g>
            );
          })}

          {/* Volume Separator Line */}
          <line
            x1={margin.left}
            y1={margin.top + priceChartHeight}
            x2={width - margin.right}
            y2={margin.top + priceChartHeight}
            stroke="#334155"
            strokeWidth="1"
          />
          <text
            x={margin.left + 5}
            y={margin.top + priceChartHeight + 12}
            fill="#475569"
            fontSize="9"
            fontFamily="monospace"
          >
            VOL (24H)
          </text>

          {/* Support and Resistance Horizontal Marker Lines */}
          {showSR && (
            <g>
              {indicators.supportLevels.slice(0, 2).map((sup, idx) => {
                const y = priceToY(sup);
                return (
                  <g key={`sup-${idx}`}>
                    <line
                      x1={margin.left}
                      y1={y}
                      x2={width - margin.right}
                      y2={y}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      strokeWidth="1.2"
                      opacity="0.75"
                    />
                    <rect
                      x={margin.left + 4}
                      y={y - 14}
                      width="80"
                      height="13"
                      rx="3"
                      fill="#064e3b"
                      opacity="0.85"
                    />
                    <text
                      x={margin.left + 8}
                      y={y - 4}
                      fill="#34d399"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      SUP ${sup < 1 ? sup.toFixed(3) : Math.round(sup)}
                    </text>
                  </g>
                );
              })}

              {indicators.resistanceLevels.slice(0, 2).map((res, idx) => {
                const y = priceToY(res);
                return (
                  <g key={`res-${idx}`}>
                    <line
                      x1={margin.left}
                      y1={y}
                      x2={width - margin.right}
                      y2={y}
                      stroke="#f43f5e"
                      strokeDasharray="4 4"
                      strokeWidth="1.2"
                      opacity="0.75"
                    />
                    <rect
                      x={margin.left + 4}
                      y={y - 14}
                      width="80"
                      height="13"
                      rx="3"
                      fill="#4c0519"
                      opacity="0.85"
                    />
                    <text
                      x={margin.left + 8}
                      y={y - 4}
                      fill="#fb7185"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      RES ${res < 1 ? res.toFixed(3) : Math.round(res)}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Target & Stop Loss Lines directly on chart */}
          {showTargets && (
            <g>
              {/* Target 1 Line */}
              {signal.targets[0] && (
                <g>
                  <line
                    x1={margin.left}
                    y1={priceToY(signal.targets[0].price)}
                    x2={width - margin.right}
                    y2={priceToY(signal.targets[0].price)}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                  <rect
                    x={width - margin.right - 95}
                    y={priceToY(signal.targets[0].price) - 10}
                    width="90"
                    height="18"
                    rx="4"
                    fill="#059669"
                  />
                  <text
                    x={width - margin.right - 50}
                    y={priceToY(signal.targets[0].price) + 3}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    TARGET 1 (+{signal.targets[0].pct}%)
                  </text>
                </g>
              )}

              {/* Target 2 Line */}
              {signal.targets[1] && (
                <g>
                  <line
                    x1={margin.left}
                    y1={priceToY(signal.targets[1].price)}
                    x2={width - margin.right}
                    y2={priceToY(signal.targets[1].price)}
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  <rect
                    x={width - margin.right - 105}
                    y={priceToY(signal.targets[1].price) - 10}
                    width="100"
                    height="18"
                    rx="4"
                    fill="#047857"
                  />
                  <text
                    x={width - margin.right - 55}
                    y={priceToY(signal.targets[1].price) + 3}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    ★ TARGET 2 (+{signal.targets[1].pct}%)
                  </text>
                </g>
              )}

              {/* Stop Loss Line */}
              <g>
                <line
                  x1={margin.left}
                  y1={priceToY(signal.stopLoss.price)}
                  x2={width - margin.right}
                  y2={priceToY(signal.stopLoss.price)}
                  stroke="#e11d48"
                  strokeWidth="2"
                  strokeDasharray="3 2"
                />
                <rect
                  x={width - margin.right - 110}
                  y={priceToY(signal.stopLoss.price) - 10}
                  width="105"
                  height="18"
                  rx="4"
                  fill="#be123c"
                />
                <text
                  x={width - margin.right - 58}
                  y={priceToY(signal.stopLoss.price) + 3}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  ⚠ STOP LOSS (-{signal.stopLoss.pct}%)
                </text>
              </g>
            </g>
          )}

          {/* Volume Bars */}
          {displayCandles.map((c, i) => {
            const x = candleToX(i);
            const barW = Math.max(1.5, (chartWidth / displayCandles.length) * 0.7);
            const y = volumeToY(c.volume);
            const h = margin.top + chartHeight - y;
            const isGreen = c.close >= c.open;

            return (
              <rect
                key={`vol-${i}`}
                x={x - barW / 2}
                y={y}
                width={barW}
                height={Math.max(1, h)}
                fill={isGreen ? '#10b981' : '#f43f5e'}
                opacity="0.35"
              />
            );
          })}

          {/* Line or Candlesticks */}
          {chartType === 'line' ? (
            <g>
              <path d={areaPath} fill="url(#areaGlow)" />
              <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            </g>
          ) : (
            displayCandles.map((c, i) => {
              const x = candleToX(i);
              const barW = Math.max(2, (chartWidth / displayCandles.length) * 0.7);
              const isGreen = c.close >= c.open;
              const openY = priceToY(c.open);
              const closeY = priceToY(c.close);
              const highY = priceToY(c.high);
              const lowY = priceToY(c.low);
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(2, Math.abs(closeY - openY));

              const color = isGreen ? '#10b981' : '#f43f5e';

              return (
                <g key={`candle-${i}`}>
                  {/* Wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  {/* Candle Body */}
                  <rect
                    x={x - barW / 2}
                    y={bodyTop}
                    width={barW}
                    height={bodyHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })
          )}

          {/* EMA 20 and EMA 50 Lines */}
          {showEMA && (
            <g>
              {/* EMA 20 (Amber) */}
              {ema20Line.length > 0 && (
                <path
                  d={ema20Line
                    .map((val, i) => {
                      const candleIndex = displayCandles.length - ema20Line.length + i;
                      if (candleIndex < 0) return '';
                      return `${i === 0 ? 'M' : 'L'} ${candleToX(candleIndex).toFixed(1)} ${priceToY(val).toFixed(1)}`;
                    })
                    .filter(Boolean)
                    .join(' ')}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="1.8"
                  opacity="0.9"
                />
              )}

              {/* EMA 50 (Cyan) */}
              {ema50Line.length > 0 && (
                <path
                  d={ema50Line
                    .map((val, i) => {
                      const candleIndex = displayCandles.length - ema50Line.length + i;
                      if (candleIndex < 0) return '';
                      return `${i === 0 ? 'M' : 'L'} ${candleToX(candleIndex).toFixed(1)} ${priceToY(val).toFixed(1)}`;
                    })
                    .filter(Boolean)
                    .join(' ')}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  opacity="0.9"
                />
              )}
            </g>
          )}

          {/* Date Labels on X Axis */}
          {dateIntervals.map(({ index, candle }) => {
            const x = candleToX(index);
            return (
              <text
                key={`dt-${index}`}
                x={x}
                y={margin.top + chartHeight + 20}
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {candle.dateStr.slice(5)}
              </text>
            );
          })}

          {/* Interactive Crosshair Cursor */}
          {hoverIndex !== null && displayCandles[hoverIndex] && (
            <g>
              {/* Vertical line */}
              <line
                x1={candleToX(hoverIndex)}
                y1={margin.top}
                x2={candleToX(hoverIndex)}
                y2={margin.top + chartHeight}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Horizontal line */}
              <line
                x1={margin.left}
                y1={priceToY(displayCandles[hoverIndex].close)}
                x2={width - margin.right}
                y2={priceToY(displayCandles[hoverIndex].close)}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Active price point marker */}
              <circle
                cx={candleToX(hoverIndex)}
                cy={priceToY(displayCandles[hoverIndex].close)}
                r="4.5"
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Chart Legend Footer */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-amber-400 rounded"></span>
            <span>EMA 20 (${indicators.ema20.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-sky-400 rounded"></span>
            <span>EMA 50 (${indicators.ema50.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-emerald-500 rounded border border-emerald-400"></span>
            <span>Support Levels</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-rose-500 rounded border border-rose-400"></span>
            <span>Resistance Levels</span>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500">
          {language === 'ur'
            ? 'Mouse ghuma kar rozana k daam (Open, High, Low, Close) check karein'
            : 'Hover anywhere on the chart for exact daily candle metrics'}
        </div>
      </div>
    </div>
  );
};
