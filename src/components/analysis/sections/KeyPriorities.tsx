import { Target } from 'lucide-react';
import { SectionCard } from '../SectionCard';

interface KeyPrioritiesProps {
  priorities: string[];
}

export function KeyPriorities({ priorities }: KeyPrioritiesProps) {
  return (
    <SectionCard title="Key Priorities" icon={Target} color="amber">
      <ul className="space-y-2">
        {priorities.slice(0, 5).map((priority, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className="text-amber-500 font-bold flex-shrink-0">{i + 1}.</span>
            <span className="text-zinc-300">{priority}</span>
          </li>
        ))}
        {priorities.length === 0 && (
          <li className="text-zinc-500 text-sm">No data available</li>
        )}
      </ul>
    </SectionCard>
  );
}
