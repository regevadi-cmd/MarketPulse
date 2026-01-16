import { NextRequest, NextResponse } from 'next/server';
import { createAIProvider } from '@/lib/ai/factory';
import { AnalyzeRequest, AnalyzeResponse, ApiError } from '@/types/api';
import { ProviderName, PROVIDER_INFO } from '@/types/analysis';
import { searchCompanyNews, searchCompanyCaseStudies, searchCompanyInfo, searchInvestorDocuments } from '@/lib/services/webSearch';
import { tavilySearchCompanyNews, tavilySearchCaseStudies, tavilySearchCompanyInfo, tavilySearchInvestorDocs } from '@/lib/services/tavilySearch';

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { companyName, provider, model, apiKey, webSearchApiKey, tavilyApiKey } = body;

    // Validate input
    if (!companyName?.trim()) {
      return NextResponse.json<ApiError>(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    if (!provider || !['openai', 'anthropic', 'gemini', 'perplexity'].includes(provider)) {
      return NextResponse.json<ApiError>(
        { error: 'Valid provider is required (openai, anthropic, gemini, or perplexity)' },
        { status: 400 }
      );
    }

    if (!apiKey?.trim()) {
      return NextResponse.json<ApiError>(
        { error: 'API key is required' },
        { status: 401 }
      );
    }

    const providerInfo = PROVIDER_INFO[provider as ProviderName];
    const useTavily = !providerInfo.supportsWebGrounding && !!tavilyApiKey;
    const useWebSearchApi = !providerInfo.supportsWebGrounding && !tavilyApiKey && !!webSearchApiKey;
    const shouldUseWebSearch = useTavily || useWebSearchApi;
    let webSearchData = null;
    let webSearchError: string | null = null;
    const webSearchProvider = useTavily ? 'Tavily' : 'WebSearchAPI';

    // If provider doesn't have native web grounding and we have a web search API key,
    // fetch real-time web data to augment the analysis
    if (shouldUseWebSearch) {
      try {
        if (useTavily) {
          // Use Tavily for web search
          const [newsResults, caseStudyResults, infoResults, investorDocsResults] = await Promise.all([
            tavilySearchCompanyNews(companyName.trim(), tavilyApiKey!),
            tavilySearchCaseStudies(companyName.trim(), tavilyApiKey!),
            tavilySearchCompanyInfo(companyName.trim(), tavilyApiKey!),
            tavilySearchInvestorDocs(companyName.trim(), tavilyApiKey!)
          ]);

          webSearchData = {
            news: newsResults.map(r => ({ title: r.title, url: r.url, description: r.content })),
            caseStudies: caseStudyResults.map(r => ({ title: r.title, url: r.url, description: r.content })),
            info: { sources: infoResults.sources.map(r => ({ title: r.title, url: r.url, description: r.content })) },
            investorDocs: investorDocsResults.map(r => ({ title: r.title, url: r.url, description: r.content }))
          };
        } else {
          // Use WebSearchAPI for web search
          const [newsResults, caseStudyResults, infoResults, investorDocsResults] = await Promise.all([
            searchCompanyNews(companyName.trim(), webSearchApiKey!),
            searchCompanyCaseStudies(companyName.trim(), webSearchApiKey!),
            searchCompanyInfo(companyName.trim(), webSearchApiKey!),
            searchInvestorDocuments(companyName.trim(), webSearchApiKey!)
          ]);

          webSearchData = {
            news: newsResults,
            caseStudies: caseStudyResults,
            info: infoResults,
            investorDocs: investorDocsResults
          };
        }
      } catch (err) {
        // Log but don't fail - web search is an enhancement
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.warn(`${webSearchProvider} error (non-fatal):`, errorMessage);

        // Parse the error to give a user-friendly message
        if (errorMessage.includes('Forbidden') || errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('Invalid API Key')) {
          webSearchError = `${webSearchProvider} key is invalid or expired`;
        } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
          webSearchError = `${webSearchProvider} rate limit exceeded`;
        } else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
          webSearchError = `${webSearchProvider} request timed out`;
        } else {
          webSearchError = `${webSearchProvider} failed: ` + errorMessage.substring(0, 100);
        }
      }
    }

    // Create provider and execute analysis with optional model override
    const aiProvider = createAIProvider(provider as ProviderName, apiKey, { model });
    const analysis = await aiProvider.analyzeCompany(companyName.trim());

    // If we have web search data, merge it with the analysis results
    if (webSearchData) {
      // Replace placeholder news with real web search results
      if (webSearchData.news.length > 0) {
        analysis.techNews = webSearchData.news.map(item => ({
          title: item.title,
          url: item.url,
          summary: item.description
        }));
      }

      // Replace placeholder case studies with real web search results
      if (webSearchData.caseStudies.length > 0) {
        analysis.caseStudies = webSearchData.caseStudies.map(item => ({
          title: item.title,
          url: item.url,
          summary: item.description
        }));
      }

      // Replace placeholder investor docs with real web search results
      if (webSearchData.investorDocs.length > 0) {
        analysis.investorDocs = webSearchData.investorDocs.map(item => ({
          title: item.title,
          url: item.url,
          summary: item.description
        }));
      }

      // Add web search sources to sources list
      const webSources = [
        ...webSearchData.news.map(n => n.url),
        ...webSearchData.caseStudies.map(c => c.url),
        ...webSearchData.investorDocs.map(d => d.url),
        ...webSearchData.info.sources.map(s => s.url)
      ].filter(Boolean);

      if (webSources.length > 0) {
        analysis.sources = [...new Set([...analysis.sources, ...webSources])];
      }
    }

    // Log web search status for debugging
    if (shouldUseWebSearch) {
      console.log(`${webSearchProvider} status:`, webSearchData ? 'SUCCESS' : `FAILED: ${webSearchError}`);
    }

    return NextResponse.json<AnalyzeResponse>({
      data: analysis,
      cached: false,
      provider: provider as ProviderName,
      webSearchUsed: shouldUseWebSearch && webSearchData !== null,
      webSearchError: webSearchError || undefined
    });
  } catch (error) {
    console.error('Analysis error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Analysis failed';

    // Check for common API key errors
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized') || errorMessage.includes('invalid_api_key')) {
      return NextResponse.json<ApiError>(
        { error: 'Invalid API key. Please check your credentials.' },
        { status: 401 }
      );
    }

    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      return NextResponse.json<ApiError>(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json<ApiError>(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
