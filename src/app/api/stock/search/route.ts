import { NextRequest, NextResponse } from 'next/server';

export interface TickerSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    // Use Yahoo Finance search API
    const response = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=6&newsCount=0&enableFuzzyQuery=true&quotesQueryId=tss_match_phrase_query`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Yahoo Finance search failed');
    }

    const data = await response.json();

    // Filter for stocks/equities only and map to our format
    const results: TickerSearchResult[] = (data.quotes || [])
      .filter((quote: Record<string, unknown>) =>
        quote.quoteType === 'EQUITY' || quote.quoteType === 'ETF'
      )
      .map((quote: Record<string, unknown>) => ({
        symbol: quote.symbol as string,
        name: (quote.shortname || quote.longname || quote.symbol) as string,
        exchange: quote.exchange as string,
        type: quote.quoteType as string
      }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Ticker search error:', error);
    return NextResponse.json(
      { error: 'Failed to search for tickers', results: [] },
      { status: 500 }
    );
  }
}
