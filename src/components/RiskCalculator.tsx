import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Coins,
  DollarSign,
  TrendingUp,
  Percent,
  Sparkles,
  Info,
} from 'lucide-react';
import type { SignalRecommendation, TradeRiskInput } from '../types/crypto.ts';
import { calculateRiskManagement } from '../utils/indicators.ts';

interface RiskCalculatorProps {
  signal: SignalRecommendation;
  currentPrice: number;
  symbol: string;
  language: 'ur' | 'en';
}

export const RiskCalculator: React.FC<RiskCalculatorProps> = ({
  signal,
  currentPrice,
  symbol,
  language,
}) => {
  // User Inputs State
  const [balance, setBalance] = useState<number>(1000);
  const [riskPct, setRiskPct] = useState<number>(2);
  const [tradeType, setTradeType] = useState<'SPOT' | 'FUTURES'>('SPOT');
  const [leverage, setLeverage] = useState<number>(3);
  const [useCustomLevels, setUseCustomLevels] = useState<boolean>(false);
  const [customEntry, setCustomEntry] = useState<number>(currentPrice);
  const [customStopLoss, setCustomStopLoss] = useState<number>(signal.stopLoss.price);

  // Sync custom inputs when coin changes
  React.useEffect(() => {
    setCustomEntry(currentPrice);
    setCustomStopLoss(signal.stopLoss.price);
  }, [currentPrice, signal.stopLoss.price]);

  // Risk Calculation
  const riskResult = useMemo(() => {
    const input: TradeRiskInput = {
      accountBalance: balance,
      riskTolerancePct: riskPct,
      tradeType,
      leverage,
      customEntry: useCustomLevels ? customEntry : undefined,
      customStopLoss: useCustomLevels ? customStopLoss : undefined,
    };
    return calculateRiskManagement(input, signal, currentPrice);
  }, [balance, riskPct, tradeType, leverage, useCustomLevels, customEntry, customStopLoss, signal, currentPrice]);

  const ratingColor =
    riskResult.riskRating === 'CONSERVATIVE'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      : riskResult.riskRating === 'MODERATE'
      ? 'text-sky-400 bg-sky-500/10 border-sky-500/30'
      : riskResult.riskRating === 'AGGRESSIVE'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{language === 'ur' ? 'Trade Risk & Capital Calculator' : 'Trade Risk & Position Sizer'}</span>
              <span className="text-[11px] font-medium bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                {language === 'ur' ? 'Apna Risk Janain' : 'Safe Money Mgmt'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'ur'
                ? 'Apna portfolio balance aur risk enter karein, system btaye ga k ap kitna risk khel sakty han.'
                : 'Enter your capital & risk limit to get exact mathematically safe trade position size.'}
            </p>
          </div>
        </div>

        {/* Safety Badge */}
        <div className={`px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${ratingColor}`}>
          <Shield className="w-3.5 h-3.5" />
          <span>
            {language === 'ur'
              ? riskResult.riskRating === 'CONSERVATIVE'
                ? 'Mehfooz Risk (1-2%)'
                : riskResult.riskRating === 'MODERATE'
                ? 'Munāsib Risk (3-5%)'
                : 'Ziyada Khatra (High Risk)'
              : riskResult.riskRating}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Inputs */}
        <div className="lg:col-span-5 space-y-4">
          {/* Account Balance */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{language === 'ur' ? '1. Total Account Balance ($)' : '1. Total Portfolio Balance ($)'}</span>
              <span className="text-amber-400 font-mono font-bold">${balance.toLocaleString()}</span>
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min="10"
                max="1000000"
                step="50"
                value={balance}
                onChange={(e) => setBalance(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400 transition"
              />
            </div>
            {/* Quick Balance Presets */}
            <div className="flex items-center gap-1.5 mt-2">
              {[250, 500, 1000, 5000, 10000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setBalance(preset)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition cursor-pointer border ${
                    balance === preset
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  ${preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Tolerance Percentage */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>{language === 'ur' ? '2. Es Trade Par Kitna Risk Khelna Hay? (%)' : '2. Risk per Trade (%)'}</span>
              <span className="text-amber-400 font-mono font-bold">{riskPct}% (${riskResult.maxRiskAmountUsd})</span>
            </label>
            {/* Risk Slider & Presets */}
            <input
              type="range"
              min="0.5"
              max="15"
              step="0.5"
              value={riskPct}
              onChange={(e) => setRiskPct(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex items-center justify-between gap-1.5 mt-2">
              {[
                { label: '1% (Safe)', val: 1 },
                { label: '2% (Recom.)', val: 2 },
                { label: '3% (Mod.)', val: 3 },
                { label: '5% (Aggro)', val: 5 },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => setRiskPct(p.val)}
                  className={`flex-1 py-1 rounded text-[10px] font-semibold transition cursor-pointer border ${
                    riskPct === p.val
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trade Type (Spot vs Futures) */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              {language === 'ur' ? '3. Trade Ka Tareeqa (Spot ya Futures):' : '3. Execution Market:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTradeType('SPOT')}
                className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  tradeType === 'SPOT'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>SPOT (No Leverage / Zero Liq.)</span>
              </button>
              <button
                onClick={() => setTradeType('FUTURES')}
                className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  tradeType === 'FUTURES'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>FUTURES (With Leverage)</span>
              </button>
            </div>
          </div>

          {/* Leverage Slider (Only if Futures) */}
          {tradeType === 'FUTURES' && (
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Leverage Multiplier:</span>
                <span className="text-amber-400 font-mono font-bold">{leverage}x</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>1x (Safe)</span>
                <span>5x (Standard)</span>
                <span>10x (Risky)</span>
                <span>20x (Extreme)</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Calculated Results & Plain Language Risk Definition */}
        <div className="lg:col-span-7 space-y-4">
          {/* Key Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Max Loss Definition */}
            <div className="bg-slate-950/90 border border-rose-500/30 rounded-xl p-3.5">
              <div className="text-xs text-rose-400 font-semibold flex items-center justify-between">
                <span>{language === 'ur' ? 'Maximum Dollar Risk (Loss Limit)' : 'Max Dollar Risk'}</span>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-2xl font-black font-mono text-rose-400 mt-1">
                ${riskResult.maxRiskAmountUsd.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {language === 'ur'
                  ? `Agar Stop Loss hit ho tu apka sirf $${riskResult.maxRiskAmountUsd} kate ga.`
                  : `Your hard loss threshold if stop loss triggers.`}
              </div>
            </div>

            {/* Recommended Position Size */}
            <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3.5">
              <div className="text-xs text-emerald-400 font-semibold flex items-center justify-between">
                <span>{language === 'ur' ? 'Tajweez Karda Trade Size' : 'Recommended Position Size'}</span>
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                ${riskResult.recommendedPositionSizeUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                ≈ {riskResult.recommendedPositionSizeCoins} {symbol}
              </div>
            </div>
          </div>

          {/* Potential Return Matrix (Target 1, 2, 3 in Dollars) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {language === 'ur'
                  ? 'Apke Capital Par Expected Dollar Munafa (Profit):'
                  : 'Expected Dollar P&L Breakdown:'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Target 1</div>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                  +${riskResult.potentialProfitT1Usd.toFixed(2)}
                </div>
                <div className="text-[10px] text-emerald-500 font-medium font-mono">
                  +{signal.targets[0]?.pct}%
                </div>
              </div>

              <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/40">
                <div className="text-[10px] text-emerald-300 font-mono font-bold">★ Target 2</div>
                <div className="text-sm font-black font-mono text-emerald-400 mt-0.5">
                  +${riskResult.potentialProfitT2Usd.toFixed(2)}
                </div>
                <div className="text-[10px] text-emerald-400 font-bold font-mono">
                  +{signal.targets[1]?.pct}%
                </div>
              </div>

              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Target 3</div>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                  +${riskResult.potentialProfitT3Usd.toFixed(2)}
                </div>
                <div className="text-[10px] text-emerald-500 font-medium font-mono">
                  +{signal.targets[2]?.pct}%
                </div>
              </div>
            </div>

            {/* Liquidation Warning (If Futures) */}
            {tradeType === 'FUTURES' && riskResult.liquidationPrice && (
              <div className="mt-3 p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 flex items-center justify-between text-xs">
                <span className="text-rose-300 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  Estimated Liquidation Price:
                </span>
                <span className="font-mono font-bold text-rose-400">
                  ${riskResult.liquidationPrice < 1 ? riskResult.liquidationPrice.toFixed(4) : riskResult.liquidationPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          {/* Plain Language Risk Assessment & Advice Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 border border-amber-500/30">
            <div className="flex items-start gap-2.5">
              <div className="p-1 rounded-md bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  {language === 'ur' ? 'Apke Lye Risk Ka Faisla (Personalized Advice):' : 'Calculated Risk Assessment:'}
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {language === 'ur' ? riskResult.urduAdviceText : riskResult.adviceText}
                </p>
                <p className="text-[11px] text-slate-400">
                  {language === 'ur'
                    ? `Naseehat: Kabhi b aik trade mn apna 5% se zyada portfolio daao par mat lagayen. Disciplined traders hamesha stop loss lagate han.`
                    : `Golden Rule: Never risk more than 1-3% of total equity on any single swing trade.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
