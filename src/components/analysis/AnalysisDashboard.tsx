'use client';

import { AnalysisResult, ProviderName } from '@/types/analysis';
import { CompanyInfo } from '@/components/layout/Header';
import { SentimentBadge } from './sections/SentimentBadge';
import { ExecutiveSummary } from './sections/ExecutiveSummary';
import { QuickFacts } from './sections/QuickFacts';
import { KeyPriorities } from './sections/KeyPriorities';
import { GrowthInitiatives } from './sections/GrowthInitiatives';
import { InvestorDocuments } from './sections/InvestorDocuments';
import { TechNews } from './sections/TechNews';
import { CaseStudies } from './sections/CaseStudies';
import { CompetitiveLandscape } from './sections/CompetitiveLandscape';
import { MAActivity } from './sections/MAActivity';
import { GroundingSources } from './sections/GroundingSources';
import { StockCard } from '../stock/StockCard';
import { Bookmark, BookmarkCheck, Globe, AlertTriangle, Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalysisDashboardProps {
  companyName: string;
  companyInfo?: CompanyInfo | null;
  data: AnalysisResult;
  ticker?: string;
  provider: ProviderName;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  webSearchUsed?: boolean;
  webSearchError?: string | null;
  // Cached data props
  cachedDataTimestamp?: number | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

// Helper function to format relative time
function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// Check if data is stale (older than 24 hours)
function isDataStale(timestamp: number): boolean {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  return Date.now() - timestamp > ONE_DAY;
}

export function AnalysisDashboard({
  companyName,
  companyInfo,
  data,
  ticker,
  provider,
  isBookmarked,
  onToggleBookmark,
  webSearchUsed,
  webSearchError,
  cachedDataTimestamp,
  onRefresh,
  isRefreshing
}: AnalysisDashboardProps) {
  const isCached = cachedDataTimestamp !== null && cachedDataTimestamp !== undefined;
  const isStale = isCached && isDataStale(cachedDataTimestamp);
  return (
    <div className="space-y-6">
      {/* Company Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-white">{companyName}</h2>
          <SentimentBadge sentiment={data.sentiment} />
          {webSearchUsed && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-medium">
              <Globe className="w-3 h-3" />
              <span>Web Search</span>
            </div>
          )}
          {webSearchError && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-medium" title={webSearchError}>
              <AlertTriangle className="w-3 h-3" />
              <span>Web Search Failed</span>
            </div>
          )}
          {isCached && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
              isStale
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                : 'bg-zinc-500/10 border border-zinc-500/30 text-zinc-400'
            }`}>
              <Database className="w-3 h-3" />
              <span>Cached {getRelativeTime(cachedDataTimestamp!)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh button - show prominently if data is stale */}
          {isCached && onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`border-zinc-700 transition-colors ${
                isStale
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isStale ? 'Refresh Data' : 'Refresh'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleBookmark}
            className={`border-zinc-700 transition-colors ${
              isBookmarked
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck className="w-4 h-4 mr-2" />
                Bookmarked
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 mr-2" />
                Bookmark
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stale Data Warning Banner */}
      {isStale && onRefresh && (
        <div className="flex items-center justify-between gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="text-amber-400 font-medium text-sm">Data may be outdated</h4>
              <p className="text-amber-400/70 text-xs mt-0.5">
                This analysis was saved {getRelativeTime(cachedDataTimestamp!)}. Click refresh to get the latest data.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="bg-amber-600 hover:bg-amber-500 text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Now
          </Button>
        </div>
      )}

      {/* Web Search Error Banner */}
      {webSearchError && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-amber-400 font-medium text-sm">Web Search Unavailable</h4>
            <p className="text-amber-400/70 text-xs mt-1">{webSearchError}</p>
            <p className="text-zinc-500 text-xs mt-2">
              Links in news, case studies, and investor documents may not work.
              Check your WebSearchAPI key in settings, or switch to Gemini/Perplexity for built-in web grounding.
            </p>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Stock Card - 2 col (always show, with manual ticker input if not found) */}
        <StockCard ticker={ticker} companyName={companyName} companyInfo={companyInfo} />

        {/* Executive Summary - 2 col */}
        <ExecutiveSummary summary={data.summary} />

        {/* Quick Facts - 1 col */}
        <QuickFacts facts={data.quickFacts} />

        {/* Key Priorities - 1 col */}
        <KeyPriorities priorities={data.keyPriorities} />

        {/* Growth Initiatives - 1 col */}
        <GrowthInitiatives initiatives={data.growthInitiatives} />

        {/* Investor Documents - 1 col */}
        <InvestorDocuments documents={data.investorDocs} companyInfo={companyInfo} />

        {/* Tech News - 2 col */}
        <TechNews news={data.techNews} />

        {/* Case Studies - 1 col */}
        <CaseStudies studies={data.caseStudies} />

        {/* Competitive Landscape - 2 col */}
        <CompetitiveLandscape competitors={data.competitors} />

        {/* M&A Activity - 3 col (full width) */}
        <MAActivity activity={data.maActivity} />
      </div>

      {/* Grounding Sources */}
      <GroundingSources sources={data.sources} />
    </div>
  );
}
