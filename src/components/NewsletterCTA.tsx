import { FormEvent, useId, useState } from "react";
import { Check, Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ApiError, newsletter } from "@/lib/api";
import { HONEYPOT_FIELD, isHoneypotTripped } from "@/lib/antiSpam";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface NewsletterCTAProps {
  className?: string;
  /** Which form the sign-up came from; stored with the subscriber. */
  source?: string;
}

/**
 * Site-wide newsletter call to action. Rendered once from <App /> so it
 * appears immediately above the footer on every public page.
 *
 * Sign-ups POST to the API's `/newsletter/subscribe`, which stores the address
 * and mirrors it into the configured list provider (see NEWSLETTER_PROVIDER in
 * the backend's .env.example). Going through our own API rather than posting
 * straight at the provider keeps the provider's API key off the client, lets
 * the list survive a change of provider, and means a provider outage doesn't
 * lose the sign-up.
 */
const NewsletterCTA = ({ className, source = "site-footer" }: NewsletterCTAProps) => {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.currentTarget;

    // A bot that fills every field gets the same confirmation a person does,
    // so it has no signal that the submission went nowhere.
    if (isHoneypotTripped(new FormData(form).get(HONEYPOT_FIELD))) {
      setIsDone(true);
      setEmail("");
      return;
    }

    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await newsletter.subscribe(value, source);
      setIsDone(true);
      setEmail("");
      toast.success(
        result.already_subscribed
          ? "You're already on the list"
          : "You're subscribed — thanks!",
        {
          description: result.already_subscribed
            ? "This address is already subscribed to our newsletter."
            : "We'll send updates on new stations and EV news.",
        }
      );
    } catch (err) {
      if (import.meta.env.DEV) console.error("Newsletter subscribe failed:", err);
      // A 429 carries an actionable message ("try again later"); anything else
      // is ours to apologise for.
      const message =
        err instanceof ApiError && (err.status === 429 || err.status === 400)
          ? err.message
          : "Couldn't sign you up just now. Please try again in a moment.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={cn("py-16 md:py-20", className)} aria-labelledby="newsletter-heading">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-gradient-to-br from-[#1a3a6e] via-[#2674EC] to-[#00C6FF] px-6 py-12 md:px-12 md:py-16 shadow-[0_20px_60px_-15px_rgba(38,116,236,0.4)]">
          {/* Decorative glows — mirrors the hero panel treatment. */}
          <div className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-2xl" />

          <div className="relative z-10 mx-auto max-w-2xl text-center text-white">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              Stay Updated
            </span>

            <h2 id="newsletter-heading" className="mt-5 text-3xl font-bold md:text-4xl lg:text-5xl">
              Join Our Newsletter
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm text-white/85 md:text-base">
              Get the latest updates on new charging stations, EV news, and exclusive announcements.
            </p>

            {isDone ? (
              <div
                className="mx-auto mt-8 flex w-full max-w-lg items-center justify-center gap-3 rounded-xl bg-white/15 px-5 py-4 backdrop-blur-sm"
                role="status"
              >
                <Check className="h-5 w-5 shrink-0" aria-hidden="true" />
                <p className="text-sm font-medium">
                  You're on the list. Watch your inbox for our next update.
                </p>
              </div>
            ) : (
              <form className="mx-auto mt-8 w-full max-w-lg" onSubmit={handleSubmit} noValidate>
                {/* Honeypot: off-screen and hidden from assistive tech, so only
                    a form-filling bot ever puts anything in it. */}
                <input
                  type="text"
                  name={HONEYPOT_FIELD}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute left-[-9999px] h-0 w-0 opacity-0"
                />

                <label htmlFor={inputId} className="sr-only">
                  Email address
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id={inputId}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    disabled={isSubmitting}
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className="h-12 w-full flex-1 rounded-xl border border-white/25 bg-white/95 px-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2674EC] disabled:opacity-70"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="h-12 shrink-0 rounded-xl bg-white px-8 text-primary hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2674EC]"
                  >
                    {isSubmitting ? (
                      <>
                        Subscribing
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        Subscribe
                        <Send className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </div>

                <p
                  id={errorId}
                  role="alert"
                  className={`mt-2 text-left text-sm text-white ${error ? "" : "sr-only"}`}
                >
                  {error}
                </p>

                <p className="mt-4 text-xs text-white/70">
                  We respect your privacy. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterCTA;
