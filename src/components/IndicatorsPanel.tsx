import React from 'react';
import {
  Activity,
  BarChart3,
  Gauge,
  TrendingUp,
  TrendingDown,
  Layers,
  Sliders,
  Calendar,
} from 'lucide-react';
import type { TechnicalIndicators } from '../types/crypto.ts';

interface IndicatorsPanelProps {
  indicators: TechnicalIndicators;
  currentPrice: number;
  symbol: string;
  language: 'ur' | 'en';
}

export const IndicatorsPanel: React.FC<IndicatorsPanelProps> = ({
  indicators,
  currentPrice,
  symbol,
  language,
}) => {
  // RSI Status
  const rsi = indicators.rsi14;
  const rsiStatus =
    rsi < 30
      ? { label: 'Oversold (Boht Sasta / Buy Zone)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
      : rsi > 70
      ? { label: 'Overbought (Mehanga / Sell Zone)', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' }
      : { label: 'Neutral (Normal Flow)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };

  // 6M Progress relative to 6M Low and 6M High
  const range6M = indicators.sixMonthHigh - indicators.sixMonthLow;
  const progress6M = range6M > 0 ? ((currentPrice - indicators.sixMonthLow) / range6M) * 100 : 50;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          <h3 className="text-base sm:text-lg font-bold text-white">
            {language === 'ur'
              ? '6 Mahiney K Deep Technical Indicators (Aadad o Shumar)'
              : '6-Month Deep Technical Indicators Breakdown'}
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">180D Daily Engine</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. RSI (14) Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-sky-400" />
              RSI (14 Period)
            </span>
            <span className="font-mono text-white font-bold">{rsi}</span>
          </div>

          {/* Visual RSI Slider */}
          <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mt-2">
            {/* Zones: Green <30, Gray 30-70, Red >70 */}
            <div className="absolute left-0 top-0 bottom-0 w-[30%] bg-emerald-500/40" />
            <div className="absolute left-[30%] top-0 bottom-0 w-[40%] bg-slate-700/40" />
            <div className="absolute left-[70%] top-0 bottom-0 w-[30%] bg-rose-500/40" />

            {/* Needle indicator */}
            <div
              className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-md -translate-x-1"
              style={{ left: `${Math.max(2, Math.min(98, rsi))}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>0 (Oversold)</span>
            <span>50</span>
            <span>100 (Overbought)</span>
          </div>

          <div className={`mt-2.5 px-2 py-1 rounded text-[11px] font-semibold text-center border ${rsiStatus.color}`}>
            {rsiStatus.label}
          </div>
        </div>

        {/* 2. MACD (12, 26, 9) Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              MACD Momentum
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                indicators.macd.trend === 'BULLISH'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {indicators.macd.trend}
            </span>
          </div>

          <div className="space-y-1 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">MACD Line:</span>
              <span className="text-white font-bold">{indicators.macd.macd}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Signal Line:</span>
              <span className="text-slate-300">{indicators.macd.signal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Histogram:</span>
              <span
                className={`font-bold ${
                  indicators.macd.histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {indicators.macd.histogram > 0 ? '+' : ''}
                {indicators.macd.histogram}
              </span>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-400">
            {indicators.macd.histogram >= 0
              ? 'Bullish buyers dominating'
              : 'Bearish sellers dominating'}
          </div>
        </div>

        {/* 3. Bollinger Bands (20, 2) Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              Bollinger Bands
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              %B: {indicators.bollinger.percentB}
            </span>
          </div>

          <div className="space-y-1 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Upper Band:</span>
              <span className="text-rose-400 font-bold">
                ${indicators.bollinger.upper < 1 ? indicators.bollinger.upper.toFixed(4) : Math.round(indicators.bollinger.upper).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Middle (SMA 20):</span>
              <span className="text-slate-300">
                ${indicators.bollinger.middle < 1 ? indicators.bollinger.middle.toFixed(4) : Math.round(indicators.bollinger.middle).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Lower Band:</span>
              <span className="text-emerald-400 font-bold">
                ${indicators.bollinger.lower < 1 ? indicators.bollinger.lower.toFixed(4) : Math.round(indicators.bollinger.lower).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-400">
            {indicators.bollinger.percentB > 0.8
              ? 'Testing Upper Resistance Band'
              : indicators.bollinger.percentB < 0.2
              ? 'Testing Lower Support Floor'
              : 'Trading within Healthy Channel'}
          </div>
        </div>

        {/* 4. 6-Month Range & High/Low Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {language === 'ur' ? '6 Mah Ka Range' : '6-Month Range'}
            </span>
            <span
              className={`text-[10px] font-bold font-mono ${
                indicators.sixMonthChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {indicators.sixMonthChangePct >= 0 ? '+' : ''}
              {indicators.sixMonthChangePct}% (6M)
            </span>
          </div>

          {/* High / Low Bar */}
          <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"
              style={{ width: '100%' }}
            />
            {/* Current Position Marker */}
            <div
              className="absolute top-0 bottom-0 w-2.5 bg-white border border-slate-950 rounded-full shadow -translate-x-1"
              style={{ left: `${Math.max(2, Math.min(98, progress6M))}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono mt-2">
            <div>
              <span className="text-slate-500 block text-[9px]">6M LOW</span>
              <span className="text-rose-400 font-bold">
                ${indicators.sixMonthLow < 1 ? indicators.sixMonthLow.toFixed(4) : Math.round(indicators.sixMonthLow).toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[9px]">6M HIGH</span>
              <span className="text-emerald-400 font-bold">
                ${indicators.sixMonthHigh < 1 ? indicators.sixMonthHigh.toFixed(4) : Math.round(indicators.sixMonthHigh).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-slate-400 font-mono text-center">
            Daily ATR Volatility: ${indicators.atr14 < 1 ? indicators.atr14.toFixed(4) : indicators.atr14.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};
