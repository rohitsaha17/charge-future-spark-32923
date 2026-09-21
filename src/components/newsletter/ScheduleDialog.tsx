import { useEffect, useState } from 'react';
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
import { CalendarClock, Loader2 } from 'lucide-react';
import type { Campaign } from '@/lib/api';
import { buildScheduleCandidate, defaultScheduleValue } from '@/lib/campaignSchedule';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
  scheduling: boolean;
  onConfirm: (scheduleTime: string) => void;
}

/**
 * No typed confirmation here, unlike the send dialog — scheduling is
 * reversible right up until it fires, and Unschedule is one click away.
 *
 * What it does insist on is showing the resolved time back. Mailchimp works in
 * UTC quarter-hours while the admin types local time, so the conversion is
 * where a "sent at the wrong hour" incident would come from. The dialog states
 * both, and says plainly when the time was moved to the next valid slot.
 *
 * A plain `datetime-local` rather than a date picker: nothing else in this app
 * uses one, and the native control already understands the date-and-time pair.
 */
const ScheduleDialog = ({ open, onOpenChange, campaign, scheduling, onConfirm }: Props) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (open) setValue(defaultScheduleValue());
  }, [open]);

  const candidate = buildScheduleCandidate(value);
  const canSchedule = Boolean(candidate && !candidate.error && !scheduling);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!scheduling) onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Schedule &ldquo;{campaign.subject_line}&rdquo;
          </AlertDialogTitle>
          <AlertDialogDescription>
            It will go to {campaign.recipient_count.toLocaleString()} subscribers at the time
            below. You can unschedule it any time before then.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="schedule-at">Send at (your local time)</Label>
            <Input
              id="schedule-at"
              type="datetime-local"
              value={value}
              disabled={scheduling}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          {candidate && (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm">
              <p className="font-medium">
                {candidate.date.toLocaleString(undefined, {
                  dateStyle: 'full',
                  timeStyle: 'short',
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {candidate.date.toUTCString().replace('GMT', 'UTC')}
              </p>
              {candidate.adjusted && (
                <p className="mt-2 text-xs text-amber-700">
                  Moved to the next quarter hour — Mailchimp only accepts :00, :15, :30 and
                  :45 UTC.
                </p>
              )}
            </div>
          )}

          {candidate?.error && <p className="text-sm text-destructive">{candidate.error}</p>}
        </div>

        <AlertDialogFooter>
          <Button variant="outline" disabled={scheduling} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSchedule}
            onClick={() => candidate && onConfirm(candidate.scheduleTime)}
          >
            {scheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Schedule send
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ScheduleDialog;
