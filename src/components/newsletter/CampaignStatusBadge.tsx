import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, FileText, Loader2, Send, XCircle } from 'lucide-react';
import type { CampaignStatus } from '@/lib/api';
import { statusLabel } from '@/lib/campaignStatus';

/**
 * Mirrors the enquiry status badges so the two admin screens read as one
 * product. Colour alone never carries the meaning — every badge has an icon
 * and a word.
 */
const STYLES: Record<CampaignStatus, { icon: typeof FileText; className: string }> = {
  save: { icon: FileText, className: 'border-slate-300 text-slate-700 bg-slate-50' },
  paused: { icon: Clock, className: 'border-slate-300 text-slate-700 bg-slate-50' },
  schedule: { icon: Clock, className: 'border-blue-300 text-blue-700 bg-blue-50' },
  sending: { icon: Loader2, className: 'border-amber-300 text-amber-700 bg-amber-50' },
  sent: { icon: CheckCircle, className: 'border-green-300 text-green-700 bg-green-50' },
  canceled: { icon: XCircle, className: 'border-red-300 text-red-700 bg-red-50' },
  canceling: { icon: Loader2, className: 'border-red-300 text-red-700 bg-red-50' },
};

const FALLBACK = { icon: Send, className: 'border-slate-300 text-slate-700 bg-slate-50' };

interface Props {
  status: CampaignStatus;
  className?: string;
}

const CampaignStatusBadge = ({ status, className }: Props) => {
  const { icon: Icon, className: tone } = STYLES[status] ?? FALLBACK;
  const spinning = status === 'sending' || status === 'canceling';

  return (
    <Badge variant="outline" className={`gap-1 ${tone} ${className ?? ''}`}>
      <Icon className={`w-3 h-3 ${spinning ? 'animate-spin' : ''}`} />
      {statusLabel(status)}
    </Badge>
  );
};

export default CampaignStatusBadge;
