import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Loader2, TestTube } from 'lucide-react';
import { MAX_TEST_RECIPIENTS, parseTestRecipients } from '@/lib/campaignEmails';
import type { TestSendRecord } from '@/lib/campaignGuards';

interface Props {
  disabled: boolean;
  sending: boolean;
  lastTest: TestSendRecord | null;
  /** True when the content changed since `lastTest` was recorded. */
  stale: boolean;
  onSend: (emails: string[]) => void;
}

/**
 * Sending a test is a precondition of sending for real, so this sits directly
 * above the send controls rather than being tucked away — and it reports
 * clearly when the content has moved on since the last one, because that is
 * the case where an admin believes they have checked something they haven't.
 */
const TestSendCard = ({ disabled, sending, lastTest, stale, onSend }: Props) => {
  const [value, setValue] = useState('');
  const parsed = parseTestRecipients(value);
  const canSend = parsed.emails.length > 0 && !parsed.error && !sending && !disabled;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TestTube className="h-4 w-4" />
          Send a test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="test-emails">
            Up to {MAX_TEST_RECIPIENTS} addresses, separated by commas or new lines
          </Label>
          <Textarea
            id="test-emails"
            rows={2}
            placeholder="you@example.com"
            value={value}
            disabled={disabled || sending}
            onChange={(e) => setValue(e.target.value)}
          />
          {parsed.error && <p className="text-xs text-destructive">{parsed.error}</p>}
        </div>

        <Button
          variant="outline"
          className="w-full"
          disabled={!canSend}
          onClick={() => onSend(parsed.emails)}
        >
          {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {sending
            ? 'Sending test…'
            : `Send test${parsed.emails.length > 1 ? ` to ${parsed.emails.length}` : ''}`}
        </Button>

        {lastTest && !stale && (
          <p className="flex items-start gap-1.5 text-xs text-green-700">
            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
            <span>
              Tested {new Date(lastTest.at).toLocaleString()} — {lastTest.emails.join(', ')}
            </span>
          </p>
        )}
        {lastTest && stale && (
          <p className="text-xs text-amber-700">
            The content has changed since your last test. Send another before sending for real.
          </p>
        )}
        {!lastTest && (
          <p className="text-xs text-muted-foreground">
            Open the test in Gmail and Outlook if you can — a browser preview will not catch
            everything.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TestSendCard;
