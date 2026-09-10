/**
 * Single source of truth for the public contact details and social
 * profiles shown around the site (top contact bar, contact info card,
 * footer). Update a number/handle here and every surface follows.
 */
import type { ComponentType } from "react";
import { Facebook, Linkedin, Twitter, Youtube } from "lucide-react";
import InstagramIcon from "@/components/icons/InstagramIcon";

export interface SocialLink {
  name: string;
  href: string;
  // Matches lucide-react's icon props, which type `size` as number | string.
  Icon: ComponentType<{ size?: number | string; className?: string }>;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { name: "Instagram", href: "https://www.instagram.com/apluscharge", Icon: InstagramIcon },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/apluscharge", Icon: Linkedin },
  { name: "YouTube", href: "https://www.youtube.com/@evboy_samyak", Icon: Youtube },
  { name: "X (Twitter)", href: "https://x.com/apluscharge", Icon: Twitter },
  { name: "Facebook", href: "https://www.facebook.com/apluscharge", Icon: Facebook },
];

export const CONTACT = {
  customerCare: { label: "Customer Care", display: "7099018180", href: "tel:+917099018180" },
  businessEnquiries: { label: "Business Enquiries", display: "7099018181", href: "tel:+917099018181" },
  email: { label: "Email Us", display: "sales@apluscharge.com", href: "mailto:sales@apluscharge.com" },
  office: {
    label: "Our Office",
    display: "Guwahati, Assam, India",
    /**
     * CONFIG: set this to the company's real Google Maps / directions URL
     * to make a "Get Directions" link appear on <ContactInfoCard />.
     * Left null on purpose — we don't have a verified office pin yet, and
     * a guessed map link would send people to the wrong place.
     */
    mapsUrl: null as string | null,
  },
} as const;
