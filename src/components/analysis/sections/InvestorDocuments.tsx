import { Briefcase, ExternalLink, Link as LinkIcon, Lock, FileText } from 'lucide-react';
import { SectionCard } from '../SectionCard';
import { LinkItem } from '@/types/analysis';
import { CompanyInfo } from '@/components/layout/Header';

interface InvestorDocumentsProps {
  documents: LinkItem[];
  companyInfo?: CompanyInfo | null;
}

function isValidHttpUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function InvestorDocuments({ documents, companyInfo }: InvestorDocumentsProps) {
  const isPrivate = companyInfo && (
    companyInfo.publicStatus === 'private' ||
    companyInfo.publicStatus === 'went_private' ||
    companyInfo.publicStatus === 'pre_ipo'
  );

  const getPrivateMessage = () => {
    if (!companyInfo?.publicStatus) return null;
    switch (companyInfo.publicStatus) {
      case 'private':
        return {
          title: 'Private Company',
          message: 'As a private company, there are no public SEC filings or investor documents available.',
          hint: null
        };
      case 'went_private':
        return {
          title: 'Formerly Public Company',
          message: 'This company was taken private. Historical SEC filings from when the company was public may still be available.',
          hint: 'Search SEC EDGAR for historical filings.'
        };
      case 'pre_ipo':
        return {
          title: 'Pre-IPO Company',
          message: 'This company is preparing for a potential IPO. Limited public filings may be available.',
          hint: 'Watch for S-1 registration statements if the company files for an IPO.'
        };
      default:
        return null;
    }
  };

  // Show private company message if no valid documents and company is private
  const hasValidDocs = documents.some(doc => isValidHttpUrl(doc.url));

  if (isPrivate && !hasValidDocs) {
    const privateMsg = getPrivateMessage();
    return (
      <SectionCard title="Investor Documents" icon={Briefcase} color="amber">
        <div className="py-4 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5 text-zinc-500" />
          </div>
          <h4 className="text-sm font-medium text-white mb-1">{privateMsg?.title}</h4>
          <p className="text-zinc-500 text-xs">{privateMsg?.message}</p>
          {privateMsg?.hint && (
            <p className="text-amber-400/70 text-xs mt-2 flex items-center justify-center gap-1">
              <FileText className="w-3 h-3" />
              {privateMsg.hint}
            </p>
          )}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Investor Documents" icon={Briefcase} color="amber">
      <div className="space-y-1">
        {/* Show context for formerly public or pre-IPO companies */}
        {isPrivate && hasValidDocs && (
          <div className="mb-3 pb-3 border-b border-zinc-800">
            <p className="text-xs text-amber-400/70">
              {companyInfo?.publicStatus === 'went_private' && '📁 Historical filings from when the company was public:'}
              {companyInfo?.publicStatus === 'pre_ipo' && '📋 Available filings for this pre-IPO company:'}
            </p>
          </div>
        )}
        {documents.map((doc, i) => {
          const hasValidUrl = isValidHttpUrl(doc.url);
          return (
            <div key={i} className="py-2 border-b border-zinc-800/50 last:border-0">
              {hasValidUrl ? (
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group cursor-pointer"
                >
                  <div className="flex items-start gap-2">
                    <LinkIcon className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 group-hover:text-amber-300 group-hover:underline transition-colors font-medium text-sm">
                          {doc.title}
                        </span>
                        <ExternalLink className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      </div>
                      {doc.summary && (
                        <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{doc.summary}</p>
                      )}
                    </div>
                  </div>
                </a>
              ) : (
                <div className="flex items-start gap-2">
                  <LinkIcon className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-zinc-300 font-medium text-sm">{doc.title}</span>
                    {doc.summary && (
                      <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{doc.summary}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {documents.length === 0 && !isPrivate && (
          <p className="text-zinc-500 text-sm">No documents found</p>
        )}
      </div>
    </SectionCard>
  );
}
