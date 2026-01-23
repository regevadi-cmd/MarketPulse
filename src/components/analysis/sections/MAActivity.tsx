import { Briefcase } from 'lucide-react';
import { SectionCard } from '../SectionCard';
import { MAItem } from '@/types/analysis';

interface MAActivityProps {
  activity: MAItem[];
}

export function MAActivity({ activity }: MAActivityProps) {
  return (
    <SectionCard title="M&A Activity" icon={Briefcase} color="blue">
      <div className="space-y-3">
        {activity.slice(0, 5).map((deal, i) => (
          <div key={i} className="p-3 bg-card/50 dark:bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  deal.type?.toLowerCase().includes('acquisition')
                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                    : deal.type?.toLowerCase().includes('merger')
                    ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                    : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                }`}
              >
                {deal.type || 'Deal'}
              </span>
              <span className="text-muted-foreground text-xs">{deal.year || ''}</span>
            </div>
            <div className="text-foreground font-medium text-sm">{deal.target || '-'}</div>
            {deal.dealValue && (
              <div className="text-emerald-600 dark:text-emerald-400 text-xs mt-1">{deal.dealValue}</div>
            )}
            {deal.rationale && (
              <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{deal.rationale}</p>
            )}
          </div>
        ))}
        {activity.length === 0 && (
          <p className="text-muted-foreground text-sm">No M&A activity found</p>
        )}
      </div>
    </SectionCard>
  );
}
