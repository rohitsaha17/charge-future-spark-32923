/**
 * Parsing the test-send recipient box.
 *
 * Admins paste addresses from all sorts of places, so the separator is
 * whatever they happened to use. The cap matches the API's own limit of five,
 * enforced here too so the error arrives before the round trip.
 */

export const MAX_TEST_RECIPIENTS = 5;

/** Deliberately loose: the API validates properly, this only catches typos. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export interface ParsedRecipients {
  emails: string[];
  /** Entries that did not look like addresses, echoed back verbatim. */
  invalid: string[];
  /** Set when more than MAX_TEST_RECIPIENTS valid addresses were given. */
  error: string | null;
}

export const parseTestRecipients = (input: string): ParsedRecipients => {
  const seen = new Set<string>();
  const emails: string[] = [];
  const invalid: string[] = [];

  for (const raw of input.split(/[,;\n\r]+/)) {
    const entry = raw.trim();
    if (!entry) continue;

    if (!EMAIL.test(entry)) {
      invalid.push(entry);
      continue;
    }

    // Addresses are case-insensitive for routing, so "Me@x.com" and "me@x.com"
    // would otherwise burn two of the five slots on one inbox.
    const normalised = entry.toLowerCase();
    if (seen.has(normalised)) continue;
    seen.add(normalised);
    emails.push(normalised);
  }

  let error: string | null = null;
  if (invalid.length > 0) {
    error = `Not a valid address: ${invalid.join(', ')}`;
  } else if (emails.length > MAX_TEST_RECIPIENTS) {
    error = `Send a test to at most ${MAX_TEST_RECIPIENTS} addresses.`;
  }

  return { emails, invalid, error };
};
