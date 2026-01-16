'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { StockData } from '@/types/api';

interface StockTickerProps {
  ticker: string;
}

export function StockTicker({ ticker }: StockTickerProps) {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/stock/${encodeURIComponent(ticker)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }
        const stockData = await response.json();
        setData(stockData);
        setError(null);
      } catch (err) {
        setError('Unable to load stock data');
        console.error('Stock fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();

    // Refresh every minute
    const interval = setInterval(fetchStock, 60000);
    return () => clearInterval(interval);
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 rounded-lg border border-zinc-800 animate-pulse">
        <div className="h-4 w-16 bg-zinc-700 rounded" />
        <div className="h-4 w-20 bg-zinc-700 rounded" />
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const isPositive = data.change >= 0;

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
      <span className="text-zinc-400 text-sm font-medium">{data.ticker}</span>
      <span className="text-white font-semibold">
        {data.currency === 'USD' ? '$' : ''}
        {data.price.toFixed(2)}
      </span>
      <span
        className={`flex items-center gap-1 text-sm font-medium ${
          isPositive ? 'text-emerald-400' : 'text-red-400'
        }`}
      >
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        {isPositive ? '+' : ''}
        {data.changePercent.toFixed(2)}%
      </span>
      <span
        className={`text-xs px-1.5 py-0.5 rounded ${
          data.marketState === 'REGULAR'
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-zinc-700 text-zinc-400'
        }`}
      >
        {data.marketState === 'REGULAR' ? 'Open' : 'Closed'}
      </span>
    </div>
  );
}
