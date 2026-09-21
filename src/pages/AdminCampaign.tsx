import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ApiError,
  auth,
  campaigns as campaignsApi,
  type Campaign,
  type CampaignReport,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import RichTextEditor from '@/components/RichTextEditor';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Loader2,
  RefreshCw,
  Save,
  Send,
  Trash2,
} from 'lucide-react';
import CampaignStatusBadge from '@/components/newsletter/CampaignStatusBadge';
import CampaignPreview from '@/components/newsletter/CampaignPreview';
import CampaignReportCard from '@/components/newsletter/CampaignReportCard';
import SendConfirmDialog from '@/components/newsletter/SendConfirmDialog';
import ScheduleDialog from '@/components/newsletter/ScheduleDialog';
import TestSendCard from '@/components/newsletter/TestSendCard';
import {
  canCancel,
  canDelete,
  canSchedule,
  canSend,
  hasReport,
  isEditable,
  isSettling,
} from '@/lib/campaignStatus';
import {
  contentHash,
  readTestSend,
  sendPreconditions,
  writeTestSend,
  type TestSendRecord,
} from '@/lib/campaignGuards';

/** Mailchimp sends can run long; an uncapped 5s poll on a forgotten tab is waste. */
const POLL_MS = 5_000;
const POLL_CEILING_MS = 10 * 60_000;

interface SettingsForm {
  subject_line: string;
  preview_text: string;
  from_name: string;
  reply_to: string;
}

const emptyForm: SettingsForm = {
  subject_line: '',
  preview_text: '',
  from_name: '',
  reply_to: '',
};

const AdminCampaign = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [html, setHtml] = useState('');
  const [report, setReport] = useState<CampaignReport | null>(null);
  const [lastTest, setLastTest] = useState<TestSendRecord | null>(null);

  // What was last persisted, so "dirty" means genuinely unsaved rather than
  // merely touched. Sending mails the saved version, so the distinction is the
  // whole point of the gate.
  const [savedHtml, setSavedHtml] = useState('');
  const [savedForm, setSavedForm] = useState<SettingsForm>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pollExpired, setPollExpired] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const prevStatus = useRef<string | null>(null);

  const dirty =
    html !== savedHtml ||
    (Object.keys(form) as (keyof SettingsForm)[]).some((k) => form[k] !== savedForm[k]);

  const applyCampaign = useCallback((next: Campaign, nextHtml?: string | null) => {
    setCampaign(next);
    const nextForm: SettingsForm = {
      subject_line: next.subject_line ?? '',
      preview_text: next.preview_text ?? '',
      from_name: next.from_name ?? '',
      reply_to: next.reply_to ?? '',
    };
    setForm(nextForm);
    setSavedForm(nextForm);
    if (nextHtml !== undefined) {
      setHtml(nextHtml ?? '');
      setSavedHtml(nextHtml ?? '');
    }
  }, []);

  const load = useCallback(async () => {
    if (isNew) {
      setLoading(false);
      return;
    }
    try {
      const detail = await campaignsApi.get(id as string);
      applyCampaign(detail, detail.content.html);
      setLastTest(readTestSend(detail.id));
      setLoadError(null);
      if (hasReport(detail.status)) {
        // A report can legitimately not exist yet right after a send.
        setReport(await campaignsApi.report(detail.id).catch(() => null));
      }
    } catch (err) {
      // An empty composer would imply the draft was lost, which is far worse
      // than saying plainly that it could not be loaded.
      setLoadError(err instanceof ApiError ? err.message : 'Could not load this campaign');
    } finally {
      setLoading(false);
    }
  }, [id, isNew, applyCampaign]);

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
      await load();
    };
    void check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Poll while a send is settling, and stop after the ceiling rather than
  // ticking forever on a tab nobody is watching.
  useEffect(() => {
    if (!campaign || !isSettling(campaign.status) || pollExpired) return;

    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (Date.now() - startedAt > POLL_CEILING_MS) {
        setPollExpired(true);
        return;
      }
      void load();
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [campaign, pollExpired, load]);

  // Announce the transition once, not on every poll that sees the new status.
  useEffect(() => {
    if (!campaign) return;
    if (prevStatus.current === 'sending' && campaign.status === 'sent') {
      toast.success(`Campaign sent to ${campaign.emails_sent.toLocaleString()} subscribers`);
    }
    prevStatus.current = campaign.status;
  }, [campaign]);

  // A lot of typing lives on this screen; leaving it behind should take a
  // deliberate answer.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const handleSave = async () => {
    if (!form.subject_line.trim()) {
      toast.error('A subject line is required');
      return;
    }
    setSaving(true);
    try {
      if (isNew || !campaign) {
        const created = await campaignsApi.create({
          subject_line: form.subject_line,
          preview_text: form.preview_text || null,
          title: form.subject_line,
          ...(form.from_name ? { from_name: form.from_name } : {}),
          ...(form.reply_to ? { reply_to: form.reply_to } : {}),
          ...(html.trim() ? { html } : {}),
        });
        toast.success('Draft created');
        // Replace rather than push: the /new URL should not sit in history as
        // somewhere "back" leads to a second draft.
        navigate(`/admin/newsletter/${created.id}`, { replace: true });
        return;
      }

      const updated = await campaignsApi.update(campaign.id, {
        subject_line: form.subject_line,
        preview_text: form.preview_text || null,
        from_name: form.from_name || undefined,
        reply_to: form.reply_to || undefined,
      });

      let nextHtml = savedHtml;
      if (html !== savedHtml) {
        await campaignsApi.setContent(campaign.id, html);
        nextHtml = html;
      }
      applyCampaign(updated, nextHtml);
      toast.success('Campaign saved');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (emails: string[]) => {
    if (!campaign) return;
    setTesting(true);
    try {
      await campaignsApi.sendTest(campaign.id, emails);
      // Recorded against the *saved* content, since that is what Mailchimp
      // just sent — testing an unsaved draft would prove nothing.
      const record: TestSendRecord = {
        at: Date.now(),
        hash: contentHash(savedHtml, savedForm.subject_line),
        emails,
      };
      writeTestSend(campaign.id, record);
      setLastTest(record);
      toast.success(`Test sent to ${emails.length} address${emails.length > 1 ? 'es' : ''}`, {
        description: 'Check the inbox, then come back to send.',
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Test send failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSend = async (confirm: string) => {
    if (!campaign) return;
    setSending(true);
    try {
      const updated = await campaignsApi.send(campaign.id, confirm);
      setCampaign(updated);
      setSendOpen(false);
      toast.success(
        `Sending to ${campaign.recipient_count.toLocaleString()} subscribers — this can take a few minutes.`
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('This campaign is already sending or sent.');
        setSendOpen(false);
        void load();
      } else if (err instanceof ApiError && err.status < 500) {
        toast.error(err.message || 'Send failed. Nothing was sent.');
      } else {
        // A timed-out or failed request may still have reached Mailchimp.
        // Claiming nothing was sent would be a guess, and the expensive kind.
        toast.error('We could not confirm the send.', {
          description: 'Check the campaign status before trying again.',
        });
        setSendOpen(false);
        void load();
      }
    } finally {
      setSending(false);
    }
  };

  const handleSchedule = async (scheduleTime: string) => {
    if (!campaign) return;
    setScheduling(true);
    try {
      const updated = await campaignsApi.schedule(
        campaign.id,
        scheduleTime,
        campaign.subject_line ?? ''
      );
      setCampaign(updated);
      setScheduleOpen(false);
      toast.success(`Scheduled for ${new Date(scheduleTime).toLocaleString()}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to schedule');
    } finally {
      setScheduling(false);
    }
  };

  const runAction = async (
    action: () => Promise<Campaign>,
    success: string,
    failure: string
  ) => {
    try {
      setCampaign(await action());
      toast.success(success);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : failure);
    }
  };

  const handleDelete = async () => {
    if (!campaign) return;
    try {
      await campaignsApi.remove(campaign.id);
      toast.success('Campaign deleted');
      navigate('/admin/newsletter');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to delete campaign');
    }
  };

  // In-app navigation does not trigger `beforeunload`, so leaving with unsaved
  // content needs its own prompt. `confirm()` is avoided everywhere in this
  // codebase, hence the dialog rather than a native one.
  const leave = () => {
    if (dirty) setLeaveOpen(true);
    else navigate('/admin/newsletter');
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const status = campaign?.status ?? 'save';
  const editable = isNew || isEditable(status);
  const testStale =
    !!lastTest && lastTest.hash !== contentHash(savedHtml, savedForm.subject_line);

  const preconditions = campaign
    ? sendPreconditions({
        campaign: { ...campaign, ...form },
        html,
        dirty,
        lastTest: testStale ? null : lastTest,
      })
    : { ok: false, reasons: ['Save the draft first.'] };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={leave}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Newsletters
        </Button>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 bg-clip-text text-transparent">
            {isNew ? 'New campaign' : form.subject_line || 'Campaign'}
          </h1>
          <div className="flex items-center gap-2">
            {campaign && <CampaignStatusBadge status={campaign.status} />}
            {campaign && canDelete(campaign.status) && (
              <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {loadError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Could not load this campaign</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center gap-3">
              <span>{loadError}</span>
              <Button size="sm" variant="outline" onClick={() => void load()}>
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {campaign?.status === 'schedule' && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <CalendarClock className="h-4 w-4" />
            <AlertTitle>
              Scheduled for{' '}
              {campaign.send_time ? new Date(campaign.send_time).toLocaleString() : 'an unknown time'}
            </AlertTitle>
            <AlertDescription className="flex flex-wrap items-center gap-3">
              <span>Unschedule it to make further edits.</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  runAction(
                    () => campaignsApi.unschedule(campaign.id),
                    'Unscheduled — back to draft',
                    'Failed to unschedule'
                  )
                }
              >
                Unschedule
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {pollExpired && campaign && isSettling(campaign.status) && (
          <Alert className="mb-6">
            <AlertTitle>Still sending</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center gap-3">
              <span>This is taking a while. Check again when you like.</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setPollExpired(false);
                  void load();
                }}
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Refresh
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Campaign settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject line</Label>
                  <Input
                    id="subject"
                    maxLength={150}
                    disabled={!editable}
                    value={form.subject_line}
                    onChange={(e) => setForm({ ...form, subject_line: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    {form.subject_line.length}/150
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preview">Preview text</Label>
                  <Input
                    id="preview"
                    maxLength={150}
                    disabled={!editable}
                    placeholder="The line shown after the subject in an inbox"
                    value={form.preview_text}
                    onChange={(e) => setForm({ ...form, preview_text: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="from-name">From name</Label>
                    <Input
                      id="from-name"
                      disabled={!editable}
                      placeholder="Defaults to the API setting"
                      value={form.from_name}
                      onChange={(e) => setForm({ ...form, from_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reply-to">Reply-to</Label>
                    <Input
                      id="reply-to"
                      type="email"
                      disabled={!editable}
                      placeholder="Defaults to the API setting"
                      value={form.reply_to}
                      onChange={(e) => setForm({ ...form, reply_to: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {editable && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextEditor value={html} onChange={setHtml} folder="newsletter" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Styling is converted to email-safe HTML when you save. Always confirm with
                    a test send.
                  </p>
                </CardContent>
              </Card>
            )}

            {editable && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isNew ? 'Create draft' : 'Save changes'}
                </Button>
                {dirty && (
                  <span className="self-center text-xs text-amber-700">Unsaved changes</span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <CampaignPreview
              html={html}
              subject={form.subject_line}
              previewText={form.preview_text}
              fromName={form.from_name || campaign?.from_name || null}
              replyTo={form.reply_to || campaign?.reply_to || null}
            />

            {report && <CampaignReportCard report={report} />}

            {campaign && !isNew && canSend(status) && (
              <>
                <TestSendCard
                  disabled={dirty || !savedHtml.trim()}
                  sending={testing}
                  lastTest={lastTest}
                  stale={testStale}
                  onSend={handleTest}
                />

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Send className="h-4 w-4" />
                      Send
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!preconditions.ok && (
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {preconditions.reasons.map((reason) => (
                          <li key={reason}>• {reason}</li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={!preconditions.ok}
                              onClick={() => setSendOpen(true)}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Send to {campaign.recipient_count.toLocaleString()} subscribers
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {!preconditions.ok && (
                          <TooltipContent>{preconditions.reasons[0]}</TooltipContent>
                        )}
                      </Tooltip>

                      {canSchedule(status) && (
                        <Button
                          variant="outline"
                          disabled={!preconditions.ok}
                          onClick={() => setScheduleOpen(true)}
                        >
                          <CalendarClock className="mr-2 h-4 w-4" />
                          Schedule
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {campaign && canCancel(campaign.status) && (
              <Button
                variant="outline"
                onClick={() =>
                  runAction(
                    () => campaignsApi.cancel(campaign.id),
                    'Cancelling the send',
                    'Failed to cancel'
                  )
                }
              >
                Cancel send
              </Button>
            )}
          </div>
        </div>
      </div>

      {campaign && (
        <SendConfirmDialog
          open={sendOpen}
          onOpenChange={setSendOpen}
          campaign={{ ...campaign, ...form }}
          lastTest={testStale ? null : lastTest}
          sending={sending}
          onConfirm={handleSend}
        />
      )}

      {campaign && (
        <ScheduleDialog
          open={scheduleOpen}
          onOpenChange={setScheduleOpen}
          campaign={{ ...campaign, ...form }}
          scheduling={scheduling}
          onConfirm={handleSchedule}
        />
      )}

      <AlertDialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This campaign has edits that have not been saved. Leaving now loses them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate('/admin/newsletter')}>
              Discard and leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              {campaign?.status === 'sent'
                ? 'The emails already sent are unaffected, but the delivery report will be lost.'
                : 'This draft will be removed from Mailchimp. This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCampaign;
