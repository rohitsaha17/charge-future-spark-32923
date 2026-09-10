import type { CSSProperties } from "react";
import { Building2, Mail, Phone } from "lucide-react";
import { CONTACT } from "@/lib/siteContact";
import { cn } from "@/lib/utils";

const items = [
  { ...CONTACT.customerCare, Icon: Phone, showLabel: true },
  { ...CONTACT.businessEnquiries, Icon: Building2, showLabel: true },
  // The address reads as its own label, so the caption line is dropped
  // visually and kept for screen readers.
  { ...CONTACT.email, Icon: Mail, showLabel: false },
] as const;

/**
 * Compact contact card that sits in the page flow directly under the
 * hero's "Find a Charger" call to action. It carries the numbers that
 * used to live in the strip above the navigation bar, so they're on the
 * first screen without permanently occupying a row of chrome.
 *
 * The full-width <ContactInfoCard /> near the footer remains the
 * detailed version; this one is deliberately terse.
 */
interface HeroContactCardProps {
  className?: string;
  /** Lets the hero pass its shared slideUp entrance animation. */
  style?: CSSProperties;
}

const HeroContactCard = ({ className, style }: HeroContactCardProps) => (
  <div
    className={cn(
      // Sized to its contents on desktop so the three columns keep the
      // natural widths of the numbers/address rather than being forced
      // into equal thirds; full width when stacked on mobile.
      "w-full sm:w-fit mx-auto md:mx-0 rounded-2xl bg-white/85 backdrop-blur-sm px-2 py-5 shadow-[0_8px_30px_rgba(38,116,236,0.10)]",
      className
    )}
    style={style}
  >
    <div className="flex flex-col divide-y divide-border/70 sm:flex-row sm:items-stretch sm:divide-x sm:divide-y-0">
      {items.map(({ label, display, href, Icon, showLabel }) => (
        <a
          key={label}
          href={href}
          aria-label={`${label}: ${display}`}
          className="group flex flex-col items-center gap-2.5 rounded-xl px-6 py-3 text-center transition-colors hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:py-1"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-105">
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          {/* flex-1 + centring keeps the label-less email vertically
              centred against the two-line columns beside it. */}
          <span className="flex flex-1 flex-col justify-center">
            <span className={cn("block text-sm leading-snug text-foreground/80", !showLabel && "sr-only")}>
              {label}
            </span>
            <span className="block whitespace-nowrap text-[15px] font-bold leading-snug text-primary sm:text-base">
              {display}
            </span>
          </span>
        </a>
      ))}
    </div>
  </div>
);

export default HeroContactCard;
