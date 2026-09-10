/**
 * ============================================================================
 * NEWSLETTER PROVIDER CONFIGURATION  —  paste the real embed details HERE
 * ============================================================================
 *
 * Nothing else in the app needs to change when the provider is ready.
 * <NewsletterCTA /> reads only from this file.
 *
 * Pick ONE of the two options below.
 *
 * ── Option A (preferred): keep the site's own styled form ────────────────────
 *   Set NEWSLETTER_FORM_ACTION to the provider's form `action` URL and, if
 *   the provider expects a field name other than "email", set
 *   NEWSLETTER_EMAIL_FIELD_NAME. Any extra hidden inputs the provider's
 *   snippet contains (list ids, tags, honeypots…) go in
 *   NEWSLETTER_HIDDEN_FIELDS.
 *
 *   Example (Mailchimp-style):
 *     export const NEWSLETTER_FORM_ACTION =
 *       "https://example.us1.list-manage.com/subscribe/post?u=XXXX&id=YYYY";
 *     export const NEWSLETTER_EMAIL_FIELD_NAME = "EMAIL";
 *     export const NEWSLETTER_HIDDEN_FIELDS = { "b_XXXX_YYYY": "" };
 *
 * ── Option B: drop in the provider's own markup ──────────────────────────────
 *   Paste the provider's raw HTML snippet into NEWSLETTER_EMBED_CODE. It is
 *   rendered inside the styled section in place of our form.
 *   NOTE: HTML injected this way cannot execute <script> tags. If the
 *   provider's snippet needs a script, add it to index.html instead and keep
 *   only the markup here.
 *
 * Until one of these is filled in, the form stays visible but honestly
 * reports that subscriptions aren't live yet — it never fakes a success.
 * ============================================================================
 */

/** Option A: provider form endpoint. `null` = not configured yet. */
export const NEWSLETTER_FORM_ACTION: string | null = null;

/** Name of the email input the provider expects. */
export const NEWSLETTER_EMAIL_FIELD_NAME = "email";

/** Extra hidden inputs required by the provider. */
export const NEWSLETTER_HIDDEN_FIELDS: Record<string, string> = {};

/** Option B: raw provider markup. `null` = not configured yet. */
export const NEWSLETTER_EMBED_CODE: string | null = null;

/** True once either option above has been filled in. */
export const isNewsletterConfigured = () =>
  Boolean(NEWSLETTER_FORM_ACTION) || Boolean(NEWSLETTER_EMBED_CODE);
