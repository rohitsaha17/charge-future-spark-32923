import { FormEvent, useId, useState } from "react";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  NEWSLETTER_EMAIL_FIELD_NAME,
  NEWSLETTER_EMBED_CODE,
  NEWSLETTER_FORM_ACTION,
  NEWSLETTER_HIDDEN_FIELDS,
} from "@/lib/newsletterConfig";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface NewsletterCTAProps {
  className?: string;
}

/**
 * Site-wide newsletter call to action. Rendered once from <App /> so it
 * appears immediately above the footer on every public page.
 *
 * The provider endpoint lives in `@/lib/newsletterConfig` — see that file
 * for where to paste the real embed code. Until it's filled in the form
 * validates and responds honestly instead of faking a subscription.
 */
const NewsletterCTA = ({ className }: NewsletterCTAProps) => {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    const value = email.trim();

    if (!EMAIL_RE.test(value)) {
      e.preventDefault();
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);

    // With a real provider endpoint configured, let the browser post the
    // form straight to it — no fetch/CORS dance needed.
    if (NEWSLETTER_FORM_ACTION) return;

    e.preventDefault();
    toast.info("Newsletter sign-ups aren't live yet", {
      description: "We're finishing the setup — please check back shortly.",
    });
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

            {NEWSLETTER_EMBED_CODE ? (
              /* Provider markup pasted into newsletterConfig.ts. */
              <div
                className="newsletter-embed mt-8 text-left"
                dangerouslySetInnerHTML={{ __html: NEWSLETTER_EMBED_CODE }}
              />
            ) : (
              <form
                className="mx-auto mt-8 w-full max-w-lg"
                onSubmit={handleSubmit}
                action={NEWSLETTER_FORM_ACTION ?? undefined}
                method={NEWSLETTER_FORM_ACTION ? "post" : undefined}
                target={NEWSLETTER_FORM_ACTION ? "_blank" : undefined}
                noValidate
              >
                {Object.entries(NEWSLETTER_HIDDEN_FIELDS).map(([name, value]) => (
                  <input key={name} type="hidden" name={name} defaultValue={value} />
                ))}

                <label htmlFor={inputId} className="sr-only">
                  Email address
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    id={inputId}
                    name={NEWSLETTER_EMAIL_FIELD_NAME}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className="h-12 w-full flex-1 rounded-xl border border-white/25 bg-white/95 px-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2674EC]"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 shrink-0 rounded-xl bg-white px-8 text-primary hover:bg-white/90 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2674EC]"
                  >
                    Subscribe
                    <Send className="h-4 w-4" aria-hidden="true" />
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
