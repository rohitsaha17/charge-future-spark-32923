// Single source of truth for default (fallback) site content.
// Used by:
//   - Public pages (About, Services, TestimonialsCarousel) as the fallback
//     when the Supabase tables are empty or unavailable.
//   - AdminContent CMS, which seeds these into the tables so the admin
//     can edit the same content that's currently live.
//
// Image paths here are Vite asset imports — they resolve to hashed
// /assets/foo-HASH.png URLs in production. That means we never seed
// `logo_url` / `image_url` with these paths (those would break on the
// next build); instead we seed only the text fields and leave image
// columns null. The site pages then fall back to these bundled assets
// if a row has no image uploaded yet.

import founderPortrait from "@/assets/team/founder-samyak-new.jpg";
import ctoPortrait from "@/assets/team/cto-portrait.jpg";
import operationsPortrait from "@/assets/team/operations-portrait.jpg";
import bdPortrait from "@/assets/team/bd-portrait.jpg";
import techPortrait from "@/assets/team/tech-portrait.jpg";
import customerPortrait from "@/assets/team/customer-portrait.jpg";
import atherLogo from "@/assets/partners/ather-logo-new.png";
import tataLogo from "@/assets/partners/tata-logo-new.png";
import mgLogo from "@/assets/partners/mg-logo-new.png";
import gmdaLogo from "@/assets/partners/gmda-logo-new.png";
import aaiLogo from "@/assets/partners/aai-logo.png";
import imperiaVistaLogo from "@/assets/partners/imperia-vista-logo.png";
import osmLogo from "@/assets/partners/osm-logo.png";

import l1PlugPoint from "@/assets/chargers/l1-plug-point.jpg";
import l2AcCharger from "@/assets/chargers/l2-ac-charger.jpg";
import ac7kwCharger from "@/assets/chargers/ac-7kw-charger.png";
import dcFastCharger from "@/assets/chargers/dc-fast-charger.jpg";
import dc60kwCharger from "@/assets/chargers/dc-60kw-charger.png";

export type PartnerType = 'client' | 'partner' | 'both';

export interface DefaultPartner {
  name: string;
  fallbackImage: string; // bundled asset path, used when logo_url is null
  website_url: string | null;
  type: PartnerType;
}

export interface DefaultMilestone {
  year: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface DefaultStat {
  value: number;
  label: string;
  suffix: string;
}

export interface DefaultFAQ {
  question: string;
  answer: string;
}

export interface DefaultTeamMember {
  name: string;
  role: string;
  fallbackImage: string;
  bio: string;
  highlight: string;
  linkedin_url: string | null;
  youtube_url: string | null;
}

export interface DefaultTestimonial {
  name: string;
  role: string;
  location: string;
  fallbackImage: string;
  rating: number;
  review: string;
}

export interface DefaultService {
  slug: string;
  name: string;
  charger_type: "AC" | "DC";
  power: string;
  price: string;
  warranty: string;
  description: string;
  features: string[];
  ideal_for: string;
  fallbackImage: string;
}

export const DEFAULT_STATS: DefaultStat[] = [
  { value: 45, label: "Live Public Stations", suffix: "+" },
  { value: 100, label: "Locations by 2026", suffix: "+" },
  { value: 97, label: "Average Uptime", suffix: "%" },
  { value: 9, label: "States Covered", suffix: "" },
];

export const DEFAULT_PARTNERS: DefaultPartner[] = [
  { name: "Ather Energy", fallbackImage: atherLogo, website_url: null, type: "partner" },
  { name: "Tata Motors", fallbackImage: tataLogo, website_url: null, type: "partner" },
  { name: "MG Motors", fallbackImage: mgLogo, website_url: null, type: "partner" },
  { name: "GMDA", fallbackImage: gmdaLogo, website_url: null, type: "client" },
  { name: "Airports Authority of India", fallbackImage: aaiLogo, website_url: null, type: "client" },
  { name: "Imperia Vista", fallbackImage: imperiaVistaLogo, website_url: null, type: "client" },
  { name: "Omega Seiki Mobility", fallbackImage: osmLogo, website_url: null, type: "partner" },
];

export const DEFAULT_MILESTONES: DefaultMilestone[] = [
  { year: "2023", title: "Company Founded", description: "AlternatEV Solutions (A Plus Charge) established in Guwahati, Assam", icon: "Building2", color: "from-blue-500 to-cyan-500" },
  { year: "2023", title: "First Pilot Installation", description: "Successful deployment of our first EV charging station", icon: "Zap", color: "from-green-500 to-emerald-500" },
  { year: "2023", title: "DPIIT Recognition", description: "Received official startup recognition from Department for Promotion of Industry", icon: "FileCheck", color: "from-purple-500 to-pink-500" },
  { year: "2024", title: "1st 30 kW DC Fast Charger", description: "Deployed on Guwahati–Kaziranga Route, unlocking long-distance EV travel", icon: "Battery", color: "from-yellow-500 to-amber-500" },
  { year: "2024", title: "Partnership with ChargeMOD", description: "Strategic collaboration to enhance charging network capabilities", icon: "Handshake", color: "from-orange-500 to-red-500" },
  { year: "2024", title: "Onboarded Lubi EV as Hardware Partner", description: "Strengthened hardware supply chain with quality equipment partnership", icon: "Building2", color: "from-blue-600 to-indigo-600" },
  { year: "2024", title: "Crossed 20 Live EV Charging Stations", description: "Milestone achievement across Northeast India's charging infrastructure", icon: "Trophy", color: "from-rose-500 to-pink-600" },
  { year: "2025", title: "Strategic Collaboration with AAI", description: "Exclusive partnership with Airport Authority of India for airport charging", icon: "Plane", color: "from-teal-500 to-cyan-500" },
  { year: "2025", title: "2nd DC Fast Charger at GMDA Parking", description: "Premium public site secured in Guwahati's high-traffic facility", icon: "ParkingCircle", color: "from-indigo-500 to-purple-500" },
  { year: "2025", title: "Expanded to West Bengal & Tripura", description: "Geographic expansion into new Eastern India markets", icon: "MapPin", color: "from-emerald-500 to-green-600" },
  { year: "2025", title: "Partnerships with Tata SCV & MG India", description: "OEM partnerships for charger visibility on vehicle dashboards", icon: "Car", color: "from-amber-500 to-yellow-600" },
  { year: "2025", title: "Strategic Partnership with Ather Energy", description: "Formalized alliance with leading EV manufacturer", icon: "Handshake", color: "from-cyan-500 to-blue-600" },
  { year: "2025", title: "Launched NE.EV Initiative", description: "Dedicated program for DC Charger deployment across Northeast", icon: "Rocket", color: "from-violet-500 to-purple-600" },
  { year: "2025", title: "Crossed 40 Chargers Milestone", description: "Doubled our network with 40+ live charging stations", icon: "Trophy", color: "from-pink-500 to-rose-600" },
  { year: "2025", title: "40 Additional DC Sites Identified", description: "Strategic expansion pipeline for next phase of growth", icon: "Target", color: "from-blue-500 to-primary" },
];

export const DEFAULT_FAQS: DefaultFAQ[] = [
  {
    question: "What makes A Plus Charge different?",
    answer:
      "We're the best CPO from North East India built specifically for Northeast India's unique terrain, weather, and power grid challenges. Our systems are optimized for monsoons, hill stations, and local language support.",
  },
  {
    question: "How reliable are your charging stations?",
    answer:
      "We maintain a 98%+ uptime rate with 24/7 monitoring and rapid response teams. Our stations are engineered to handle extreme weather conditions typical of Northeast India.",
  },
  {
    question: "Which EV brands do you support?",
    answer:
      "We support all major EV brands including Tata, MG, Ather, and more. Our stations feature both CCS2 and Type 2 connectors for maximum compatibility.",
  },
  {
    question: "How can I invest in A Plus Charge?",
    answer:
      "We offer site-host partnerships and investment opportunities. Visit our Invest page or contact our team to learn about ROI projections and partnership models.",
  },
];

export const DEFAULT_TEAM: DefaultTeamMember[] = [
  {
    name: "Samyak Jain (EV Boy)",
    role: "Founder & CEO",
    fallbackImage: founderPortrait,
    bio: "Known as EV Boy for his passion and advocacy in clean mobility, Samyak Jain leads A Plus Charge - Northeast India's fastest-growing EV charging network. With over a decade of experience in renewable energy and infrastructure, he combines technical expertise with local insight to power India's electric future.",
    highlight: "PG in Entrepreneurship, Amity University | 10+ years in clean energy",
    linkedin_url: "https://in.linkedin.com/in/samyak-jain-alternatev",
    youtube_url: "https://www.youtube.com/@evboy_samyak",
  },
  {
    name: "Priya Sharma",
    role: "Chief Technology Officer",
    fallbackImage: ctoPortrait,
    bio: "Led the development of our proprietary charging management system. Priya's algorithms optimize for Northeast's unique power grid challenges and monsoon conditions.",
    highlight: "Former Tesla engineer, IoT specialist",
    linkedin_url: null,
    youtube_url: null,
  },
  {
    name: "Ankit Deka",
    role: "Head of Operations",
    fallbackImage: operationsPortrait,
    bio: "Grew up in rural Assam, understands terrain challenges firsthand. Ankit ensures our chargers work flawlessly from Shillong's hills to Tezpur's valleys.",
    highlight: "Deployed 50+ charging stations across 7 states",
    linkedin_url: null,
    youtube_url: null,
  },
  {
    name: "Meghna Bora",
    role: "Business Development Lead",
    fallbackImage: bdPortrait,
    bio: "Built partnerships with OEMs, site hosts, and government bodies. Meghna's local connections and negotiation skills opened doors across Northeast India.",
    highlight: "Secured GMDA partnership, Ather alliance",
    linkedin_url: null,
    youtube_url: null,
  },
  {
    name: "Rahul Choudhury",
    role: "Lead Engineer",
    fallbackImage: techPortrait,
    bio: "Designs charging infrastructure that withstands extreme weather. Rahul's innovations in waterproofing and voltage stability set industry standards.",
    highlight: "15 patents in EV charging technology",
    linkedin_url: null,
    youtube_url: null,
  },
  {
    name: "Sneha Das",
    role: "Customer Success Manager",
    fallbackImage: customerPortrait,
    bio: "Speaks 5 regional languages, runs our 24/7 support. Sneha ensures every EV driver feels supported, from first-time users to fleet operators.",
    highlight: "99.2% customer satisfaction rating",
    linkedin_url: null,
    youtube_url: null,
  },
];

export const DEFAULT_TESTIMONIALS: DefaultTestimonial[] = [
  {
    name: "Rajesh Kumar",
    role: "Mahindra XEV 9e Owner",
    location: "Guwahati, Assam",
    fallbackImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
    rating: 5,
    review:
      "A Plus Charge has transformed my daily commute. Their charging stations are reliable, fast, and always available when I need them. The best EV charging network in Northeast India!",
  },
  {
    name: "Priya Sharma",
    role: "Tata Nexon EV Owner",
    location: "Shillong, Meghalaya",
    fallbackImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    rating: 5,
    review:
      "The convenience of having multiple charging points across the city is incredible. The app is user-friendly and the charging speed is impressive. Highly recommend A Plus Charge!",
  },
  {
    name: "Amit Borthakur",
    role: "MG ZS EV Owner",
    location: "Dibrugarh, Assam",
    fallbackImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
    rating: 5,
    review:
      "As a partner, I've seen tremendous ROI. The support team is excellent and the technology is top-notch. A Plus Charge is leading the EV revolution in our region.",
  },
  {
    name: "Sneha Devi",
    role: "Ather 450X Owner",
    location: "Imphal, Manipur",
    fallbackImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha",
    rating: 5,
    review:
      "Fast charging, clean stations, and amazing customer service. I can fully charge my scooter in under an hour. A Plus Charge makes EV ownership stress-free!",
  },
  {
    name: "Rahul Das",
    role: "Hyundai Kona Owner",
    location: "Silchar, Assam",
    fallbackImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    rating: 5,
    review:
      "The expansion across Northeast India is impressive. I recently took a road trip and found A Plus Charge stations at every major stop. True game-changer for EV adoption.",
  },
];

export const DEFAULT_SERVICES: DefaultService[] = [
  {
    slug: "l1-3.3kw",
    name: "L1 - 3.3 kW Plug Point",
    charger_type: "AC",
    power: "3.3 kW",
    price: "₹15,000",
    warranty: "1-year warranty included",
    description: "Perfect for home charging with overnight convenience",
    features: ["Smart charging", "Mobile app control", "Energy monitoring", "Safe and reliable"],
    ideal_for: "Residential, Apartments",
    fallbackImage: l1PlugPoint,
  },
  {
    slug: "l2-7.4kw",
    name: "L2 - 7.4 kW AC Charger",
    charger_type: "AC",
    power: "7.4 kW",
    price: "₹60,000",
    warranty: "1 yr. warranty & 2 yr. AMC included",
    description: "Ideal for workplaces and commercial spaces",
    features: ["RFID enabled", "Payment integration", "Real-time monitoring", "High utilization"],
    ideal_for: "Offices, Hotels, Malls",
    fallbackImage: ac7kwCharger,
  },
  {
    slug: "l2-9.9kw",
    name: "L2 - 9.9 kW (3 Plug Points)",
    charger_type: "AC",
    power: "9.9 kW",
    price: "₹55,000",
    warranty: "1 yr. warranty & 2 yr. AMC included",
    description: "Multi-point charging for high traffic areas",
    features: ["3 plug points", "Universal compatibility", "LED indicators", "Remote diagnostics"],
    ideal_for: "Parking Lots, Institutions",
    fallbackImage: l2AcCharger,
  },
  {
    slug: "l3-30kw-dc",
    name: "L3 - 30 kW DC Fast Charger",
    charger_type: "DC",
    power: "30 kW",
    price: "₹5,49,800",
    warranty: "1 yr. warranty & 2 yr. AMC included",
    description: "Rapid charging for highway and public locations",
    features: ["Fast charging", "CCS2/CHAdeMO", "24/7 operation", "RFID enabled"],
    ideal_for: "Highways, Fuel Stations",
    fallbackImage: dcFastCharger,
  },
  {
    slug: "l3-60kw-dc",
    name: "L3 - 60 kW DC Fast Charger",
    charger_type: "DC",
    power: "60 kW",
    price: "₹7,97,500",
    warranty: "1 yr. warranty & 2 yr. AMC included",
    description: "Ultra-fast charging for high-traffic areas",
    features: ["Ultra-fast charging", "Multiple vehicles", "Premium locations", "Maximum revenue"],
    ideal_for: "Highway Hubs, Commercial Centers",
    fallbackImage: dc60kwCharger,
  },
];

/** Map partner name → bundled fallback image, so the frontend can display
 *  the correct logo when a partner row exists in the DB but has no uploaded
 *  logo_url yet. */
export const PARTNER_FALLBACKS: Record<string, string> = Object.fromEntries(
  DEFAULT_PARTNERS.map((p) => [p.name, p.fallbackImage])
);

export const TEAM_FALLBACKS: Record<string, string> = Object.fromEntries(
  DEFAULT_TEAM.map((t) => [t.name, t.fallbackImage])
);

export const SERVICE_FALLBACKS: Record<string, string> = Object.fromEntries(
  DEFAULT_SERVICES.map((s) => [s.slug, s.fallbackImage])
);

/** Rows shaped for direct insert into Supabase tables. Image columns are
 *  left null; admin can upload replacements through the CMS. */
export const SEED_ROWS = {
  partners: DEFAULT_PARTNERS.map((p, i) => ({
    name: p.name,
    logo_url: null as string | null,
    website_url: p.website_url,
    type: p.type,
    sort_order: (i + 1) * 10,
    visible: true,
  })),
  statistics: DEFAULT_STATS.map((s, i) => ({
    label: s.label,
    value: String(s.value),
    suffix: s.suffix || null,
    icon: null as string | null,
    sort_order: (i + 1) * 10,
    visible: true,
  })),
  testimonials: DEFAULT_TESTIMONIALS.map((t, i) => ({
    name: t.name,
    role: t.role,
    location: t.location,
    image_url: null as string | null,
    rating: t.rating,
    review: t.review,
    sort_order: (i + 1) * 10,
    visible: true,
  })),
  team_members: DEFAULT_TEAM.map((t, i) => ({
    name: t.name,
    role: t.role,
    image_url: null as string | null,
    bio: t.bio,
    highlight: t.highlight,
    linkedin_url: t.linkedin_url,
    youtube_url: t.youtube_url,
    sort_order: (i + 1) * 10,
    visible: true,
  })),
  faqs: DEFAULT_FAQS.map((f, i) => ({
    question: f.question,
    answer: f.answer,
    category: null as string | null,
    sort_order: (i + 1) * 10,
    visible: true,
  })),
  journey_milestones: DEFAULT_MILESTONES.map((m, i) => ({
    year: m.year,
    title: m.title,
    description: m.description,
    icon: m.icon,
    color: m.color,
    sort_order: (i + 1) * 10,
    visible: true,
  })),
  services_catalog: DEFAULT_SERVICES.map((s, i) => ({
    slug: s.slug,
    name: s.name,
    charger_type: s.charger_type,
    power: s.power,
    price: s.price,
    warranty: s.warranty,
    description: s.description,
    features: s.features,
    ideal_for: s.ideal_for,
    image_url: null as string | null,
    sort_order: (i + 1) * 10,
    visible: true,
  })),
} as const;
