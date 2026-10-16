export interface Candle {
  time: number; // timestamp in ms
  dateStr: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CoinInfo {
  id: string;
  symbol: string;
  name: string;
  pair: string; // e.g. BTCUSDT
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: number;
  rank: number;
}

export interface TechnicalIndicators {
  rsi14: number;
  ema20: number;
  ema50: number;
  sma200?: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    percentB: number;
  };
  atr14: number;
  supportLevels: number[];
  resistanceLevels: number[];
  trend: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
  sixMonthHigh: number;
  sixMonthLow: number;
  sixMonthChangePct: number;
}

export type SignalAction =
  | 'STRONG_BUY'
  | 'BUY'
  | 'NEUTRAL_WAIT'
  | 'SELL'
  | 'STRONG_SELL';

export interface TargetLevel {
  level: string; // T1, T2, T3
  price: number;
  pct: number;
  label: string;
  urduLabel: string;
}

export interface SignalRecommendation {
  action: SignalAction;
  actionUrdu: string;
  verdict: 'TRADE_NOW' | 'WAIT_NO_TRADE' | 'EXIT_TRADE';
  verdictUrdu: string;
  confidence: number; // 0 - 100
  entryZone: {
    min: number;
    max: number;
    optimal: number;
  };
  targets: TargetLevel[];
  stopLoss: {
    price: number;
    pct: number;
    reason: string;
    urduReason: string;
  };
  riskRewardRatio: number;
  timeframe: string;
  reasons: string[];
  urduReasons: string[];
  generatedAt: number;
}

export interface TradeRiskInput {
  accountBalance: number;
  riskTolerancePct: number;
  tradeType: 'SPOT' | 'FUTURES';
  leverage: number;
  customEntry?: number;
  customStopLoss?: number;
}

export interface RiskCalculationResult {
  maxRiskAmountUsd: number;
  recommendedPositionSizeUsd: number;
  recommendedPositionSizeCoins: number;
  potentialProfitT1Usd: number;
  potentialProfitT2Usd: number;
  potentialProfitT3Usd: number;
  potentialLossUsd: number;
  effectiveLeverage: number;
  liquidationPrice?: number;
  riskRating: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE' | 'HIGH_DANGER';
  adviceText: string;
  urduAdviceText: string;
}

export interface MarketSignalItem {
  id: string;
  symbol: string;
  name: string;
  pair: string;
  price: number;
  change24h: number;
  signalType: 'BUY' | 'SELL' | 'WATCH';
  signalName: string;
  urduSignalName: string;
  strength: number;
  targetPrice: number;
  stopPrice: number;
  timeAgo: string;
}
