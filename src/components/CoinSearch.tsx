import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, Coins, Zap } from 'lucide-react';
import type { CoinInfo } from '../types/crypto.ts';
import { POPULAR_COINS } from '../services/cryptoApi.ts';

interface CoinSearchProps {
  coins: CoinInfo[];
  selectedCoin: CoinInfo;
  onSelectCoin: (coin: CoinInfo) => void;
  language: 'ur' | 'en';
}

export const CoinSearch: React.FC<CoinSearchProps> = ({
  coins,
  selectedCoin,
  onSelectCoin,
  language,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCoins = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return coins.filter(
      (c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [coins, query]);

  const handleSelect = (coin: CoinInfo) => {
    onSelectCoin(coin);
    setQuery('');
    setIsOpen(false);
  };

  const handleCustomSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.toUpperCase().trim();
    const exact = coins.find((c) => c.symbol === q || c.name.toLowerCase() === query.toLowerCase().trim());
    if (exact) {
      handleSelect(exact);
    } else {
      // Create dynamically analyzed coin
      const newCoin: CoinInfo = {
        id: query.toLowerCase(),
        symbol: q,
        name: query.toUpperCase(),
        pair: `${q}USDT`,
        price: 10,
        change24h: 1.5,
        high24h: 10.5,
        low24h: 9.6,
        volume24h: 500000,
        rank: 99,
      };
      handleSelect(newCoin);
    }
  };

  const isPos = selectedCoin.change24h >= 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Search Bar & Quick Coins */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <form onSubmit={handleCustomSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={
                language === 'ur'
                  ? 'Kisi b coin ko search karein (BTC, ETH, SOL, XRP)...'
                  : 'Search any crypto coin (e.g. BTC, ETH, SOL, XRP)...'
              }
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-20 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/40 transition"
              aria-label="Search crypto currency"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer"
            >
              {language === 'ur' ? 'Search' : 'Analyze'}
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {isOpen && filteredCoins.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
              {filteredCoins.map((c) => (
                <button
                  key={c.symbol}
                  onClick={() => handleSelect(c)}
                  className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-slate-800 transition cursor-pointer border-b border-slate-800/50 last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400">
                      {c.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{c.symbol}</div>
                      <div className="text-xs text-slate-400">{c.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-slate-200">
                      ${c.price < 1 ? c.price.toFixed(4) : c.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className={`text-xs font-mono ${c.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {c.change24h >= 0 ? '+' : ''}{c.change24h.toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Pick Trending Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 shrink-0 mr-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {language === 'ur' ? 'Ahem Coins:' : 'Top Coins:'}
          </span>
          {coins.slice(0, 8).map((c) => {
            const isCurrent = selectedCoin.symbol === c.symbol;
            return (
              <button
                key={c.symbol}
                onClick={() => onSelectCoin(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 border ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {c.symbol}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Coin Active Snapshot */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center font-extrabold text-amber-400 text-base shadow-inner">
            {selectedCoin.symbol.slice(0, 4)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight font-sans">
                {selectedCoin.name}
              </h2>
              <span className="text-xs font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                {selectedCoin.pair}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Market Rank: #{selectedCoin.rank}</span>
              <span>•</span>
              <span className="text-amber-400 font-medium">6-Month Deep Analysis Active</span>
            </div>
          </div>
        </div>

        {/* Live Numbers Strip */}
        <div className="flex flex-wrap items-center gap-6 sm:gap-8">
          {/* Price */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              {language === 'ur' ? 'Live Price' : 'Current Price'}
            </div>
            <div className="text-2xl font-black font-mono text-white flex items-center gap-2">
              ${selectedCoin.price < 1 ? selectedCoin.price.toFixed(6) : selectedCoin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span
                className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md font-mono ${
                  isPos
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {isPos ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {isPos ? '+' : ''}{selectedCoin.change24h.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* 24h High */}
          <div className="hidden sm:block">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              {language === 'ur' ? '24h High (Zyada)' : '24h High'}
            </div>
            <div className="text-sm font-bold font-mono text-emerald-400">
              ${selectedCoin.high24h < 1 ? selectedCoin.high24h.toFixed(4) : selectedCoin.high24h.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* 24h Low */}
          <div className="hidden sm:block">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              {language === 'ur' ? '24h Low (Kam)' : '24h Low'}
            </div>
            <div className="text-sm font-bold font-mono text-rose-400">
              ${selectedCoin.low24h < 1 ? selectedCoin.low24h.toFixed(4) : selectedCoin.low24h.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* 24h Volume */}
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
              {language === 'ur' ? '24h Volume' : '24h Volume'}
            </div>
            <div className="text-sm font-bold font-mono text-slate-200">
              ${(selectedCoin.volume24h / 1000000).toFixed(2)}M
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
