/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import type {
  CoinInfo,
  Candle,
  TechnicalIndicators,
  SignalRecommendation,
  MarketSignalItem,
} from './types/crypto.ts';
import {
  fetchTopCoins,
  fetch6MonthCandles,
  scanMarketSignals,
  POPULAR_COINS,
} from './services/cryptoApi.ts';
import {
  calculate6MonthIndicators,
  generateCryptoSignal,
} from './utils/indicators.ts';
import { Header } from './components/Header.tsx';
import { CoinSearch } from './components/CoinSearch.tsx';
import { SignalHeroCard } from './components/SignalHeroCard.tsx';
import { TechnicalChart } from './components/TechnicalChart.tsx';
import { IndicatorsPanel } from './components/IndicatorsPanel.tsx';
import { RiskCalculator } from './components/RiskCalculator.tsx';
import { UpcomingSignalsRadar } from './components/UpcomingSignalsRadar.tsx';
import { ShieldCheck, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<'ur' | 'en'>('ur');
  const [topCoins, setTopCoins] = useState<CoinInfo[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<CoinInfo | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [signal, setSignal] = useState<SignalRecommendation | null>(null);
  const [upcomingSignals, setUpcomingSignals] = useState<MarketSignalItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial top coins
  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        const coins = await fetchTopCoins();
        setTopCoins(coins);
        // Default to Bitcoin
        const defaultCoin = coins[0] || {
          id: 'bitcoin',
          symbol: 'BTC',
          name: 'Bitcoin',
          pair: 'BTCUSDT',
          price: 87500,
          change24h: 2.5,
          high24h: 89000,
          low24h: 86000,
          volume24h: 25000000000,
          rank: 1,
        };
        setSelectedCoin(defaultCoin);

        // Scan upcoming market signals
        const signals = await scanMarketSignals(coins);
        setUpcomingSignals(signals);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize market data');
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // When selected coin changes, load 6-month historical candles & run analysis
  const analyzeCoin = useCallback(async (coin: CoinInfo) => {
    try {
      setIsLoading(true);
      setError(null);
      const c = await fetch6MonthCandles(coin.symbol, coin.price);
      setCandles(c);

      const computedIndicators = calculate6MonthIndicators(c);
      setIndicators(computedIndicators);

      const computedSignal = generateCryptoSignal(c, coin.price, computedIndicators);
      setSignal(computedSignal);
    } catch (err: any) {
      setError(err.message || 'Analysis error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCoin) {
      analyzeCoin(selectedCoin);
    }
  }, [selectedCoin, analyzeCoin]);

  // Refresh handler
  const handleRefresh = async () => {
    if (!selectedCoin) return;
    setIsLoading(true);
    const coins = await fetchTopCoins();
    setTopCoins(coins);
    const updatedSelected = coins.find((c) => c.symbol === selectedCoin.symbol) || selectedCoin;
    setSelectedCoin(updatedSelected);
    await analyzeCoin(updatedSelected);
    const signals = await scanMarketSignals(coins);
    setUpcomingSignals(signals);
  };

  // Select coin by symbol (from Radar or header ticker)
  const handleSelectBySymbol = (symbol: string) => {
    const found = topCoins.find((c) => c.symbol.toUpperCase() === symbol.toUpperCase());
    if (found) {
      setSelectedCoin(found);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header
        topCoins={topCoins}
        selectedCoin={selectedCoin}
        onSelectCoin={(coin) => {
          setSelectedCoin(coin);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'ur' ? 'en' : 'ur'))}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Search Bar & Active Coin Snapshot */}
        {selectedCoin && (
          <CoinSearch
            coins={topCoins}
            selectedCoin={selectedCoin}
            onSelectCoin={setSelectedCoin}
            language={language}
          />
        )}

        {/* 2. Primary Signal Hero Card (Trade Verdict, Entry, Targets, Stop Loss) */}
        {signal && selectedCoin && (
          <SignalHeroCard
            signal={signal}
            symbol={selectedCoin.symbol}
            currentPrice={selectedCoin.price}
            language={language}
          />
        )}

        {/* 3. 6-Month Technical Candlestick Chart */}
        {candles.length > 0 && signal && indicators && selectedCoin && (
          <TechnicalChart
            candles={candles}
            signal={signal}
            indicators={indicators}
            symbol={selectedCoin.symbol}
            currentPrice={selectedCoin.price}
            language={language}
          />
        )}

        {/* 4. Trade Risk Calculator & Money Management Engine */}
        {signal && selectedCoin && (
          <RiskCalculator
            signal={signal}
            currentPrice={selectedCoin.price}
            symbol={selectedCoin.symbol}
            language={language}
          />
        )}

        {/* 5. Deep Technical Indicators Panel (RSI, MACD, Bollinger Bands, 6M Range) */}
        {indicators && selectedCoin && (
          <IndicatorsPanel
            indicators={indicators}
            currentPrice={selectedCoin.price}
            symbol={selectedCoin.symbol}
            language={language}
          />
        )}

        {/* 6. Upcoming Signals Radar (Top coins with algorithmic signals) */}
        {upcomingSignals.length > 0 && (
          <UpcomingSignalsRadar
            signals={upcomingSignals}
            onSelectCoinBySymbol={handleSelectBySymbol}
            language={language}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              CryptoPulse Pro • {language === 'ur' ? 'Live 6-Month Algorithmic Technical Engine' : 'Live 6-Month Algorithmic Technical Engine'}
            </span>
          </div>

          <div className="text-slate-500 max-w-xl text-[11px] leading-relaxed">
            {language === 'ur'
              ? 'Khabardaari: Crypto trading mn risk hota hay. Yeh software sirf technical analysis aur risk management calculator faraham karta hay. Hamesha stop loss ka istemal karein.'
              : 'Disclaimer: Crypto trading involves significant market volatility and risk. Signals are generated using 6-month quantitative indicators (RSI, MACD, EMA, Bollinger Bands, ATR). Always practice strict risk management.'}
          </div>
        </div>
      </footer>
    </div>
  );
}
