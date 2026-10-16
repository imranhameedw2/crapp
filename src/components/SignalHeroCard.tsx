import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Percent,
  Clock,
  Crosshair,
} from 'lucide-react';
import type { SignalRecommendation } from '../types/crypto.ts';

interface SignalHeroCardProps {
  signal: SignalRecommendation;
  symbol: string;
  currentPrice: number;
  language: 'ur' | 'en';
}

export const SignalHeroCard: React.FC<SignalHeroCardProps> = ({
  signal,
  symbol,
  currentPrice,
  language,
}) => {
  const isBuy =
    signal.action === 'STRONG_BUY' ||
    signal.action === 'BUY';
  const isSell =
    signal.action === 'STRONG_SELL' ||
    signal.action === 'SELL';
  const isNeutral = signal.action === 'NEUTRAL_WAIT';

  // Visual Theme
  const theme = isBuy
    ? {
        border: 'border-emerald-500/50',
        bg: 'from-emerald-950/40 via-slate-900 to-slate-900',
        badgeBg: 'bg-emerald-500 text-slate-950',
        textColor: 'text-emerald-400',
        barColor: 'bg-emerald-500',
        ring: 'ring-emerald-500/30',
      }
    : isSell
    ? {
        border: 'border-rose-500/50',
        bg: 'from-rose-950/40 via-slate-900 to-slate-900',
        badgeBg: 'bg-rose-500 text-white',
        textColor: 'text-rose-400',
        barColor: 'bg-rose-500',
        ring: 'ring-rose-500/30',
      }
    : {
        border: 'border-amber-500/50',
        bg: 'from-amber-950/30 via-slate-900 to-slate-900',
        badgeBg: 'bg-amber-500 text-slate-950',
        textColor: 'text-amber-400',
        barColor: 'bg-amber-500',
        ring: 'ring-amber-500/30',
      };

  return (
    <div
      className={`rounded-2xl border ${theme.border} bg-gradient-to-b ${theme.bg} p-5 sm:p-6 shadow-2xl relative overflow-hidden`}
    >
      {/* Background Glow */}
      <div
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none ${
          isBuy ? 'bg-emerald-500' : isSell ? 'bg-rose-500' : 'bg-amber-500'
        }`}
      />

      {/* Main Signal Header & Trade Verdict */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {language === 'ur' ? '6 Mahiney K Data Ka Nateeja (Signal):' : '6-Month Algorithmic Signal:'}
            </span>
            <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              {signal.timeframe}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${theme.textColor}`}>
              {language === 'ur' ? signal.actionUrdu : signal.action.replace('_', ' ')}
            </h3>

            {/* Verdict Badge */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase shadow-lg ${theme.badgeBg}`}
            >
              {language === 'ur' ? signal.verdictUrdu : signal.verdict.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Signal Confidence Meter */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 px-4 min-w-[200px] flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              {language === 'ur' ? 'Yaqeen / Confidence' : 'Signal Strength'}
            </div>
            <div className="text-xl font-black font-mono text-white flex items-center gap-1">
              <span>{signal.confidence}%</span>
              <span className="text-xs text-slate-400 font-normal">
                {signal.confidence >= 70 ? 'High' : signal.confidence >= 50 ? 'Moderate' : 'Low'}
              </span>
            </div>
          </div>

          <div className="w-14 h-14 relative flex items-center justify-center">
            {/* Circular Progress Gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={theme.textColor}
                strokeDasharray={`${signal.confidence}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[10px] font-bold font-mono text-slate-300">
              {signal.confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Prominent Action Banner: "Es Waqt Buying Kerni Hay / Selling Kerni Hay" */}
      <div className="my-5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            isBuy
              ? 'bg-emerald-500/20 text-emerald-400'
              : isSell
              ? 'bg-rose-500/20 text-rose-400'
              : 'bg-amber-500/20 text-amber-400'
          }`}
        >
          {isBuy ? (
            <TrendingUp className="w-5 h-5" />
          ) : isSell ? (
            <TrendingDown className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
            {language === 'ur' ? 'Direct Mashwara / Trade Advice:' : 'Direct Execution Advice:'}
          </div>
          <div className="text-sm sm:text-base font-extrabold text-white">
            {language === 'ur' ? (
              isBuy ? (
                <span>
                  Es waqat <strong className="text-emerald-400 underline decoration-emerald-500 decoration-2">BUYING (Kharidari)</strong> kerni chie. Entry zone mein buy karein aur targets ka intezar karein.
                </span>
              ) : isSell ? (
                <span>
                  Es waqat <strong className="text-rose-400 underline decoration-rose-500 decoration-2">SELLING (Munafa Book / Short)</strong> kerni chie. Buying se guraiz karein.
                </span>
              ) : (
                <span>
                  Es waqat <strong className="text-amber-400 underline decoration-amber-500 decoration-2">WAIT (Intezar)</strong> karein. Market range-bound hay, clear breakout ka wait karein.
                </span>
              )
            ) : isBuy ? (
              <span>
                Action: <strong className="text-emerald-400">ENTER BUY (LONG)</strong> position in the recommended entry zone.
              </span>
            ) : isSell ? (
              <span>
                Action: <strong className="text-rose-400">EXIT / SELL (SHORT)</strong> positions. High resistance & distribution detected.
              </span>
            ) : (
              <span>
                Action: <strong className="text-amber-400">STAND ASIDE / NO TRADE</strong>. Wait for candle close outside the range.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Numerical Levels Grid (Entry, Targets, Stop Loss, Risk-to-Reward) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 my-4">
        {/* Entry Zone */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold flex items-center gap-1 text-sky-400">
              <Crosshair className="w-3.5 h-3.5" />
              {language === 'ur' ? 'Es Waqat Entry Price' : 'Optimal Entry Zone'}
            </span>
            <span className="text-[10px] font-mono text-slate-500">NOW</span>
          </div>
          <div className="text-xl font-black font-mono text-white mt-1">
            ${signal.entryZone.optimal < 1 ? signal.entryZone.optimal.toFixed(6) : signal.entryZone.optimal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
            <span>Range:</span>
            <span>${signal.entryZone.min < 1 ? signal.entryZone.min.toFixed(4) : signal.entryZone.min.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            <span>-</span>
            <span>${signal.entryZone.max < 1 ? signal.entryZone.max.toFixed(4) : signal.entryZone.max.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Targets Summary ("Yahan Tak Jaye Ga") */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold flex items-center gap-1 text-emerald-400">
              <Target className="w-3.5 h-3.5" />
              {language === 'ur' ? 'Yahan Tak Jaye Ga' : 'Profit Targets (Take-Profit)'}
            </span>
            <span className="text-[10px] font-mono text-emerald-400">T1 - T3</span>
          </div>
          <div className="text-xl font-black font-mono text-emerald-400 mt-1">
            ${signal.targets[1]?.price < 1 ? signal.targets[1]?.price.toFixed(6) : signal.targets[1]?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">T2 Gain:</span>
            <span className="text-emerald-300">+{signal.targets[1]?.pct}%</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">T3: +{signal.targets[2]?.pct}%</span>
          </div>
        </div>

        {/* Stop Loss ("Yahan Loss Cut Karna Hay") */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden group hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold flex items-center gap-1 text-rose-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              {language === 'ur' ? 'Stop Loss (Loss Cut)' : 'Stop Loss Price'}
            </span>
            <span className="text-[10px] font-mono text-rose-400">RISK LIMIT</span>
          </div>
          <div className="text-xl font-black font-mono text-rose-400 mt-1">
            ${signal.stopLoss.price < 1 ? signal.stopLoss.price.toFixed(6) : signal.stopLoss.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-1">
            <span>Loss Distance:</span>
            <span className="text-rose-400 font-bold">-{signal.stopLoss.pct}%</span>
          </div>
        </div>

        {/* Risk to Reward Ratio */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold flex items-center gap-1 text-amber-400">
              <Percent className="w-3.5 h-3.5" />
              {language === 'ur' ? 'Risk To Reward Ratio' : 'Risk : Reward Ratio'}
            </span>
            <span className="text-[10px] font-mono text-amber-400">R : R</span>
          </div>
          <div className="text-xl font-black font-mono text-amber-400 mt-1">
            1 : {signal.riskRewardRatio}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {signal.riskRewardRatio >= 2 ? (
              <span className="text-emerald-400 font-semibold">
                {language === 'ur' ? 'Zabardast Ratio (Umda Trade)' : 'Excellent Ratio (High Edge)'}
              </span>
            ) : (
              <span className="text-amber-400 font-semibold">
                {language === 'ur' ? 'Mamooli Ratio' : 'Acceptable Ratio'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Target Breakdown Strip: T1, T2, T3 Detailed Cards */}
      <div className="mt-4 pt-4 border-t border-slate-800/80">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2.5 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {language === 'ur'
              ? 'Tafseelat: Price Kahan Tak Jaye Gi (3 Profit Levels):'
              : 'Detailed Target Trajectory (3 Take-Profit Milestones):'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {signal.targets.map((tgt, i) => (
            <div
              key={tgt.level}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 text-[10px] flex items-center justify-center font-mono font-bold">
                    {i + 1}
                  </span>
                  <span>{tgt.level}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'ur' ? tgt.urduLabel : tgt.label}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-white text-sm">
                  ${tgt.price < 1 ? tgt.price.toFixed(4) : tgt.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400">
                  +{tgt.pct}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reasons & Deep Technical Justification List */}
      <div className="mt-4 pt-4 border-t border-slate-800/80">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
          <span>
            {language === 'ur'
              ? '6 Mahiney K Chart Par Yeh Faisla Q Liya Gya? (Technical Wajohat):'
              : '6-Month Chart Technical Evidence & Rationale:'}
          </span>
        </div>

        <ul className="space-y-1.5 text-xs text-slate-300">
          {(language === 'ur' ? signal.urduReasons : signal.reasons).map((reason, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
              <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
              <span>{reason}</span>
            </li>
          ))}
          <li className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-lg border border-slate-800/50">
            <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
            <span>
              <strong>Stop Loss Logic:</strong> {language === 'ur' ? signal.stopLoss.urduReason : signal.stopLoss.reason}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
