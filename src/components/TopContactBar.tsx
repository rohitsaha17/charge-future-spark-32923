import { Building2, Headset, Mail } from "lucide-react";
import { CONTACT, SOCIAL_LINKS } from "@/lib/siteContact";
import { cn } from "@/lib/utils";

const items = [
  { ...CONTACT.customerCare, Icon: Headset },
  { ...CONTACT.businessEnquiries, Icon: Building2 },
  { ...CONTACT.email, Icon: Mail },
] as const;

interface TopContactBarProps {
  /** Collapses the strip (e.g. once the page is scrolled) so the fixed
   *  nav doesn't permanently spend a row on it. */
  hidden?: boolean;
}

/**
 * Full-width gradient strip above the navigation bar carrying the
 * contact numbers, email and social links. Desktop only — on smaller
 * screens there isn't room for a single line, and the same details are
 * in <ContactInfoCard /> and the footer.
 */
const TopContactBar = ({ hidden = false }: TopContactBarProps) => (
  <div
    className={cn(
      "hidden lg:block overflow-hidden bg-gradient-to-r from-[#2674EC] to-[#00C6FF] text-white transition-[max-height,opacity] duration-200 ease-out",
      hidden ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
    )}
    aria-hidden={hidden}
  >
    <div className="container mx-auto flex h-9 items-center justify-between px-4 text-[13px]">
      <ul className="flex items-center gap-6">
        {items.map(({ label, display, href, Icon }) => (
          <li key={label}>
            <a
              href={href}
              tabIndex={hidden ? -1 : undefined}
              className="flex items-center gap-1.5 hover:opacity-85 transition-opacity"
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="text-white/85">{label}:</span>
              <span className="font-semibold">{display}</span>
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-3">
        <span className="text-white/85">Follow us:</span>
        {SOCIAL_LINKS.map(({ name, href, Icon }) => (
          <a
            key={name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            tabIndex={hidden ? -1 : undefined}
            className="hover:opacity-85 transition-opacity"
          >
            <Icon size={14} />
          </a>
        ))}
      </div>
    </div>
  </div>
);

export default TopContactBar;
