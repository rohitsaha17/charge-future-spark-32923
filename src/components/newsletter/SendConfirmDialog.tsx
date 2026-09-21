import { useEffect, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { Campaign } from '@/lib/api';
import { matchesSubjectConfirmation, type TestSendRecord } from '@/lib/campaignGuards';

/** Long enough to interrupt a double-click, short enough not to be theatre. */
const ARM_SECONDS = 3;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
  lastTest: TestSendRecord | null;
  sending: boolean;
  onConfirm: (confirm: string) => void;
}

/**
 * The last thing between an admin and an irreversible send to every contact.
 *
 * Three independent guards, because each covers a different mistake:
 *
 *  - **Typing the subject line.** A stray click cannot produce it, and the API
 *    checks the same string, so the guard is server-verified rather than a UI
 *    courtesy. The recipient count sits beside it, large, because that is the
 *    number that should give someone pause.
 *  - **A short arming delay.** The cheapest guard here: a double-click that
 *    opened this dialog cannot also press the button inside it.
 *  - **Focus never lands on the action.** Enter is swallowed in the input, so
 *    muscle memory cannot submit.
 *
 * While the send is in flight both buttons are disabled and the dialog refuses
 * to close. A dialog that still looks dismissable would imply the send can be
 * called back, and it cannot.
 */
const SendConfirmDialog = ({
  open,
  onOpenChange,
  campaign,
  lastTest,
  sending,
  onConfirm,
}: Props) => {
  const [typed, setTyped] = useState('');
  const [armed, setArmed] = useState(false);
  const [countdown, setCountdown] = useState(ARM_SECONDS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    setTyped('');
    setArmed(false);
    setCountdown(ARM_SECONDS);

    const timer = setInterval(() => {
      setCountdown((remaining) => {
        if (remaining <= 1) {
          clearInterval(timer);
          setArmed(true);
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

  const matches = matchesSubjectConfirmation(typed, campaign.subject_line);
  const canSend = matches && armed && !sending;
  const recipients = campaign.recipient_count.toLocaleString();

  return (
    <AlertDialog
      open={open}
      // Ignored entirely mid-flight: there is nothing to cancel once the
      // request is with Mailchimp.
      onOpenChange={(next) => {
        if (!sending) onOpenChange(next);
      }}
    >
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <span>
              Send &ldquo;{campaign.subject_line}&rdquo; to {recipients} subscribers?
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            This sends a real email immediately. It cannot be recalled, edited or undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <dl className="rounded-lg border bg-muted/40 p-3 text-sm">
            <div className="flex justify-between gap-4 py-0.5">
              <dt className="text-muted-foreground">From</dt>
              <dd className="truncate text-right font-medium">
                {campaign.from_name} &lt;{campaign.reply_to}&gt;
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-0.5">
              <dt className="text-muted-foreground">Subject</dt>
              <dd className="truncate text-right font-medium">{campaign.subject_line}</dd>
            </div>
            <div className="flex justify-between gap-4 py-0.5">
              <dt className="text-muted-foreground">Recipients</dt>
              <dd className="text-right text-lg font-bold text-destructive">{recipients}</dd>
            </div>
            {lastTest && (
              <div className="flex justify-between gap-4 border-t pt-2 mt-2">
                <dt className="text-muted-foreground">Last test</dt>
                <dd className="truncate text-right">
                  {new Date(lastTest.at).toLocaleString()} to {lastTest.emails.join(', ')}
                </dd>
              </div>
            )}
          </dl>

          <div className="space-y-2">
            <Label htmlFor="send-confirm">
              Type the subject line to confirm
            </Label>
            <Input
              id="send-confirm"
              ref={inputRef}
              autoFocus
              autoComplete="off"
              value={typed}
              disabled={sending}
              placeholder={campaign.subject_line ?? ''}
              onChange={(e) => setTyped(e.target.value)}
              // Otherwise Enter would submit from muscle memory, defeating
              // both the typed confirmation and the arming delay.
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.preventDefault();
              }}
            />
            {typed.length > 0 && !matches && (
              <p className="text-xs text-muted-foreground">
                That does not match the subject line exactly.
              </p>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            disabled={sending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={!canSend}
            onClick={() => onConfirm(typed.trim())}
          >
            {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {sending
              ? 'Sending…'
              : armed
                ? `Send to ${recipients} subscribers`
                : `Send in ${countdown}…`}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SendConfirmDialog;
