import { TrendingUp } from 'lucide-react';
import { SectionCard } from '../SectionCard';

interface GrowthInitiativesProps {
  initiatives: string[];
}

export function GrowthInitiatives({ initiatives }: GrowthInitiativesProps) {
  return (
    <SectionCard title="Growth Initiatives" icon={TrendingUp} color="amber">
      <ul className="space-y-2">
        {initiatives.slice(0, 5).map((initiative, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-amber-500 font-bold flex-shrink-0">{i + 1}.</span>
            <span className="text-zinc-300">{initiative}</span>
          </li>
        ))}
        {initiatives.length === 0 && (
          <li className="text-zinc-500 text-sm">No data available</li>
        )}
      </ul>
    </SectionCard>
  );
}
