import { Link as LinkIcon } from 'lucide-react';

interface GroundingSourcesProps {
  sources: string[];
}

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function GroundingSources({ sources }: GroundingSourcesProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-8 p-5 bg-zinc-900/50 rounded-xl border border-zinc-800">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <LinkIcon className="w-4 h-4" />
        Grounding Sources
      </h3>
      <div className="flex flex-wrap gap-2">
        {sources.map((url, i) => (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs text-zinc-400 hover:text-zinc-200 transition-colors truncate max-w-xs"
          >
            {extractHostname(url)}
          </a>
        ))}
      </div>
    </div>
  );
}
