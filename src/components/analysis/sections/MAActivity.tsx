import { Briefcase } from 'lucide-react';
import { SectionCard } from '../SectionCard';
import { MAItem } from '@/types/analysis';

interface MAActivityProps {
  activity: MAItem[];
}

export function MAActivity({ activity }: MAActivityProps) {
  return (
    <SectionCard title="M&A Activity (5 Years)" icon={Briefcase} color="blue" className="xl:col-span-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-500 border-b border-zinc-800">
              <th className="pb-2 pr-4 font-medium">Year</th>
              <th className="pb-2 pr-4 font-medium">Type</th>
              <th className="pb-2 pr-4 font-medium">Target/Partner</th>
              <th className="pb-2 pr-4 font-medium">Deal Value</th>
              <th className="pb-2 font-medium">Rationale</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((deal, i) => (
              <tr key={i} className="border-b border-zinc-800/50 text-zinc-300">
                <td className="py-3 pr-4">{deal.year || '-'}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      deal.type?.toLowerCase().includes('acquisition')
                        ? 'bg-blue-500/20 text-blue-400'
                        : deal.type?.toLowerCase().includes('merger')
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {deal.type || '-'}
                  </span>
                </td>
                <td className="py-3 pr-4">{deal.target || '-'}</td>
                <td className="py-3 pr-4 text-zinc-400">{deal.dealValue || '-'}</td>
                <td className="py-3 text-zinc-400">{deal.rationale || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {activity.length === 0 && (
          <p className="text-zinc-500 text-sm py-4 text-center">No M&A activity found</p>
        )}
      </div>
    </SectionCard>
  );
}
