import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, enquiries, newsletter } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Download,
  RefreshCw,
  AlertTriangle,
  Mail,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PartnerEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
  charger_type: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

interface InvestorEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string | null;
  city: string | null;
  investor_type: string | null;
  investment_range: string | null;
  status: string;
  created_at: string;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string | null;
  status: 'subscribed' | 'unsubscribed';
  provider: string | null;
  provider_synced_at: string | null;
  provider_error: string | null;
  created_at: string;
}

/** Quotes every field so a comma or quote in a value can't shift a column. */
const toCsv = (rows: NewsletterSubscriber[]) => {
  const header = ['email', 'status', 'source', 'subscribed_at', 'synced_to_provider'];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.email,
      r.status,
      r.source ?? '',
      new Date(r.created_at).toISOString(),
      r.provider_synced_at ? 'yes' : 'no',
    ]
      .map(escape)
      .join(',')
  );
  return [header.join(','), ...lines].join('\r\n');
};

const AdminEnquiries = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [partnerEnquiries, setPartnerEnquiries] = useState<PartnerEnquiry[]>([]);
  const [investorEnquiries, setInvestorEnquiries] = useState<InvestorEnquiry[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<PartnerEnquiry | null>(null);
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorEnquiry | null>(null);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isResyncing, setIsResyncing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    kind: 'partner' | 'investor' | 'subscriber';
  } | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
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

    await Promise.all([fetchPartnerEnquiries(), fetchInvestorEnquiries(), fetchSubscribers()]);
    setIsAdmin(true);
    setLoading(false);
  };

  const fetchPartnerEnquiries = async () => {
    try {
      setPartnerEnquiries((await enquiries.list('partners')) as PartnerEnquiry[]);
    } catch {
      toast.error('Failed to load partner enquiries');
    }
  };

  const fetchInvestorEnquiries = async () => {
    try {
      setInvestorEnquiries((await enquiries.list('investors')) as InvestorEnquiry[]);
    } catch {
      toast.error('Failed to load investor enquiries');
    }
  };

  const fetchSubscribers = async () => {
    try {
      setSubscribers((await newsletter.list()) as unknown as NewsletterSubscriber[]);
    } catch {
      toast.error('Failed to load newsletter subscribers');
    }
  };

  const toggleSubscriber = async (id: string, status: 'subscribed' | 'unsubscribed') => {
    try {
      await newsletter.setStatus(id, status);
      toast.success(status === 'subscribed' ? 'Re-subscribed' : 'Unsubscribed');
      fetchSubscribers();
    } catch {
      toast.error('Failed to update subscriber');
    }
  };

  /**
   * Pushes the rows the list provider never accepted — everyone collected
   * before a provider was configured, plus anything that failed while it was
   * down. No-op when NEWSLETTER_PROVIDER is unset on the API.
   */
  const resyncSubscribers = async () => {
    setIsResyncing(true);
    try {
      const { attempted, succeeded, failed } = await newsletter.resync();
      if (attempted === 0) {
        toast.success('Nothing pending — every subscriber is already synced.');
      } else {
        toast.success(`Synced ${succeeded} of ${attempted} subscriber(s)`, {
          description: failed > 0 ? `${failed} still failing — hover a row to see why.` : undefined,
        });
      }
      fetchSubscribers();
    } catch {
      toast.error('Resync failed. Check the newsletter provider settings on the API.');
    } finally {
      setIsResyncing(false);
    }
  };

  const exportSubscribers = () => {
    if (subscribers.length === 0) {
      toast.error('No subscribers to export');
      return;
    }
    const blob = new Blob([toCsv(subscribers)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const updatePartnerStatus = async (id: string, status: string) => {
    try {
      await enquiries.updateStatus('partners', id, status);
      toast.success('Status updated');
      fetchPartnerEnquiries();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const updateInvestorStatus = async (id: string, status: string) => {
    try {
      await enquiries.updateStatus('investors', id, status);
      toast.success('Status updated');
      fetchInvestorEnquiries();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      if (pendingDelete.kind === 'subscriber') {
        await newsletter.remove(pendingDelete.id);
        toast.success('Deleted successfully');
        fetchSubscribers();
      } else {
        const kind = pendingDelete.kind === 'partner' ? 'partners' : 'investors';
        await enquiries.remove(kind, pendingDelete.id);
        toast.success('Deleted successfully');
        if (pendingDelete.kind === 'partner') fetchPartnerEnquiries();
        else fetchInvestorEnquiries();
      }
    } catch {
      toast.error('Failed to delete');
    }
    setPendingDelete(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'contacted':
        return <Badge variant="outline" className="text-blue-600 border-blue-500"><Eye className="w-3 h-3 mr-1" />Contacted</Badge>;
      case 'converted':
        return <Badge variant="outline" className="text-green-600 border-green-500"><CheckCircle className="w-3 h-3 mr-1" />Converted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-500"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Guard against pre-auth UI flash: render a spinner until we've confirmed
  // both that the session loaded and the admin role check passed.
  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 p-4 md:p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Enquiries Management
          </h1>
        </div>

        <Tabs defaultValue="partner" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
            <TabsTrigger value="partner">Partner ({partnerEnquiries.length})</TabsTrigger>
            <TabsTrigger value="investor">Investor ({investorEnquiries.length})</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter ({subscribers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="partner">
            <div className="grid gap-4">
              {partnerEnquiries.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  No partner enquiries yet
                </Card>
              ) : (
                partnerEnquiries.map((enquiry) => (
                  <Card key={enquiry.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{enquiry.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{enquiry.email} | {enquiry.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(enquiry.status)}
                          <Select
                            value={enquiry.status}
                            onValueChange={(val) => updatePartnerStatus(enquiry.id, val)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          <span>Charger: {enquiry.charger_type || 'N/A'}</span>
                          <span className="mx-2">|</span>
                          <span>{new Date(enquiry.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPartner(enquiry)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setPendingDelete({ id: enquiry.id, kind: 'partner' })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="investor">
            <div className="grid gap-4">
              {investorEnquiries.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  No investor enquiries yet
                </Card>
              ) : (
                investorEnquiries.map((enquiry) => (
                  <Card key={enquiry.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{enquiry.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{enquiry.email} | {enquiry.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(enquiry.status)}
                          <Select
                            value={enquiry.status}
                            onValueChange={(val) => updateInvestorStatus(enquiry.id, val)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          <span>{enquiry.investor_type || 'N/A'}</span>
                          <span className="mx-2">|</span>
                          <span>{enquiry.investment_range || 'N/A'}</span>
                          <span className="mx-2">|</span>
                          <span>{new Date(enquiry.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedInvestor(enquiry)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setPendingDelete({ id: enquiry.id, kind: 'investor' })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="newsletter">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-sm text-muted-foreground">
                Everyone who signed up through the "Join Our Newsletter" form.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={resyncSubscribers} disabled={isResyncing}>
                  {isResyncing ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-1" />
                  )}
                  Sync to provider
                </Button>
                <Button size="sm" variant="outline" onClick={exportSubscribers}>
                  <Download className="w-4 h-4 mr-1" />
                  Export CSV
                </Button>
                {/* Composing and sending lives on its own screen so the
                    rich-text editor stays out of this page's bundle. */}
                <Button size="sm" asChild>
                  <Link to="/admin/newsletter">
                    <Mail className="w-4 h-4 mr-1" />
                    Compose a campaign
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3">
              {subscribers.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  No newsletter subscribers yet
                </Card>
              ) : (
                subscribers.map((subscriber) => (
                  <Card key={subscriber.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                      <div className="min-w-0">
                        <p className="font-medium break-all">{subscriber.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(subscriber.created_at).toLocaleDateString()}
                          {subscriber.source ? ` | ${subscriber.source}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {subscriber.status === 'subscribed' ? (
                          <Badge variant="outline" className="text-green-600 border-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Subscribed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <XCircle className="w-3 h-3 mr-1" />
                            Unsubscribed
                          </Badge>
                        )}
                        {/* Only shown when the provider push failed — the
                            address is still stored and "Sync to provider"
                            retries it. */}
                        {subscriber.provider_error && (
                          <Badge
                            variant="outline"
                            className="text-amber-600 border-amber-500"
                            title={subscriber.provider_error}
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Not synced
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toggleSubscriber(
                              subscriber.id,
                              subscriber.status === 'subscribed' ? 'unsubscribed' : 'subscribed'
                            )
                          }
                        >
                          {subscriber.status === 'subscribed' ? 'Unsubscribe' : 'Re-subscribe'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setPendingDelete({ id: subscriber.id, kind: 'subscriber' })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Partner Detail Dialog */}
      <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Partner Enquiry Details</DialogTitle>
            <DialogDescription>Submitted on {selectedPartner && new Date(selectedPartner.created_at).toLocaleString()}</DialogDescription>
          </DialogHeader>
          {selectedPartner && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{selectedPartner.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium">{selectedPartner.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="font-medium">{selectedPartner.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Charger Type</label>
                  <p className="font-medium">{selectedPartner.charger_type || 'N/A'}</p>
                </div>
              </div>
              {selectedPartner.location_address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p className="font-medium">{selectedPartner.location_address}</p>
                  {selectedPartner.location_lat && selectedPartner.location_lng && (
                    <a
                      href={`https://www.google.com/maps?q=${selectedPartner.location_lat},${selectedPartner.location_lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View on Google Maps →
                    </a>
                  )}
                </div>
              )}
              {selectedPartner.message && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Message</label>
                  <p className="font-medium">{selectedPartner.message}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDelete?.kind === 'subscriber'
                ? 'Delete this subscriber?'
                : 'Delete this enquiry?'}
            </AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Investor Detail Dialog */}
      <Dialog open={!!selectedInvestor} onOpenChange={() => setSelectedInvestor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Investor Enquiry Details</DialogTitle>
            <DialogDescription>Submitted on {selectedInvestor && new Date(selectedInvestor.created_at).toLocaleString()}</DialogDescription>
          </DialogHeader>
          {selectedInvestor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{selectedInvestor.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium">{selectedInvestor.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="font-medium">{selectedInvestor.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Organization</label>
                  <p className="font-medium">{selectedInvestor.organization || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">City</label>
                  <p className="font-medium">{selectedInvestor.city || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Investor Type</label>
                  <p className="font-medium">{selectedInvestor.investor_type || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Investment Range</label>
                  <p className="font-medium">{selectedInvestor.investment_range || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEnquiries;