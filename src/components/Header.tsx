import React from 'react';
import { Activity, RefreshCw, Globe, TrendingUp, ShieldCheck } from 'lucide-react';
import type { CoinInfo } from '../types/crypto.ts';

interface HeaderProps {
  topCoins: CoinInfo[];
  selectedCoin: CoinInfo | null;
  onSelectCoin: (coin: CoinInfo) => void;
  language: 'ur' | 'en';
  onToggleLanguage: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  topCoins,
  selectedCoin,
  onSelectCoin,
  language,
  onToggleLanguage,
  onRefresh,
  isLoading,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      {/* Top Ticker Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 py-1.5 overflow-x-auto scrollbar-none text-xs flex items-center gap-6">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>LIVE MARKET:</span>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          {topCoins.slice(0, 8).map((c) => {
            const isPos = c.change24h >= 0;
            const isSelected = selectedCoin?.symbol === c.symbol;
            return (
              <button
                key={c.symbol}
                onClick={() => onSelectCoin(c)}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer hover:opacity-100 ${
                  isSelected ? 'text-amber-400 font-bold' : 'text-slate-300 opacity-80'
                }`}
                title={`Click to analyze ${c.symbol}`}
              >
                <span className="font-semibold text-slate-200">{c.symbol}</span>
                <span className="font-mono">${c.price < 1 ? c.price.toFixed(4) : c.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className={`text-[11px] font-mono ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? '+' : ''}{c.change24h.toFixed(1)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main App Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">
                Crypto<span className="text-amber-400">Pulse</span> <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">PRO 6M</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-medium">
                <ShieldCheck className="w-3 h-3" />
                Live Deep Analysis
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {language === 'ur'
                ? '6 Mahiney Ka Gehra Technical Analysis, Buy/Sell Signals Aur Risk Calculator'
                : '6-Month Deep Technical Analysis, Buy/Sell Signals & Risk Management'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
            title="Toggle between Urdu / English"
            aria-label="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ur' ? 'Language: Roman Urdu' : 'Language: English'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition cursor-pointer disabled:opacity-50"
            aria-label="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{language === 'ur' ? 'Taaza Karein' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
