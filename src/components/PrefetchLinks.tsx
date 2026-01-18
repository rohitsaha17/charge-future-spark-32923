import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resource hints for prefetching likely next pages based on navigation patterns.
 * This improves perceived navigation speed by loading pages before the user clicks.
 */

// Define navigation patterns - which pages users typically visit next
const navigationPatterns: Record<string, string[]> = {
  "/": ["/about", "/services", "/find-charger", "/partner"],
  "/about": ["/services", "/invest", "/partner"],
  "/services": ["/find-charger", "/partner"],
  "/find-charger": ["/partner", "/services"],
  "/partner": ["/invest", "/services"],
  "/invest": ["/about", "/partner"],
  "/blog": ["/about", "/services"],
};

const PrefetchLinks = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const pagesToPrefetch = navigationPatterns[currentPath] || [];

    // Add prefetch hints for likely next pages
    pagesToPrefetch.forEach((path) => {
      // Check if link already exists
      const existingLink = document.querySelector(`link[href="${path}"][rel="prefetch"]`);
      if (existingLink) return;

      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = path;
      link.as = "document";
      document.head.appendChild(link);
    });

    // Cleanup old prefetch links when navigating away
    return () => {
      const oldLinks = document.querySelectorAll('link[rel="prefetch"][as="document"]');
      oldLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href && !pagesToPrefetch.includes(href)) {
          link.remove();
        }
      });
    };
  }, [location.pathname]);

  // Also prefetch on hover for navigation links
  useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a[href]") as HTMLAnchorElement | null;
      
      if (!link) return;
      
      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;
      
      // Check if already prefetched
      const existingLink = document.querySelector(`link[href="${href}"][rel="prefetch"]`);
      if (existingLink) return;

      // Add prefetch on hover
      const prefetchLink = document.createElement("link");
      prefetchLink.rel = "prefetch";
      prefetchLink.href = href;
      prefetchLink.as = "document";
      document.head.appendChild(prefetchLink);
    };

    // Add listener to navigation areas
    const navElements = document.querySelectorAll("nav, header, footer");
    navElements.forEach((nav) => {
      nav.addEventListener("mouseenter", handleMouseEnter, { capture: true });
    });

    return () => {
      navElements.forEach((nav) => {
        nav.removeEventListener("mouseenter", handleMouseEnter, { capture: true });
      });
    };
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default PrefetchLinks;
