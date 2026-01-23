import { FileText } from 'lucide-react';
import { SectionCard } from '../SectionCard';
import { QuickFacts as QuickFactsType } from '@/types/analysis';

interface QuickFactsProps {
  facts: QuickFactsType;
}

const factLabels: Record<string, string> = {
  employeeCount: 'Employees',
  headquarters: 'Headquarters',
  industry: 'Industry',
  founded: 'Founded',
  ceo: 'CEO',
  marketCap: 'Market Cap'
};

export function QuickFacts({ facts }: QuickFactsProps) {
  const entries = Object.entries(facts).filter(([, value]) => value);

  return (
    <SectionCard title="Quick Facts" icon={FileText} color="emerald">
      <div className="space-y-2">
        {entries.map(([key, value]) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{factLabels[key] || key}</span>
            <span className="text-foreground font-medium">{value}</span>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-muted-foreground text-sm">No data available</p>
        )}
      </div>
    </SectionCard>
  );
}
