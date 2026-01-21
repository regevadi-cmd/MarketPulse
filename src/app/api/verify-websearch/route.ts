import { NextRequest, NextResponse } from 'next/server';

interface VerifyRequest {
  provider: 'tavily' | 'websearchapi';
  apiKey: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest = await request.json();
    const { provider, apiKey } = body;

    if (!apiKey?.trim()) {
      return NextResponse.json({ valid: false, error: 'API key is required' });
    }

    if (provider === 'tavily') {
      // Test Tavily API with a simple search
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey.trim(),
          query: 'test',
          max_results: 1,
        }),
      });

      if (response.ok) {
        return NextResponse.json({ valid: true });
      }

      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ valid: false, error: 'Invalid API key' });
      }

      if (response.status === 429) {
        return NextResponse.json({ valid: false, error: 'Rate limit exceeded' });
      }

      return NextResponse.json({
        valid: false,
        error: errorData.message || `Error: ${response.status}`
      });
    }

    if (provider === 'websearchapi') {
      // Test WebSearchAPI with a simple search
      const response = await fetch(
        `https://api.websearchapi.com/v1/search?q=test&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey.trim()}`,
          },
        }
      );

      if (response.ok) {
        return NextResponse.json({ valid: true });
      }

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ valid: false, error: 'Invalid API key' });
      }

      if (response.status === 429) {
        return NextResponse.json({ valid: false, error: 'Rate limit exceeded' });
      }

      return NextResponse.json({
        valid: false,
        error: `Error: ${response.status}`
      });
    }

    return NextResponse.json({ valid: false, error: 'Invalid provider' });
  } catch (error) {
    console.error('Web search verification error:', error);
    return NextResponse.json({
      valid: false,
      error: 'Connection failed - please check your network'
    });
  }
}
