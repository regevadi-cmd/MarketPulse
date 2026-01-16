'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Search, ChevronRight, Lock } from 'lucide-react';
import { CompanyInfo } from '@/components/layout/Header';
import { SectionCard } from '../analysis/SectionCard';
import { Skeleton } from '@/components/ui/skeleton';

interface StockData {
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
  volume: number;
  avgVolume: number;
  history: {
    timestamps: number[];
    prices: number[];
  };
}

interface TickerOption {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

interface StockCardProps {
  ticker?: string;
  companyName?: string;
  companyInfo?: CompanyInfo | null;
}

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

function formatCurrency(num: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

// Simple SVG line chart component
function MiniChart({
  data,
  isPositive
}: {
  data: number[];
  isPositive: boolean;
}) {
  if (!data || data.length < 2) {
    return (
      <div className="w-full h-[120px] flex items-center justify-center text-zinc-500 text-sm">
        Insufficient data for chart
      </div>
    );
  }

  // Use fixed dimensions for consistent rendering
  const width = 500;
  const height = 120;
  const padding = { top: 15, right: 15, bottom: 15, left: 15 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minPrice = Math.min(...data);
  const maxPrice = Math.max(...data);
  const priceRange = maxPrice - minPrice || 1;

  const points = data.map((price, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    return { x, y };
  });

  const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  // Create gradient fill path
  const fillPathD = `M ${padding.left},${padding.top + chartHeight} L ${points.map(p => `${p.x},${p.y}`).join(' L ')} L ${padding.left + chartWidth},${padding.top + chartHeight} Z`;

  const color = isPositive ? '#10b981' : '#ef4444';
  const gradientId = `chart-gradient-${isPositive ? 'green' : 'red'}`;

  return (
    <div className="w-full">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* Gradient fill area */}
        <path d={fillPathD} fill={`url(#${gradientId})`} />
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Start point */}
        <circle
          cx={points[0].x}
          cy={points[0].y}
          r="4"
          fill={color}
        />
        {/* End point */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="5"
          fill={color}
          stroke="white"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

export function StockCard({ ticker: initialTicker, companyName, companyInfo }: StockCardProps) {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualTicker, setManualTicker] = useState('');
  const [activeTicker, setActiveTicker] = useState(initialTicker || '');
  const [tickerOptions, setTickerOptions] = useState<TickerOption[]>([]);
  const [showOptions, setShowOptions] = useState(false);

  // Check if company is known to be private
  const isPrivate = companyInfo && (
    companyInfo.publicStatus === 'private' ||
    companyInfo.publicStatus === 'went_private' ||
    companyInfo.publicStatus === 'pre_ipo'
  );

  const getPrivateStatusMessage = () => {
    if (!companyInfo?.publicStatus) return null;
    switch (companyInfo.publicStatus) {
      case 'private':
        return { title: 'Private Company', subtitle: 'This company is not publicly traded.' };
      case 'went_private':
        return { title: 'Formerly Public', subtitle: 'This company was taken private and is no longer publicly traded.' };
      case 'pre_ipo':
        return { title: 'Pre-IPO Company', subtitle: 'This company is private but may be planning an IPO.' };
      default:
        return null;
    }
  };

  const searchTickers = async (query: string) => {
    if (!query) return;

    try {
      setSearching(true);
      const response = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      const { results } = await response.json();

      if (results.length === 1) {
        // Only one result - auto-select it
        fetchData(results[0].symbol);
      } else if (results.length > 1) {
        // Multiple results - show options
        setTickerOptions(results);
        setShowOptions(true);
      } else {
        setError('No stock tickers found for this company');
      }
    } catch (err) {
      console.error('Ticker search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const fetchData = async (tickerToFetch: string) => {
    if (!tickerToFetch) return;

    try {
      setLoading(true);
      setError(null);
      setShowOptions(false);
      const response = await fetch(`/api/stock/${encodeURIComponent(tickerToFetch)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }
      const stockData = await response.json();
      setData(stockData);
      setActiveTicker(tickerToFetch);
    } catch (err) {
      setError('Unable to load stock data');
      console.error('Stock fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Don't search for tickers if company is known to be private
    if (isPrivate) {
      return;
    }

    if (initialTicker) {
      // If we have an initial ticker, use it directly
      setActiveTicker(initialTicker);
      fetchData(initialTicker);
      const interval = setInterval(() => fetchData(initialTicker), 300000);
      return () => clearInterval(interval);
    } else if (companyName) {
      // No ticker provided - search for it automatically
      searchTickers(companyName);
    }
  }, [initialTicker, companyName, isPrivate]);

  const handleManualSearch = () => {
    if (manualTicker.trim()) {
      // If it looks like a ticker (all caps, short), fetch directly
      // Otherwise, search for it
      const query = manualTicker.trim();
      if (query.length <= 5 && query === query.toUpperCase()) {
        fetchData(query);
      } else {
        searchTickers(query);
      }
    }
  };

  const handleSelectTicker = (ticker: string) => {
    setShowOptions(false);
    fetchData(ticker);
  };

  // Show private company message
  if (isPrivate) {
    const privateStatus = getPrivateStatusMessage();
    return (
      <SectionCard title="Stock Quote" icon={TrendingUp} color="emerald" className="xl:col-span-2">
        <div className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{privateStatus?.title || 'Private Company'}</h3>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto">
            {privateStatus?.subtitle || 'Stock data is not available for private companies.'}
          </p>
          {companyInfo?.publicStatus === 'went_private' && (
            <p className="text-zinc-500 text-xs mt-3">
              Historical SEC filings may still be available in the Investor Documents section.
            </p>
          )}
          {companyInfo?.publicStatus === 'pre_ipo' && (
            <p className="text-amber-400/70 text-xs mt-3">
              Watch for S-1 filings if the company proceeds with an IPO.
            </p>
          )}
        </div>
      </SectionCard>
    );
  }

  // Show loading skeleton
  if ((loading || searching) && !data && !showOptions) {
    return (
      <SectionCard title="Stock Quote" icon={TrendingUp} color="emerald" className="xl:col-span-2">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Search className="w-4 h-4 animate-pulse" />
            {searching ? `Searching for ${companyName || 'ticker'}...` : 'Loading stock data...'}
          </div>
          <Skeleton className="h-12 w-32 bg-zinc-800" />
          <Skeleton className="h-[120px] w-full bg-zinc-800" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-8 bg-zinc-800" />
            <Skeleton className="h-8 bg-zinc-800" />
          </div>
        </div>
      </SectionCard>
    );
  }

  // Show ticker options when multiple matches found
  if (showOptions && tickerOptions.length > 0) {
    return (
      <SectionCard title="Stock Quote" icon={TrendingUp} color="emerald" className="xl:col-span-2">
        <div className="py-2">
          <div className="text-zinc-400 text-sm mb-4">
            Multiple tickers found for <span className="text-white font-medium">{companyName}</span>. Select one:
          </div>
          <div className="space-y-2">
            {tickerOptions.map((option) => (
              <button
                key={option.symbol}
                onClick={() => handleSelectTicker(option.symbol)}
                className="w-full flex items-center justify-between p-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-emerald-500/50 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold text-lg">{option.symbol}</span>
                  <div className="text-left">
                    <div className="text-zinc-200 text-sm">{option.name}</div>
                    <div className="text-zinc-500 text-xs">{option.exchange} · {option.type}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <div className="text-zinc-500 text-xs mb-2">Or enter a different ticker:</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualTicker}
                onChange={(e) => setManualTicker(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                placeholder="e.g. AAPL"
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleManualSearch}
                disabled={loading || !manualTicker.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm rounded-lg transition-colors"
              >
                Load
              </button>
            </div>
          </div>
        </div>
      </SectionCard>
    );
  }

  // Show ticker input when no ticker available or error
  if (!data) {
    return (
      <SectionCard title="Stock Quote" icon={TrendingUp} color="emerald" className="xl:col-span-2">
        <div className="py-4">
          {error && (
            <div className="text-red-400 text-sm mb-4 text-center">{error}</div>
          )}
          <div className="text-zinc-400 text-sm mb-3 text-center">
            {companyName ? `Enter stock ticker for ${companyName}` : 'Enter a stock ticker symbol'}
          </div>
          <div className="flex gap-2 max-w-xs mx-auto">
            <input
              type="text"
              value={manualTicker}
              onChange={(e) => setManualTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
              placeholder="e.g. AAPL, MSFT"
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleManualSearch}
              disabled={loading || !manualTicker.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm rounded-lg transition-colors"
            >
              {loading ? 'Loading...' : 'Load'}
            </button>
          </div>
          <div className="text-zinc-600 text-xs mt-3 text-center">
            Common tickers: AAPL, MSFT, GOOGL, AMZN, META, TSLA, NVDA
          </div>
        </div>
      </SectionCard>
    );
  }

  const isTodayPositive = data.change >= 0;
  const yearStartPrice = data.history.prices.length > 0 ? data.history.prices[0] : data.price;
  const yearChange = ((data.price - yearStartPrice) / yearStartPrice) * 100;
  const isYearPositive = yearChange >= 0;

  return (
    <SectionCard title="Stock Quote" icon={TrendingUp} color="emerald" className="xl:col-span-2">
      <div className="space-y-4">
        {/* Header: Ticker, Price, Market State */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">{data.ticker}</span>
            <span
              className={`text-xs px-2 py-1 rounded ${
                data.marketState === 'REGULAR'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-zinc-700 text-zinc-400'
              }`}
            >
              {data.marketState === 'REGULAR' ? 'Market Open' : 'Market Closed'}
            </span>
          </div>
          <button
            onClick={() => fetchData(activeTicker)}
            className="text-zinc-500 hover:text-zinc-300 p-2 rounded hover:bg-zinc-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Current Price */}
        <div className="text-4xl font-bold text-white">
          {formatCurrency(data.price, data.currency)}
        </div>

        {/* Two Column Layout: Today vs 1 Year */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Today's Performance */}
          <div className={`rounded-lg p-4 ${isTodayPositive ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            <div className="text-xs text-zinc-400 uppercase tracking-wide mb-2">Today</div>
            <div className="flex items-center gap-2">
              {isTodayPositive ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className={`text-xl font-bold ${isTodayPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isTodayPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className={`text-sm mt-1 ${isTodayPositive ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
              {isTodayPositive ? '+' : ''}{formatCurrency(data.change, data.currency)}
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              Prev Close: {formatCurrency(data.previousClose, data.currency)}
            </div>
          </div>

          {/* 1 Year Performance */}
          <div className={`rounded-lg p-4 ${isYearPositive ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
            <div className="text-xs text-zinc-400 uppercase tracking-wide mb-2">1 Year</div>
            <div className="flex items-center gap-2">
              {isYearPositive ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className={`text-xl font-bold ${isYearPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isYearPositive ? '+' : ''}{yearChange.toFixed(2)}%
              </span>
            </div>
            <div className={`text-sm mt-1 ${isYearPositive ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
              {isYearPositive ? '+' : ''}{formatCurrency(data.price - yearStartPrice, data.currency)}
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              Year Start: {formatCurrency(yearStartPrice, data.currency)}
            </div>
          </div>
        </div>

        {/* 1 Year Chart */}
        <div className="bg-zinc-900/50 rounded-lg p-4">
          <div className="text-xs text-zinc-400 uppercase tracking-wide mb-3">Price History (1Y)</div>
          {data.history.prices.length >= 2 ? (
            <MiniChart data={data.history.prices} isPositive={isYearPositive} />
          ) : (
            <div className="h-[120px] flex items-center justify-center text-zinc-500 text-sm">
              Insufficient historical data available
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-zinc-900/30 rounded-lg p-3">
            <div className="text-zinc-500 text-xs">Day Range</div>
            <div className="text-zinc-200 font-medium mt-1">
              {formatCurrency(data.dayLow, data.currency)} - {formatCurrency(data.dayHigh, data.currency)}
            </div>
          </div>
          <div className="bg-zinc-900/30 rounded-lg p-3">
            <div className="text-zinc-500 text-xs">52 Week Range</div>
            <div className="text-zinc-200 font-medium mt-1">
              {formatCurrency(data.fiftyTwoWeekLow, data.currency)} - {formatCurrency(data.fiftyTwoWeekHigh, data.currency)}
            </div>
          </div>
          <div className="bg-zinc-900/30 rounded-lg p-3">
            <div className="text-zinc-500 text-xs">Volume</div>
            <div className="text-zinc-200 font-medium mt-1">{formatNumber(data.volume)}</div>
          </div>
          <div className="bg-zinc-900/30 rounded-lg p-3">
            <div className="text-zinc-500 text-xs">Avg Volume</div>
            <div className="text-zinc-200 font-medium mt-1">{formatNumber(data.avgVolume)}</div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
