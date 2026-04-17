import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
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

const AdminEnquiries = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [partnerEnquiries, setPartnerEnquiries] = useState<PartnerEnquiry[]>([]);
  const [investorEnquiries, setInvestorEnquiries] = useState<InvestorEnquiry[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<PartnerEnquiry | null>(null);
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorEnquiry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; kind: 'partner' | 'investor' } | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/admin/login');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      toast.error('You do not have admin access');
      navigate('/');
      return;
    }

    await Promise.all([fetchPartnerEnquiries(), fetchInvestorEnquiries()]);
    setLoading(false);
  };

  const fetchPartnerEnquiries = async () => {
    const { data, error } = await supabase
      .from('partner_enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPartnerEnquiries(data);
    }
  };

  const fetchInvestorEnquiries = async () => {
    const { data, error } = await supabase
      .from('investor_enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInvestorEnquiries(data);
    }
  };

  const updatePartnerStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('partner_enquiries')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
      fetchPartnerEnquiries();
    }
  };

  const updateInvestorStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('investor_enquiries')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
      fetchInvestorEnquiries();
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const table = pendingDelete.kind === 'partner' ? 'partner_enquiries' : 'investor_enquiries';
    const { error } = await supabase.from(table).delete().eq('id', pendingDelete.id);

    if (error) {
      toast.error('Failed to delete');
    } else {
      toast.success('Deleted successfully');
      if (pendingDelete.kind === 'partner') fetchPartnerEnquiries();
      else fetchInvestorEnquiries();
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="partner">Partner Enquiries ({partnerEnquiries.length})</TabsTrigger>
            <TabsTrigger value="investor">Investor Enquiries ({investorEnquiries.length})</TabsTrigger>
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
            <AlertDialogTitle>Delete this enquiry?</AlertDialogTitle>
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