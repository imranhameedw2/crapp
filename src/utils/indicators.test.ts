import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateBollingerBands,
  calculate6MonthIndicators,
  generateCryptoSignal,
  calculateRiskManagement,
} from './indicators.ts';
import type { Candle, TradeRiskInput } from '../types/crypto.ts';

// Helper to generate mock candles
function generateMockCandles(count: number, startPrice: number, trendMultiplier = 1.002): Candle[] {
  const candles: Candle[] = [];
  let price = startPrice;
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const time = now - (count - i) * oneDay;
    const dateStr = new Date(time).toISOString().split('T')[0];
    const open = price;
    const change = (Math.sin(i / 5) * 0.02 + (trendMultiplier - 1)) * price;
    const close = Math.max(1, open + change);
    const high = Math.max(open, close) * 1.015;
    const low = Math.min(open, close) * 0.985;
    const volume = 1000000 + (i % 7) * 50000;

    candles.push({ time, dateStr, open, high, low, close, volume });
    price = close;
  }
  return candles;
}

test('calculateSMA computes correct simple moving averages', () => {
  const values = [10, 20, 30, 40, 50];
  const sma3 = calculateSMA(values, 3);
  // [ (10+20+30)/3=20, (20+30+40)/3=30, (30+40+50)/3=40 ]
  assert.equal(sma3.length, 3);
  assert.equal(sma3[0], 20);
  assert.equal(sma3[1], 30);
  assert.equal(sma3[2], 40);
});

test('calculateEMA gives more weight to recent prices', () => {
  const values = [10, 10, 10, 10, 50];
  const ema3 = calculateEMA(values, 3);
  assert.ok(ema3.length > 0);
  // Last value should reflect sudden jump
  const lastVal = ema3[ema3.length - 1];
  assert.ok(lastVal > 15);
});

test('calculateRSI returns values bounded between 0 and 100', () => {
  const mockCandles = generateMockCandles(60, 100, 1.01);
  const closes = mockCandles.map((c) => c.close);
  const rsi = calculateRSI(closes, 14);

  assert.ok(rsi.length > 0);
  const latestRSI = rsi[rsi.length - 1];
  assert.ok(latestRSI >= 0 && latestRSI <= 100);
});

test('calculateBollingerBands returns upper band > middle > lower band', () => {
  const mockCandles = generateMockCandles(50, 100);
  const closes = mockCandles.map((c) => c.close);
  const bb = calculateBollingerBands(closes, 20, 2);

  assert.ok(bb.upper.length > 0);
  const idx = bb.upper.length - 1;
  assert.ok(bb.upper[idx] >= bb.middle[idx]);
  assert.ok(bb.middle[idx] >= bb.lower[idx]);
});

test('calculate6MonthIndicators produces complete indicators for 180 candles', () => {
  const candles = generateMockCandles(180, 50000);
  const indicators = calculate6MonthIndicators(candles);

  assert.ok(indicators.rsi14 >= 0 && indicators.rsi14 <= 100);
  assert.ok(indicators.ema20 > 0);
  assert.ok(indicators.ema50 > 0);
  assert.ok(indicators.supportLevels.length > 0);
  assert.ok(indicators.resistanceLevels.length > 0);
  assert.ok(indicators.sixMonthHigh >= indicators.sixMonthLow);
});

test('generateCryptoSignal returns actionable targets and stop loss', () => {
  const candles = generateMockCandles(180, 60000);
  const currentPrice = candles[candles.length - 1].close;
  const indicators = calculate6MonthIndicators(candles);
  const signal = generateCryptoSignal(candles, currentPrice, indicators);

  assert.ok(['STRONG_BUY', 'BUY', 'NEUTRAL_WAIT', 'SELL', 'STRONG_SELL'].includes(signal.action));
  assert.ok(signal.targets.length === 3);
  assert.ok(signal.stopLoss.price > 0);
  assert.ok(signal.confidence >= 5 && signal.confidence <= 95);
  assert.ok(signal.reasons.length > 0);
  assert.ok(signal.urduReasons.length > 0);
});

test('calculateRiskManagement enforces maximum dollar risk and calculates position size', () => {
  const candles = generateMockCandles(180, 50000);
  const currentPrice = 50000;
  const indicators = calculate6MonthIndicators(candles);
  const signal = generateCryptoSignal(candles, currentPrice, indicators);

  const input: TradeRiskInput = {
    accountBalance: 1000,
    riskTolerancePct: 2, // 2% of $1000 = $20 risk
    tradeType: 'SPOT',
    leverage: 1,
  };

  const riskResult = calculateRiskManagement(input, signal, currentPrice);

  assert.equal(riskResult.maxRiskAmountUsd, 20);
  assert.ok(riskResult.recommendedPositionSizeUsd > 0);
  assert.ok(riskResult.recommendedPositionSizeUsd <= 1000, 'Spot size cannot exceed total account balance');
  assert.ok(riskResult.potentialLossUsd <= 20.05, 'Loss at SL should match max risk allowance');
  assert.ok(riskResult.potentialProfitT2Usd > 0);
  assert.ok(riskResult.adviceText.length > 0);
  assert.ok(riskResult.urduAdviceText.length > 0);
});
