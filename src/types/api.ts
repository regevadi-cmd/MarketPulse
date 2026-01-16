import { AnalysisResult, ProviderName } from './analysis';

export interface AnalyzeRequest {
  companyName: string;
  provider: ProviderName;
  model?: string;
  apiKey?: string;
  webSearchApiKey?: string;
  tavilyApiKey?: string;
}

export interface AnalyzeResponse {
  data: AnalysisResult;
  cached: boolean;
  provider: ProviderName;
  webSearchUsed?: boolean;
  webSearchError?: string;
}

export interface StockData {
  ticker: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  marketState: string;
}

export interface ApiError {
  error: string;
  code?: string;
}
