import { useEffect } from "react";

const SITE_NAME = "A Plus Charge";
// Primary host used when generating absolute URLs from SSR / non-browser
// contexts (image fallback, JSON-LD). At runtime we read the actual
// origin so canonical/hreflang track whatever host is serving the page —
// see the inline canonical-rewriter script in index.html for the same
// logic. Hard-coding a single host caused a canonical loop because
// apluscharge.in 302-redirects to www.apluscharge.com and the audit
// crawler would chase the canonical pointer back into the redirect.
const PRIMARY_SITE_URL = "https://www.apluscharge.com";
const DEFAULT_OG_IMAGE = `${PRIMARY_SITE_URL}/og-image.png`;

const resolveSiteUrl = (): string => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return PRIMARY_SITE_URL;
};

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  ogImage?: string;
  keywords?: string;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  jsonLd?: Record<string, unknown>;
  /**
   * Optional breadcrumb trail. Emits a BreadcrumbList JSON-LD block in
   * addition to whatever main jsonLd is set. Helps Google show
   * breadcrumb chips under the main result and is a documented input
   * for branded sitelinks eligibility.
   * Pass items in order, root → leaf, e.g.
   *   [{ name: "Home", path: "/" }, { name: "About", path: "/about" }]
   */
  breadcrumbs?: Array<{ name: string; path: string }>;
}

const SEOHead = ({
  title,
  description,
  path,
  ogType = "website",
  ogImage,
  keywords,
  article,
  jsonLd,
  breadcrumbs,
}: SEOHeadProps) => {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  // Match the trailing-slash policy of the inline canonical script in
  // index.html: root is "/", every other path is slash-less. Mismatches
  // show up as duplicate-canonical / mixed-URL warnings in SEO audits.
  const normalizedPath = path === "/" ? "/" : path.replace(/\/+$/, "");
  const siteUrl = resolveSiteUrl();
  const canonicalUrl = `${siteUrl}${normalizedPath}`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Helper to set/create meta tags
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Standard meta
    setMeta("name", "description", description);
    if (keywords) setMeta("name", "keywords", keywords);

    // Open Graph
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:image", image);
    setMeta("property", "og:site_name", SITE_NAME);

    // Twitter
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", image);
    setMeta("name", "twitter:card", "summary_large_image");

    // Article metadata
    if (article) {
      if (article.publishedTime) setMeta("property", "article:published_time", article.publishedTime);
      if (article.modifiedTime) setMeta("property", "article:modified_time", article.modifiedTime);
      if (article.author) setMeta("property", "article:author", article.author);
      article.tags?.forEach((tag, i) => setMeta("property", `article:tag:${i}`, tag));
    }

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    // Hreflang self-referencing tags
    const setHreflang = (hreflang: string, href: string) => {
      let el = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`) as HTMLLinkElement;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", "alternate");
        el.setAttribute("hreflang", hreflang);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };
    setHreflang("en", canonicalUrl);
    // BCP-47 expects the region in uppercase ("en-IN"). The case has to
    // exactly match the static <link> in index.html, otherwise the
    // querySelector misses and we end up emitting a duplicate tag.
    setHreflang("en-IN", canonicalUrl);
    setHreflang("x-default", canonicalUrl);

    // JSON-LD
    const existingLd = document.getElementById("seo-jsonld");
    if (existingLd) existingLd.remove();

    const ldData = jsonLd || {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: fullTitle,
      description,
      url: canonicalUrl,
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/og-image.png`,
        },
      },
    };

    const script = document.createElement("script");
    script.id = "seo-jsonld";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(ldData);
    document.head.appendChild(script);

    // BreadcrumbList JSON-LD (separate <script> so it stacks with the
    // page's main JSON-LD instead of overwriting it). Eligible breadcrumb
    // markup is one of Google's documented inputs for branded sitelinks.
    const existingBc = document.getElementById("seo-breadcrumbs-jsonld");
    if (existingBc) existingBc.remove();
    if (breadcrumbs && breadcrumbs.length > 0) {
      const bcScript = document.createElement("script");
      bcScript.id = "seo-breadcrumbs-jsonld";
      bcScript.type = "application/ld+json";
      bcScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: `${siteUrl}${b.path === "/" ? "/" : b.path.replace(/\/+$/, "")}`,
        })),
      });
      document.head.appendChild(bcScript);
    }

    return () => {
      const el = document.getElementById("seo-jsonld");
      if (el) el.remove();
      const bc = document.getElementById("seo-breadcrumbs-jsonld");
      if (bc) bc.remove();
    };
  }, [fullTitle, description, canonicalUrl, ogType, image, keywords, article, jsonLd, breadcrumbs, siteUrl]);

  return null;
};

export default SEOHead;
