import { Building2, ExternalLink, Headset, Mail, MapPin } from "lucide-react";
import { CONTACT } from "@/lib/siteContact";
import { cn } from "@/lib/utils";

interface ContactInfoCardProps {
  /** Extra classes for the wrapping <section>. */
  className?: string;
  /** Hide the "Get in Touch" heading when the card is dropped inside a
   *  section that already has its own title. */
  showHeading?: boolean;
}

const items = [
  { ...CONTACT.customerCare, Icon: Headset, hint: "Tap to call" },
  { ...CONTACT.businessEnquiries, Icon: Building2, hint: "Tap to call" },
  { ...CONTACT.email, Icon: Mail, hint: "We reply within 24h" },
] as const;

/**
 * Reusable contact-information card: four channels laid out in a row on
 * desktop, a 2-up grid on tablet and stacked on mobile. Drop it anywhere
 * a page needs to surface how to reach A Plus Charge.
 */
const ContactInfoCard = ({ className, showHeading = true }: ContactInfoCardProps) => {
  const { office } = CONTACT;

  return (
    <section className={cn("py-12 md:py-16", className)} aria-labelledby="contact-info-heading">
      <div className="container mx-auto px-4">
        {showHeading && (
          <div className="text-center mb-8 md:mb-10">
            <span className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Get in Touch
            </span>
            <h2 id="contact-info-heading" className="text-3xl md:text-4xl font-bold mt-2">
              We're Here to Help
            </h2>
          </div>
        )}

        <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-sm shadow-elegant p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {items.map(({ label, display, href, hint, Icon }) => (
              <a
                key={label}
                href={href}
                className="group flex items-start gap-4 rounded-2xl p-3 -m-3 transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-cyan-500/15 text-primary transition-transform group-hover:scale-105">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{label}</span>
                  <span className="block text-base font-bold text-primary break-words">{display}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">{hint}</span>
                </span>
              </a>
            ))}

            {/* Office — an address isn't a link target, so it renders as
                plain content plus an optional directions link. */}
            <div className="flex items-start gap-4 p-3 -m-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-cyan-500/15 text-primary">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{office.label}</p>
                <p className="text-base font-bold text-primary break-words">{office.display}</p>
                {office.mapsUrl ? (
                  <a
                    href={office.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Get Directions
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">Mon – Sat, 9am – 6pm</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactInfoCard;
