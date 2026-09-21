import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import type { CampaignReport } from '@/lib/api';

interface Props {
  report: CampaignReport;
}

const percent = (rate: number) => `${(rate * 100).toFixed(1)}%`;

/**
 * Delivery stats for a sent campaign. Rates come from Mailchimp as fractions.
 *
 * Unsubscribes and bounces sit alongside opens rather than being hidden — they
 * are the numbers that say whether the *next* send will land, and a report
 * that only shows the flattering figures is not much of a report.
 */
const CampaignReportCard = ({ report }: Props) => {
  const tiles = [
    { label: 'Delivered', value: report.emails_sent.toLocaleString() },
    {
      label: 'Opens',
      value: report.opens.unique.toLocaleString(),
      hint: `${percent(report.opens.rate)} of delivered`,
    },
    {
      label: 'Clicks',
      value: report.clicks.unique.toLocaleString(),
      hint: `${percent(report.clicks.rate)} of delivered`,
    },
    {
      label: 'Bounced',
      value: (report.bounces.hard + report.bounces.soft).toLocaleString(),
      hint: `${report.bounces.hard.toLocaleString()} hard`,
    },
    { label: 'Unsubscribed', value: report.unsubscribed.toLocaleString() },
    { label: 'Spam reports', value: report.abuse_reports.toLocaleString() },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4" />
          Delivery report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-lg border bg-muted/30 p-3">
              <dt className="text-xs text-muted-foreground">{tile.label}</dt>
              <dd className="text-xl font-semibold">{tile.value}</dd>
              {tile.hint && <dd className="text-xs text-muted-foreground">{tile.hint}</dd>}
            </div>
          ))}
        </dl>
        {report.send_time && (
          <p className="mt-3 text-xs text-muted-foreground">
            Sent {new Date(report.send_time).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignReportCard;
