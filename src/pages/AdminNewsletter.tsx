import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, auth, campaigns as campaignsApi, type Campaign } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ArrowLeft, CalendarClock, Info, Loader2, Mail, Plus, Users } from 'lucide-react';
import CampaignStatusBadge from '@/components/newsletter/CampaignStatusBadge';
import { isSettling } from '@/lib/campaignStatus';

/**
 * The campaign list.
 *
 * Deliberately has no Send button on it. Sending requires opening a campaign,
 * which removes the "clicked the wrong row" failure mode entirely — worth more
 * than the click it costs, given a send cannot be recalled.
 */
const AdminNewsletter = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Campaign[]>([]);
  const [unavailable, setUnavailable] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const user = await auth.me();
      if (!user) {
        navigate('/admin/login');
        return;
      }
      if (!user.roles.includes('admin')) {
        toast.error('You do not have admin access');
        navigate('/');
        return;
      }
      setIsAdmin(true);
      await fetchCampaigns();
    };
    void check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCampaigns = async () => {
    try {
      const result = await campaignsApi.list();
      setItems(result.items);
      setUnavailable(null);
    } catch (err) {
      // 503 is a normal state, not a failure: it just means the API has no
      // Mailchimp configured. Anything else is a real error.
      if (err instanceof ApiError && err.status === 503) {
        setUnavailable(err.message);
      } else {
        toast.error(err instanceof ApiError ? err.message : 'Failed to load campaigns');
      }
    } finally {
      setLoading(false);
    }
  };

  // Poll only while something is mid-send, and only from this list. A
  // permanently ticking interval on a forgotten admin tab is self-inflicted
  // load for no benefit.
  useEffect(() => {
    if (!items.some((c) => isSettling(c.status))) return;
    const timer = setInterval(() => void fetchCampaigns(), 15_000);
    return () => clearInterval(timer);
  }, [items]);

  const scheduled = useMemo(
    () => items.filter((c) => c.status === 'schedule'),
    [items]
  );

  const ordered = useMemo(() => {
    // Scheduled first — those are the ones with a deadline attached.
    const rank = (c: Campaign) => (c.status === 'schedule' ? 0 : isSettling(c.status) ? 1 : 2);
    return [...items].sort((a, b) => {
      const byRank = rank(a) - rank(b);
      if (byRank !== 0) return byRank;
      return (b.created_at ?? '').localeCompare(a.created_at ?? '');
    });
  }, [items]);

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/admin/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 bg-clip-text text-transparent">
              Newsletters
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Compose and send campaigns to your subscriber list.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/enquiries">
                <Users className="mr-2 h-4 w-4" />
                Subscribers
              </Link>
            </Button>
            <Button disabled={!!unavailable} asChild={!unavailable}>
              {unavailable ? (
                <span>
                  <Plus className="mr-2 h-4 w-4" />
                  New campaign
                </span>
              ) : (
                <Link to="/admin/newsletter/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New campaign
                </Link>
              )}
            </Button>
          </div>
        </div>

        {unavailable && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>Mailchimp is not connected</AlertTitle>
            <AlertDescription>
              {unavailable} Subscribers are still being collected and stored — set
              <code className="mx-1 rounded bg-muted px-1">NEWSLETTER_PROVIDER=mailchimp</code>
              on the API to send campaigns from here.
            </AlertDescription>
          </Alert>
        )}

        {scheduled.length > 0 && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <CalendarClock className="h-4 w-4" />
            <AlertTitle>
              {scheduled.length === 1
                ? '1 campaign scheduled'
                : `${scheduled.length} campaigns scheduled`}
            </AlertTitle>
            <AlertDescription>
              {scheduled
                .map(
                  (c) =>
                    `${c.subject_line} — ${
                      c.send_time ? new Date(c.send_time).toLocaleString() : 'time unknown'
                    }`
                )
                .join(' · ')}
            </AlertDescription>
          </Alert>
        )}

        {!unavailable && ordered.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Mail className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                No campaigns yet — create your first newsletter.
              </p>
              <Button className="mt-4" asChild>
                <Link to="/admin/newsletter/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New campaign
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {ordered.map((campaign) => (
            <Card key={campaign.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-medium">
                      {campaign.subject_line || 'Untitled campaign'}
                    </span>
                    <CampaignStatusBadge status={campaign.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {campaign.status === 'sent'
                      ? `Sent to ${campaign.emails_sent.toLocaleString()} · ${
                          campaign.send_time
                            ? new Date(campaign.send_time).toLocaleString()
                            : ''
                        }`
                      : campaign.status === 'schedule' && campaign.send_time
                        ? `Scheduled for ${new Date(campaign.send_time).toLocaleString()}`
                        : `${campaign.recipient_count.toLocaleString()} recipients${
                            campaign.created_at
                              ? ` · created ${new Date(campaign.created_at).toLocaleDateString()}`
                              : ''
                          }`}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/newsletter/${campaign.id}`}>
                    {campaign.status === 'save' ? 'Edit' : 'View'}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminNewsletter;
