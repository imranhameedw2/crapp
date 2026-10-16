import React from 'react';
import {
  Radio,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  ArrowRight,
  Flame,
  Zap,
} from 'lucide-react';
import type { MarketSignalItem, CoinInfo } from '../types/crypto.ts';

interface UpcomingSignalsRadarProps {
  signals: MarketSignalItem[];
  onSelectCoinBySymbol: (symbol: string) => void;
  language: 'ur' | 'en';
}

export const UpcomingSignalsRadar: React.FC<UpcomingSignalsRadarProps> = ({
  signals,
  onSelectCoinBySymbol,
  language,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>{language === 'ur' ? 'Live Upcoming Market Signals (Signal Radar)' : 'Live Upcoming Market Signals Radar'}</span>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Scanner
            </span>
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          {language === 'ur'
            ? 'Top crypto coins mn aany walay fresh signals — click kar k 6 month analysis open karein.'
            : 'Fresh algorithmic signals detected across high-volume market pairs.'}
        </p>
      </div>

      {/* Grid of Upcoming Signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {signals.map((sig) => {
          const isBuy = sig.signalType === 'BUY';
          const isSell = sig.signalType === 'SELL';

          return (
            <div
              key={sig.id}
              className={`rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between group ${
                isBuy
                  ? 'bg-gradient-to-b from-emerald-950/20 to-slate-950 border-emerald-500/30 hover:border-emerald-500'
                  : isSell
                  ? 'bg-gradient-to-b from-rose-950/20 to-slate-950 border-rose-500/30 hover:border-rose-500'
                  : 'bg-gradient-to-b from-amber-950/10 to-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top Row: Coin info & Signal Badge */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-base font-sans">{sig.symbol}</span>
                    <span className={`text-xs font-mono font-bold ${sig.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {sig.change24h >= 0 ? '+' : ''}{sig.change24h.toFixed(1)}%
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono tracking-wider ${
                      isBuy
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isSell
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {isBuy ? 'BUY' : isSell ? 'SELL' : 'WATCH'}
                  </span>
                </div>

                {/* Signal Name / Condition */}
                <div className="text-xs font-bold text-slate-200 line-clamp-1 mb-2">
                  {language === 'ur' ? sig.urduSignalName : sig.signalName}
                </div>

                {/* Price and Levels */}
                <div className="space-y-1.5 text-xs font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex justify-between text-slate-400">
                    <span>Price:</span>
                    <span className="text-white font-bold">
                      ${sig.price < 1 ? sig.price.toFixed(4) : sig.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" /> Target:
                    </span>
                    <span className="font-bold">
                      ${sig.targetPrice < 1 ? sig.targetPrice.toFixed(4) : sig.targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span className="flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Stop:
                    </span>
                    <span className="font-bold">
                      ${sig.stopPrice < 1 ? sig.stopPrice.toFixed(4) : sig.stopPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectCoinBySymbol(sig.symbol)}
                className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{language === 'ur' ? '6-Month Analysis Kholein' : 'Analyze 6-Month Chart'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
