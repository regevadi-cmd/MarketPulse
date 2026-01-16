import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/types/api';

const YAHOO_FINANCE_API = 'https://query1.finance.yahoo.com/v8/finance/chart';

export interface StockDataWithHistory {
  ticker: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  marketState: string;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap?: number;
  volume: number;
  avgVolume: number;
  history: {
    timestamps: number[];
    prices: number[];
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;

  if (!ticker) {
    return NextResponse.json<ApiError>(
      { error: 'Ticker is required' },
      { status: 400 }
    );
  }

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    // Fetch both 1-day (for accurate daily change) and 1-year (for history) in parallel
    const [dailyResponse, yearlyResponse] = await Promise.all([
      fetch(
        `${YAHOO_FINANCE_API}/${encodeURIComponent(ticker)}?interval=1d&range=1d`,
        { headers, next: { revalidate: 300 } }
      ),
      fetch(
        `${YAHOO_FINANCE_API}/${encodeURIComponent(ticker)}?interval=1d&range=1y`,
        { headers, next: { revalidate: 300 } }
      )
    ]);

    if (!dailyResponse.ok || !yearlyResponse.ok) {
      throw new Error('Failed to fetch stock data');
    }

    const [dailyData, yearlyData] = await Promise.all([
      dailyResponse.json(),
      yearlyResponse.json()
    ]);

    const dailyQuote = dailyData.chart?.result?.[0];
    const yearlyQuote = yearlyData.chart?.result?.[0];

    if (!dailyQuote) {
      return NextResponse.json<ApiError>(
        { error: 'Ticker not found' },
        { status: 404 }
      );
    }

    const meta = dailyQuote.meta;

    // Get history from yearly data
    const yearlyIndicators = yearlyQuote?.indicators?.quote?.[0];
    const timestamps = yearlyQuote?.timestamp || [];
    const closePrices = yearlyIndicators?.close || [];

    // Filter out null values and align timestamps with prices
    const validHistory: { timestamps: number[]; prices: number[] } = {
      timestamps: [],
      prices: []
    };

    for (let i = 0; i < timestamps.length; i++) {
      if (closePrices[i] !== null && closePrices[i] !== undefined) {
        validHistory.timestamps.push(timestamps[i] * 1000); // Convert to milliseconds
        validHistory.prices.push(closePrices[i]);
      }
    }

    // Use chartPreviousClose from daily data for accurate daily change
    const previousClose = meta.chartPreviousClose || meta.previousClose || 0;
    const currentPrice = meta.regularMarketPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    const stockData: StockDataWithHistory = {
      ticker: meta.symbol,
      price: currentPrice,
      previousClose: previousClose,
      change: change,
      changePercent: changePercent,
      currency: meta.currency,
      marketState: meta.marketState,
      dayHigh: meta.regularMarketDayHigh || 0,
      dayLow: meta.regularMarketDayLow || 0,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0,
      volume: meta.regularMarketVolume || 0,
      avgVolume: meta.averageDailyVolume10Day || 0,
      history: validHistory
    };

    return NextResponse.json(stockData);
  } catch (error) {
    console.error('Stock API error:', error);
    return NextResponse.json<ApiError>(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
