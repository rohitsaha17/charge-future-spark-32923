/**
 * Quarter-hour, UTC scheduling arithmetic.
 *
 * Mailchimp accepts a send time only on `:00`, `:15`, `:30` or `:45` **UTC**,
 * and the API rejects anything else rather than rounding. The admin, however,
 * picks a time in their own timezone from a `datetime-local` input — which
 * yields a string with no offset at all.
 *
 * That conversion is where this feature will break if it breaks: a newsletter
 * arriving at the wrong hour is expensive to explain and impossible to recall.
 * So the whole of it lives here, in pure functions, with tests.
 */

/** Minutes between valid slots. */
const SLOT = 15;
const SLOT_MS = SLOT * 60_000;

/** Mailchimp will not accept a time this close to now. */
export const MIN_LEAD_MINUTES = 5;

/**
 * The next valid slot at or after `from`.
 *
 * Rounds *up*, never down, so snapping can never move a send earlier than the
 * admin asked for — including when `from` carries seconds, which is the case
 * that makes the obvious "zero the seconds, then round the minutes" version
 * wrong: 09:30:45 would become 09:30:00, which is in the past relative to the
 * requested instant.
 *
 * Ceiling the epoch timestamp avoids that and needs no rollover handling. It
 * lands exactly on UTC quarter hours because the epoch itself starts on one
 * and JavaScript time has no leap seconds.
 */
export const snapToQuarterHourUtc = (from: Date): Date =>
  new Date(Math.ceil(from.getTime() / SLOT_MS) * SLOT_MS);

export const isQuarterHourUtc = (date: Date): boolean =>
  date.getUTCMinutes() % SLOT === 0 && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0;

/**
 * Turns a `<input type="datetime-local">` value into a Date.
 *
 * The browser gives `2026-10-01T16:00` with no zone, and `new Date()` reads
 * that as local time — which is what we want here, because the admin typed a
 * local time. Returns null for an unparseable value rather than an Invalid
 * Date, so callers cannot accidentally pass NaN onwards.
 */
export const parseLocalInput = (value: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/** Too soon for Mailchimp to accept, with a little room for the round trip. */
export const isTooSoon = (date: Date, now: Date = new Date()): boolean =>
  date.getTime() <= now.getTime() + MIN_LEAD_MINUTES * 60_000;

export interface ScheduleCandidate {
  /** What will be sent to the API: ISO 8601 with an explicit UTC offset. */
  scheduleTime: string;
  /** The instant itself, for formatting. */
  date: Date;
  /** True when snapping moved the time the admin actually typed. */
  adjusted: boolean;
  /** Set when the time cannot be used at all. */
  error: string | null;
}

/**
 * Everything the schedule dialog needs from a raw input value.
 *
 * Snaps first and validates the *snapped* time, because snapping can push a
 * borderline time far enough out to become valid — rejecting before snapping
 * would refuse times that are actually fine.
 */
export const buildScheduleCandidate = (
  localValue: string,
  now: Date = new Date()
): ScheduleCandidate | null => {
  const typed = parseLocalInput(localValue);
  if (!typed) return null;

  const snapped = snapToQuarterHourUtc(typed);
  const adjusted = snapped.getTime() !== typed.getTime();

  return {
    scheduleTime: toScheduleTime(snapped),
    date: snapped,
    adjusted,
    error: isTooSoon(snapped, now)
      ? `Pick a time at least ${MIN_LEAD_MINUTES} minutes from now.`
      : null,
  };
};

/**
 * ISO 8601 with an explicit `+00:00` rather than `Z`.
 *
 * Both are valid and mean the same thing; the backend's validator accepts
 * either, but it requires *some* offset — a bare local timestamp would be read
 * as server-local, which differs between a laptop and the deployed API.
 */
export const toScheduleTime = (date: Date): string =>
  date.toISOString().replace(/\.\d{3}Z$/, '+00:00');

/**
 * The value a `datetime-local` input wants: local time, no offset, no seconds.
 * `toISOString` cannot be used — it would shift the clock by the UTC offset.
 */
export const toLocalInputValue = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};

/**
 * A sensible starting value: an hour out, snapped forward. Far enough that the
 * admin is unlikely to accept it by reflex, close enough to be plausible.
 */
export const defaultScheduleValue = (now: Date = new Date()): string =>
  toLocalInputValue(snapToQuarterHourUtc(new Date(now.getTime() + 60 * 60_000)));
