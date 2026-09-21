import { Mail } from 'lucide-react';
import { sanitizeBlogHtml } from '@/lib/sanitize';

interface Props {
  html: string;
  subject: string | null;
  previewText: string | null;
  fromName: string | null;
  replyTo: string | null;
}

/**
 * An inbox-shaped preview: the from/subject/preview-text header an email
 * client shows, above the body in a 600px column.
 *
 * Deliberately not `RichTextEditor`'s own Preview mode, which wraps content in
 * blog-article chrome — a byline, article spacing, the site's prose styles.
 * For a newsletter that would be actively misleading, showing the admin
 * something no recipient will ever see.
 *
 * It is still only an approximation: the API converts this HTML to
 * table-and-inline-style markup before handing it to Mailchimp, and Outlook
 * has opinions no browser preview can reproduce. The test send is what
 * actually proves the layout, which is why sending one is a precondition of
 * sending at all.
 */
const CampaignPreview = ({ html, subject, previewText, fromName, replyTo }: Props) => (
  <div className="rounded-lg border bg-muted/30 p-4">
    <div className="mx-auto max-w-[600px]">
      <div className="rounded-t-lg border border-b-0 bg-background p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {fromName?.trim() || 'Sender name not set'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {replyTo?.trim() || 'reply-to not set'}
            </p>
            <p className="mt-2 truncate font-medium">
              {subject?.trim() || <span className="text-muted-foreground">No subject line</span>}
            </p>
            {previewText?.trim() && (
              <p className="truncate text-sm text-muted-foreground">{previewText}</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-b-lg border bg-white p-6">
        {html.trim() ? (
          <div
            className="prose prose-sm max-w-none"
            // Same sanitiser the blog renderer uses. The content originates in
            // this admin panel, but it makes a round trip through the API and
            // is rendered back into this page, so it is treated as untrusted.
            dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(html) }}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing to preview yet — write something in the editor.
          </p>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Mailchimp adds the unsubscribe link and your postal address below this.
      </p>
    </div>
  </div>
);

export default CampaignPreview;
