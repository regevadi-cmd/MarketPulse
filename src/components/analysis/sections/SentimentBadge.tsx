import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnalysisResult } from '@/types/analysis';

interface SentimentBadgeProps {
  sentiment: AnalysisResult['sentiment'];
}

const sentimentConfig = {
  BULLISH: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/50',
    icon: TrendingUp
  },
  BEARISH: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/50',
    icon: TrendingDown
  },
  MIXED: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/50',
    icon: Minus
  },
  NEUTRAL: {
    bg: 'bg-zinc-500/20',
    text: 'text-zinc-400',
    border: 'border-zinc-500/50',
    icon: HelpCircle
  }
};

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const config = sentimentConfig[sentiment] || sentimentConfig.NEUTRAL;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border',
        config.bg,
        config.text,
        config.border
      )}
    >
      <Icon className="w-4 h-4" />
      {sentiment}
    </span>
  );
}
