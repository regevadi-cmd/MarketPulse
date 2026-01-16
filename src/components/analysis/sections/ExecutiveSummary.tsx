import { Building2 } from 'lucide-react';
import { SectionCard } from '../SectionCard';

interface ExecutiveSummaryProps {
  summary: string;
}

export function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  return (
    <SectionCard title="Executive Summary" icon={Building2} color="emerald" className="xl:col-span-2">
      <p className="text-zinc-300 leading-relaxed">{summary}</p>
    </SectionCard>
  );
}
