const THROTTLE_MS = 60_000;

export const getThrottleKey = (formId: string) => `enq_last:${formId}`;

export const isThrottled = (formId: string): number => {
  try {
    const last = Number(localStorage.getItem(getThrottleKey(formId)) || 0);
    const remaining = THROTTLE_MS - (Date.now() - last);
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  } catch {
    return 0;
  }
};

export const markSubmission = (formId: string) => {
  try {
    localStorage.setItem(getThrottleKey(formId), String(Date.now()));
  } catch {
    // localStorage unavailable; throttle simply won't persist
  }
};

export const isHoneypotTripped = (value: FormDataEntryValue | null): boolean =>
  typeof value === 'string' && value.trim().length > 0;

export const HONEYPOT_FIELD = 'website_url';
