import type {
  Candle,
  TechnicalIndicators,
  SignalRecommendation,
  TradeRiskInput,
  RiskCalculationResult,
  SignalAction,
  TargetLevel,
} from '../types/crypto.ts';

/**
 * Calculates Simple Moving Average (SMA)
 */
export function calculateSMA(values: number[], period: number): number[] {
  if (values.length < period) return [];
  const result: number[] = [];
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += values[i];
  }
  result.push(sum / period);

  for (let i = period; i < values.length; i++) {
    sum += values[i] - values[i - period];
    result.push(sum / period);
  }
  return result;
}

/**
 * Calculates Exponential Moving Average (EMA)
 */
export function calculateEMA(values: number[], period: number): number[] {
  if (values.length < period) return [];
  const k = 2 / (period + 1);
  const result: number[] = [];

  // Start with SMA for initial value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += values[i];
  }
  let currentEma = sum / period;
  result.push(currentEma);

  for (let i = period; i < values.length; i++) {
    currentEma = values[i] * k + currentEma * (1 - k);
    result.push(currentEma);
  }
  return result;
}

/**
 * Calculates Relative Strength Index (RSI) - Standard Wilder's Smoothed 14-period
 */
export function calculateRSI(closes: number[], period: number = 14): number[] {
  if (closes.length <= period) return [];

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  const rsiValues: number[] = [];
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - 100 / (1 + rs);
  rsiValues.push(rsi);

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    if (avgLoss === 0) {
      rsi = 100;
    } else {
      rs = avgGain / avgLoss;
      rsi = 100 - 100 / (1 + rs);
    }
    rsiValues.push(rsi);
  }

  return rsiValues;
}

/**
 * Calculates MACD (12, 26, 9)
 */
export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  if (closes.length < slowPeriod + signalPeriod) {
    return { macd: [], signal: [], histogram: [] };
  }

  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  // Align fast EMA with slow EMA length
  const offset = slowPeriod - fastPeriod;
  const macdLine: number[] = [];
  for (let i = 0; i < slowEMA.length; i++) {
    macdLine.push(fastEMA[i + offset] - slowEMA[i]);
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);
  const signalOffset = macdLine.length - signalLine.length;
  const histogram: number[] = [];

  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[i + signalOffset] - signalLine[i]);
  }

  return {
    macd: macdLine.slice(signalOffset),
    signal: signalLine,
    histogram,
  };
}

/**
 * Calculates Bollinger Bands (20, 2)
 */
export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  multiplier: number = 2
): { upper: number[]; middle: number[]; lower: number[]; percentB: number[] } {
  if (closes.length < period) {
    return { upper: [], middle: [], lower: [], percentB: [] };
  }

  const sma = calculateSMA(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];
  const percentB: number[] = [];

  for (let i = 0; i < sma.length; i++) {
    const windowSlice = closes.slice(i, i + period);
    const mean = sma[i];
    const variance =
      windowSlice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
      period;
    const stdDev = Math.sqrt(variance);

    const up = mean + multiplier * stdDev;
    const low = mean - multiplier * stdDev;
    const currentPrice = windowSlice[windowSlice.length - 1];
    const pb = up === low ? 0.5 : (currentPrice - low) / (up - low);

    upper.push(up);
    lower.push(low);
    percentB.push(pb);
  }

  return { upper, middle: sma, lower, percentB };
}

/**
 * Calculates Average True Range (ATR)
 */
export function calculateATR(candles: Candle[], period: number = 14): number[] {
  if (candles.length <= period) return [];

  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trs.push(tr);
  }

  let atr = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const result: number[] = [atr];

  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
    result.push(atr);
  }

  return result;
}

/**
 * Identifies key Support and Resistance levels from pivot highs & lows over 6 months
 */
export function findSupportResistanceLevels(
  candles: Candle[],
  currentPrice: number
): { supportLevels: number[]; resistanceLevels: number[] } {
  if (candles.length < 10) {
    return {
      supportLevels: [currentPrice * 0.95, currentPrice * 0.9],
      resistanceLevels: [currentPrice * 1.05, currentPrice * 1.1],
    };
  }

  const pivotLows: number[] = [];
  const pivotHighs: number[] = [];

  // Window size for local swing points
  const window = 4;
  for (let i = window; i < candles.length - window; i++) {
    let isLow = true;
    let isHigh = true;

    for (let j = i - window; j <= i + window; j++) {
      if (j === i) continue;
      if (candles[j].low <= candles[i].low) isLow = false;
      if (candles[j].high >= candles[i].high) isHigh = false;
    }

    if (isLow) pivotLows.push(candles[i].low);
    if (isHigh) pivotHighs.push(candles[i].high);
  }

  // Cluster nearby levels within 1.5% of each other
  const clusterLevels = (levels: number[]) => {
    levels.sort((a, b) => a - b);
    const clusters: number[] = [];
    for (const lvl of levels) {
      const matchIndex = clusters.findIndex(
        (c) => Math.abs(c - lvl) / c < 0.02
      );
      if (matchIndex === -1) {
        clusters.push(lvl);
      } else {
        clusters[matchIndex] = (clusters[matchIndex] + lvl) / 2;
      }
    }
    return clusters;
  };

  const allSupports = clusterLevels(pivotLows).filter((lvl) => lvl < currentPrice);
  const allResistances = clusterLevels(pivotHighs).filter((lvl) => lvl > currentPrice);

  // Take closest 3 supports (highest below price) and closest 3 resistances (lowest above price)
  const supportLevels = allSupports.sort((a, b) => b - a).slice(0, 3);
  const resistanceLevels = allResistances.sort((a, b) => a - b).slice(0, 3);

  // Fallbacks if not enough pivot points
  if (supportLevels.length === 0) {
    supportLevels.push(currentPrice * 0.96, currentPrice * 0.92);
  }
  if (resistanceLevels.length === 0) {
    resistanceLevels.push(currentPrice * 1.05, currentPrice * 1.12);
  }

  return { supportLevels, resistanceLevels };
}

/**
 * Computes complete 6-month technical indicators
 */
export function calculate6MonthIndicators(candles: Candle[]): TechnicalIndicators {
  const closes = candles.map((c) => c.close);
  const currentPrice = closes[closes.length - 1] || 0;

  const rsiSeries = calculateRSI(closes, 14);
  const latestRSI = rsiSeries.length > 0 ? rsiSeries[rsiSeries.length - 1] : 50;

  const ema20Series = calculateEMA(closes, 20);
  const latestEMA20 = ema20Series.length > 0 ? ema20Series[ema20Series.length - 1] : currentPrice;

  const ema50Series = calculateEMA(closes, 50);
  const latestEMA50 = ema50Series.length > 0 ? ema50Series[ema50Series.length - 1] : currentPrice;

  const sma200Series = calculateSMA(closes, Math.min(180, closes.length));
  const latestSMA = sma200Series.length > 0 ? sma200Series[sma200Series.length - 1] : currentPrice;

  const macdData = calculateMACD(closes);
  const latestMacd = macdData.macd[macdData.macd.length - 1] || 0;
  const latestSignal = macdData.signal[macdData.signal.length - 1] || 0;
  const latestHist = macdData.histogram[macdData.histogram.length - 1] || 0;

  const bbData = calculateBollingerBands(closes, 20, 2);
  const latestBBUpper = bbData.upper[bbData.upper.length - 1] || currentPrice * 1.05;
  const latestBBMiddle = bbData.middle[bbData.middle.length - 1] || currentPrice;
  const latestBBLower = bbData.lower[bbData.lower.length - 1] || currentPrice * 0.95;
  const latestPercentB = bbData.percentB[bbData.percentB.length - 1] ?? 0.5;

  const atrSeries = calculateATR(candles, 14);
  const latestATR = atrSeries.length > 0 ? atrSeries[atrSeries.length - 1] : currentPrice * 0.03;

  const { supportLevels, resistanceLevels } = findSupportResistanceLevels(candles, currentPrice);

  const sixMonthHigh = Math.max(...candles.map((c) => c.high));
  const sixMonthLow = Math.min(...candles.map((c) => c.low));
  const firstClose = candles[0]?.close || currentPrice;
  const sixMonthChangePct = firstClose > 0 ? ((currentPrice - firstClose) / firstClose) * 100 : 0;

  let trend: TechnicalIndicators['trend'] = 'NEUTRAL';
  if (currentPrice > latestEMA20 && latestEMA20 > latestEMA50 && latestHist > 0) {
    trend = 'STRONG_BULLISH';
  } else if (currentPrice > latestEMA20) {
    trend = 'BULLISH';
  } else if (currentPrice < latestEMA20 && latestEMA20 < latestEMA50 && latestHist < 0) {
    trend = 'STRONG_BEARISH';
  } else if (currentPrice < latestEMA20) {
    trend = 'BEARISH';
  }

  const macdTrend =
    latestHist > 0 && latestMacd > latestSignal
      ? 'BULLISH'
      : latestHist < 0 && latestMacd < latestSignal
      ? 'BEARISH'
      : 'NEUTRAL';

  return {
    rsi14: Number(latestRSI.toFixed(2)),
    ema20: Number(latestEMA20.toFixed(4)),
    ema50: Number(latestEMA50.toFixed(4)),
    sma200: Number(latestSMA.toFixed(4)),
    macd: {
      macd: Number(latestMacd.toFixed(4)),
      signal: Number(latestSignal.toFixed(4)),
      histogram: Number(latestHist.toFixed(4)),
      trend: macdTrend,
    },
    bollinger: {
      upper: Number(latestBBUpper.toFixed(4)),
      middle: Number(latestBBMiddle.toFixed(4)),
      lower: Number(latestBBLower.toFixed(4)),
      percentB: Number(latestPercentB.toFixed(2)),
    },
    atr14: Number(latestATR.toFixed(4)),
    supportLevels,
    resistanceLevels,
    trend,
    sixMonthHigh: Number(sixMonthHigh.toFixed(4)),
    sixMonthLow: Number(sixMonthLow.toFixed(4)),
    sixMonthChangePct: Number(sixMonthChangePct.toFixed(2)),
  };
}

/**
 * Generates actionable Buy/Sell/Wait signal with exact Entry, Targets, Stop Loss and detailed reasoning
 */
export function generateCryptoSignal(
  candles: Candle[],
  currentPrice: number,
  indicators: TechnicalIndicators
): SignalRecommendation {
  let score = 50; // Neutral baseline (0 to 100)
  const reasons: string[] = [];
  const urduReasons: string[] = [];

  // Factor 1: RSI Evaluation
  if (indicators.rsi14 < 30) {
    score += 25;
    reasons.push(`RSI is deeply oversold at ${indicators.rsi14}, signaling strong bullish bounce potential.`);
    urduReasons.push(`RSI ${indicators.rsi14} pe oversold (boht sasta) hay, yahan sy market k wapis ooper uthnay k qawi imkanat han.`);
  } else if (indicators.rsi14 < 42) {
    score += 15;
    reasons.push(`RSI is in the healthy accumulation zone at ${indicators.rsi14}.`);
    urduReasons.push(`RSI ${indicators.rsi14} accumulation zone mn hay, yahan smart money buying karti hay.`);
  } else if (indicators.rsi14 > 75) {
    score -= 30;
    reasons.push(`RSI is extremely overbought at ${indicators.rsi14}. High risk of sharp pullback/correction.`);
    urduReasons.push(`RSI ${indicators.rsi14} boht ziyada overbought (mehanga) hay, yahan profit book kerna chie ya correction ka wait karein.`);
  } else if (indicators.rsi14 > 65) {
    score -= 10;
    reasons.push(`RSI approaching overbought levels (${indicators.rsi14}). Take caution.`);
    urduReasons.push(`RSI ${indicators.rsi14} overbought k qareeb pohanch chuka hay, nayi buying mein ahtiat bartain.`);
  }

  // Factor 2: EMA Trend (20 vs 50)
  if (currentPrice > indicators.ema20 && indicators.ema20 > indicators.ema50) {
    score += 20;
    reasons.push(`Price is trading above both 20 EMA and 50 EMA with strong golden alignment.`);
    urduReasons.push(`Price 20 EMA or 50 EMA dono k ooper chal rahi hay, jo k mazboot bullish trend ko show kerti hay.`);
  } else if (currentPrice < indicators.ema20 && indicators.ema20 < indicators.ema50) {
    score -= 20;
    reasons.push(`Price is trapped below both 20 EMA and 50 EMA (Death Cross alignment).`);
    urduReasons.push(`Price dono moving averages sy neechay hay (Bearish trend), es waqat buying risky hay.`);
  } else if (currentPrice > indicators.ema20) {
    score += 8;
    reasons.push(`Price reclaimed the 20 EMA short-term momentum line.`);
    urduReasons.push(`Price ne 20 EMA ko recover kar leya hay, short-term tezi ban rahi hay.`);
  }

  // Factor 3: MACD Momentum
  if (indicators.macd.histogram > 0 && indicators.macd.macd > indicators.macd.signal) {
    score += 15;
    reasons.push(`MACD histogram is positive and expanding, showing buyers are taking control.`);
    urduReasons.push(`MACD histogram positive hay or buyers market ko control kar rahe han.`);
  } else if (indicators.macd.histogram < 0 && indicators.macd.macd < indicators.macd.signal) {
    score -= 15;
    reasons.push(`MACD histogram is negative and dropping, showing continuous selling pressure.`);
    urduReasons.push(`MACD negative zone mn hay or selling pressure barh raha hay.`);
  }

  // Factor 4: Bollinger Bands Position
  if (indicators.bollinger.percentB < 0.15) {
    score += 12;
    reasons.push(`Price is touching the lower Bollinger Band, indicating volatility squeeze and mean reversion up.`);
    urduReasons.push(`Price Bollinger Band k neechay walay hissay pe hay, yahan sy mean-reversion bounce expected hay.`);
  } else if (indicators.bollinger.percentB > 0.85) {
    score -= 12;
    reasons.push(`Price is pressing against the upper Bollinger Band, extended from mean.`);
    urduReasons.push(`Price Bollinger Band k upper border pe pohanch chuki hay, exhaustion ho sakti hay.`);
  }

  // Factor 5: Support & Resistance Proximity
  const nearestSupport = indicators.supportLevels[0] || currentPrice * 0.95;
  const nearestResistance = indicators.resistanceLevels[0] || currentPrice * 1.05;
  const distToSupportPct = Math.abs((currentPrice - nearestSupport) / currentPrice) * 100;
  const distToResPct = Math.abs((nearestResistance - currentPrice) / currentPrice) * 100;

  if (distToSupportPct < 2.5) {
    score += 15;
    reasons.push(`Price is sitting right on major 6-month historical support ($${nearestSupport.toLocaleString()}). High risk/reward entry.`);
    urduReasons.push(`Price 6 month k ahem support level ($${nearestSupport.toLocaleString()}) k bilkul qareeb hay, yahan buying ka risk/reward zabardast hay.`);
  } else if (distToResPct < 2) {
    score -= 15;
    reasons.push(`Price is hitting major overhead resistance ($${nearestResistance.toLocaleString()}). Breakout confirmation needed.`);
    urduReasons.push(`Price resistance ($${nearestResistance.toLocaleString()}) se takra rahi hay, yahan direct buy kerna khtra ho sakta hay.`);
  }

  // Normalize score between 5 and 95
  const clampedScore = Math.max(5, Math.min(95, score));

  // Determine Action & Verdict
  let action: SignalAction = 'NEUTRAL_WAIT';
  let actionUrdu = 'Intezar Karein / No Trade';
  let verdict: SignalRecommendation['verdict'] = 'WAIT_NO_TRADE';
  let verdictUrdu = 'Es Waqt Wait Karein - Clear Entry Ka Intezar';

  if (clampedScore >= 75) {
    action = 'STRONG_BUY';
    actionUrdu = 'Zabardast Buying Ka Moqa (Strong Buy)';
    verdict = 'TRADE_NOW';
    verdictUrdu = 'Abhi Trade Karein (Long / Buy)';
  } else if (clampedScore >= 60) {
    action = 'BUY';
    actionUrdu = 'Buy On Dip (Buying Recommendation)';
    verdict = 'TRADE_NOW';
    verdictUrdu = 'Buying Karein (Dip Entries)';
  } else if (clampedScore <= 25) {
    action = 'STRONG_SELL';
    actionUrdu = 'Short / Sell Karein (Strong Sell)';
    verdict = 'EXIT_TRADE';
    verdictUrdu = 'Position Exit Karein Ya Short Karein';
  } else if (clampedScore <= 40) {
    action = 'SELL';
    actionUrdu = 'Profit Book Karein / Sell';
    verdict = 'EXIT_TRADE';
    verdictUrdu = 'Selling Ka Waqt Hay';
  }

  // Entry Zone
  const isBuy = clampedScore >= 55;
  const entryMin = isBuy
    ? Number((currentPrice * 0.985).toFixed(4))
    : Number((currentPrice * 1.01).toFixed(4));
  const entryMax = isBuy
    ? Number((currentPrice * 1.005).toFixed(4))
    : Number((currentPrice * 0.995).toFixed(4));
  const optimalEntry = currentPrice;

  // Stop Loss calculation (based on nearest support/resistance & ATR)
  const stopLossDistance = Math.max(indicators.atr14 * 1.5, currentPrice * 0.035);
  let stopLossPrice = isBuy
    ? Math.min(currentPrice - stopLossDistance, nearestSupport * 0.985)
    : Math.max(currentPrice + stopLossDistance, nearestResistance * 1.015);

  // Guard stop loss from negative or extreme
  if (isBuy && stopLossPrice <= 0) {
    stopLossPrice = currentPrice * 0.94;
  }
  const stopLossPct = Number(
    (Math.abs((currentPrice - stopLossPrice) / currentPrice) * 100).toFixed(2)
  );

  // Targets (T1: conservative, T2: swing pivot, T3: extended breakout)
  const targets: TargetLevel[] = [];
  if (isBuy) {
    const t1 = Number((currentPrice + stopLossDistance * 1.5).toFixed(4));
    const t2 = Number((Math.max(t1 * 1.02, nearestResistance)).toFixed(4));
    const t3 = Number((t2 * 1.08).toFixed(4));

    targets.push(
      {
        level: 'Target 1 (Safe)',
        price: t1,
        pct: Number((((t1 - currentPrice) / currentPrice) * 100).toFixed(2)),
        label: 'First Profit Booking',
        urduLabel: 'Pehla Munafa (Safe Target)',
      },
      {
        level: 'Target 2 (Main)',
        price: t2,
        pct: Number((((t2 - currentPrice) / currentPrice) * 100).toFixed(2)),
        label: 'Key Resistance Target',
        urduLabel: 'Doosra Munafa (Major Target)',
      },
      {
        level: 'Target 3 (Moon)',
        price: t3,
        pct: Number((((t3 - currentPrice) / currentPrice) * 100).toFixed(2)),
        label: 'Extended Bullish Wave',
        urduLabel: 'Teesra Munafa (Breakout Ride)',
      }
    );
  } else {
    // Sell / Short targets
    const t1 = Number((currentPrice - stopLossDistance * 1.5).toFixed(4));
    const t2 = Number((Math.min(t1 * 0.98, nearestSupport)).toFixed(4));
    const t3 = Number((t2 * 0.92).toFixed(4));

    targets.push(
      {
        level: 'Target 1 (Cover)',
        price: t1,
        pct: Number((((currentPrice - t1) / currentPrice) * 100).toFixed(2)),
        label: 'Initial Support Target',
        urduLabel: 'Pehla Short Target',
      },
      {
        level: 'Target 2 (Deep)',
        price: t2,
        pct: Number((((currentPrice - t2) / currentPrice) * 100).toFixed(2)),
        label: 'Major Floor Target',
        urduLabel: 'Doosra Target (Strong Support)',
      },
      {
        level: 'Target 3 (Crash)',
        price: t3,
        pct: Number((((currentPrice - t3) / currentPrice) * 100).toFixed(2)),
        label: 'Capitulation Target',
        urduLabel: 'Teesra Target (Panic Zone)',
      }
    );
  }

  // Risk to reward calculation based on Target 2
  const profitDistance = Math.abs(targets[1].price - currentPrice);
  const riskRewardRatio = Number(
    (stopLossDistance > 0 ? profitDistance / stopLossDistance : 2.5).toFixed(2)
  );

  return {
    action,
    actionUrdu,
    verdict,
    verdictUrdu,
    confidence: clampedScore,
    entryZone: {
      min: Math.min(entryMin, entryMax),
      max: Math.max(entryMin, entryMax),
      optimal: optimalEntry,
    },
    targets,
    stopLoss: {
      price: Number(stopLossPrice.toFixed(4)),
      pct: stopLossPct,
      reason: isBuy
        ? `Placed right below 6M support ($${stopLossPrice.toFixed(2)}) + 1.5x ATR buffer.`
        : `Placed above swing high resistance ($${stopLossPrice.toFixed(2)}) + ATR buffer.`,
      urduReason: isBuy
        ? `Support level $${stopLossPrice.toFixed(2)} k neechay set keya gya hay ta k bekar wick sy trade na kate.`
        : `Resistance $${stopLossPrice.toFixed(2)} k ooper set keya gya hay loss control karny k lye.`,
    },
    riskRewardRatio,
    timeframe: 'Swing Trade (1 - 3 Weeks)',
    reasons,
    urduReasons,
    generatedAt: Date.now(),
  };
}

/**
 * Calculates money management & risk allocation based on user capital and trade parameters
 * "user sy trade ki input ly k us py risk b define kr k btaye k ap itna risk khel sakty han"
 */
export function calculateRiskManagement(
  input: TradeRiskInput,
  signal: SignalRecommendation,
  currentPrice: number
): RiskCalculationResult {
  const balance = Math.max(10, input.accountBalance || 1000);
  const riskPct = Math.max(0.5, Math.min(50, input.riskTolerancePct || 2));
  const leverage = input.tradeType === 'FUTURES' ? Math.max(1, input.leverage || 1) : 1;

  // Max dollar amount user is willing to lose on this trade
  const maxRiskAmountUsd = (balance * riskPct) / 100;

  // Distance to stop loss in %
  const entry = input.customEntry || signal.entryZone.optimal || currentPrice;
  const sl = input.customStopLoss || signal.stopLoss.price;
  const slDistancePct = Math.abs((entry - sl) / entry);

  // Position sizing formula: Position Size = (Account Risk in $) / (Stop Loss % / Leverage)
  let recommendedPositionSizeUsd = 0;
  if (slDistancePct > 0) {
    recommendedPositionSizeUsd = maxRiskAmountUsd / slDistancePct;
  } else {
    recommendedPositionSizeUsd = balance * 0.1;
  }

  // Spot cap: cannot exceed total balance unless futures
  if (input.tradeType === 'SPOT') {
    recommendedPositionSizeUsd = Math.min(recommendedPositionSizeUsd, balance);
  } else {
    // Futures cap: cannot exceed balance * leverage
    recommendedPositionSizeUsd = Math.min(recommendedPositionSizeUsd, balance * leverage);
  }

  const recommendedPositionSizeCoins = entry > 0 ? recommendedPositionSizeUsd / entry : 0;

  // Potential Profit & Loss
  const t1Pct = Math.abs((signal.targets[0]?.price - entry) / entry);
  const t2Pct = Math.abs((signal.targets[1]?.price - entry) / entry);
  const t3Pct = Math.abs((signal.targets[2]?.price - entry) / entry);

  const potentialProfitT1Usd = recommendedPositionSizeUsd * t1Pct;
  const potentialProfitT2Usd = recommendedPositionSizeUsd * t2Pct;
  const potentialProfitT3Usd = recommendedPositionSizeUsd * t3Pct;
  const potentialLossUsd = recommendedPositionSizeUsd * slDistancePct;

  // Liquidation price for Futures
  let liquidationPrice: number | undefined = undefined;
  if (input.tradeType === 'FUTURES' && leverage > 1) {
    const mmr = 0.005; // 0.5% maintenance margin
    const isLong = signal.action === 'STRONG_BUY' || signal.action === 'BUY' || signal.action === 'NEUTRAL_WAIT';
    if (isLong) {
      liquidationPrice = entry * (1 - 1 / leverage + mmr);
    } else {
      liquidationPrice = entry * (1 + 1 / leverage - mmr);
    }
  }

  // Risk Rating Assessment
  let riskRating: RiskCalculationResult['riskRating'] = 'CONSERVATIVE';
  let adviceText = '';
  let urduAdviceText = '';

  if (riskPct <= 2 && leverage <= 3) {
    riskRating = 'CONSERVATIVE';
    adviceText = `Professional Standard Risk: Risking $${maxRiskAmountUsd.toFixed(2)} (${riskPct}%) protects your capital against consecutive drawdowns. Position size: $${recommendedPositionSizeUsd.toFixed(2)}.`;
    urduAdviceText = `Mehfooz (Safe) Risk: Ap $${balance.toLocaleString()} k portfolio pe sirf $${maxRiskAmountUsd.toFixed(2)} (${riskPct}%) ka risk le rahe han jo boht umdah hay. Apki trade size $${recommendedPositionSizeUsd.toFixed(2)} honi chie.`;
  } else if (riskPct <= 5 && leverage <= 5) {
    riskRating = 'MODERATE';
    adviceText = `Moderate Risk: Risking $${maxRiskAmountUsd.toFixed(2)} (${riskPct}%) is suitable for high-conviction swing trades. Ensure tight discipline at Stop Loss.`;
    urduAdviceText = `Darmiyana (Moderate) Risk: Ap $${maxRiskAmountUsd.toFixed(2)} (${riskPct}%) risk khel sakty han agar trade confirm ho. Agar Stop Loss hit ho tu fauran exit kerna ho ga.`;
  } else if (riskPct <= 10 || leverage <= 10) {
    riskRating = 'AGGRESSIVE';
    adviceText = `High Risk Warning: Allocating $${maxRiskAmountUsd.toFixed(2)} (${riskPct}%) or using ${leverage}x leverage can burn 30%+ of account in 3 bad trades. Lower your leverage or risk.`;
    urduAdviceText = `Khatarnak (High Risk): $${maxRiskAmountUsd.toFixed(2)} (${riskPct}%) risk ya ${leverage}x leverage bohat high hay. Chand ghalat trades apka account khali kar sakti han! Risk kam karein.`;
  } else {
    riskRating = 'HIGH_DANGER';
    adviceText = `Extreme Danger: Risking ${riskPct}% with ${leverage}x leverage is gambling. Liquidation is very close ($${liquidationPrice?.toFixed(2) || 'N/A'}). Reduce risk to 1-3%.`;
    urduAdviceText = `Intehai Khatra (Extreme Risk): ${riskPct}% risk or ${leverage}x leverage jua (gambling) hay. Apka sara paisa doob sakta hay. Baraye meherbani risk ko 1% ya 2% pe rakhain.`;
  }

  return {
    maxRiskAmountUsd: Number(maxRiskAmountUsd.toFixed(2)),
    recommendedPositionSizeUsd: Number(recommendedPositionSizeUsd.toFixed(2)),
    recommendedPositionSizeCoins: Number(recommendedPositionSizeCoins.toFixed(6)),
    potentialProfitT1Usd: Number(potentialProfitT1Usd.toFixed(2)),
    potentialProfitT2Usd: Number(potentialProfitT2Usd.toFixed(2)),
    potentialProfitT3Usd: Number(potentialProfitT3Usd.toFixed(2)),
    potentialLossUsd: Number(potentialLossUsd.toFixed(2)),
    effectiveLeverage: leverage,
    liquidationPrice: liquidationPrice ? Number(liquidationPrice.toFixed(4)) : undefined,
    riskRating,
    adviceText,
    urduAdviceText,
  };
}
