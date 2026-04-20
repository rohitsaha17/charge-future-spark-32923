import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import VideoIntro from "./components/VideoIntro";
import LoadingProgressBar from "./components/LoadingProgressBar";
import PageSkeleton from "./components/PageSkeleton";
import Home from "./pages/Home"; // Eager: first-paint critical

// --- Lazy route chunks ------------------------------------------------------
// Each is a function we can call on hover/focus to preload the chunk BEFORE
// the user clicks, so by the time they do, the JS is in cache. React.lazy
// caches the promise automatically, so calling load() multiple times is safe.
const loaders = {
  about: () => import("./pages/About"),
  services: () => import("./pages/Services"),
  findCharger: () => import("./pages/FindCharger"),
  partner: () => import("./pages/Partner"),
  invest: () => import("./pages/Invest"),
  blog: () => import("./pages/Blog"),
  blogPost: () => import("./pages/BlogPost"),
  adminLogin: () => import("./pages/AdminLogin"),
  adminDashboard: () => import("./pages/AdminDashboard"),
  adminChargingStations: () => import("./pages/AdminChargingStations"),
  adminBlogs: () => import("./pages/AdminBlogs"),
  adminEnquiries: () => import("./pages/AdminEnquiries"),
  adminContent: () => import("./pages/AdminContent"),
  terms: () => import("./pages/TermsAndConditions"),
  privacy: () => import("./pages/PrivacyPolicy"),
  notFound: () => import("./pages/NotFound"),
};

const About = lazy(loaders.about);
const Services = lazy(loaders.services);
const FindCharger = lazy(loaders.findCharger);
const Partner = lazy(loaders.partner);
const Invest = lazy(loaders.invest);
const Blog = lazy(loaders.blog);
const BlogPost = lazy(loaders.blogPost);
const AdminLogin = lazy(loaders.adminLogin);
const AdminDashboard = lazy(loaders.adminDashboard);
const AdminChargingStations = lazy(loaders.adminChargingStations);
const AdminBlogs = lazy(loaders.adminBlogs);
const AdminEnquiries = lazy(loaders.adminEnquiries);
const AdminContent = lazy(loaders.adminContent);
const TermsAndConditions = lazy(loaders.terms);
const PrivacyPolicy = lazy(loaders.privacy);
const NotFound = lazy(loaders.notFound);

/** Map URL pathname → preloader function so nav hover can warm the chunk. */
const pathLoaders: Array<[RegExp, () => Promise<unknown>]> = [
  [/^\/about/, loaders.about],
  [/^\/services/, loaders.services],
  [/^\/find-charger/, loaders.findCharger],
  [/^\/partner/, loaders.partner],
  [/^\/invest/, loaders.invest],
  [/^\/blog\/[^/]+/, loaders.blogPost],
  [/^\/blog/, loaders.blog],
  [/^\/admin\/login/, loaders.adminLogin],
  [/^\/admin\/dashboard/, loaders.adminDashboard],
  [/^\/admin\/charging-stations/, loaders.adminChargingStations],
  [/^\/admin\/blogs/, loaders.adminBlogs],
  [/^\/admin\/enquiries/, loaders.adminEnquiries],
  [/^\/admin\/content/, loaders.adminContent],
  [/^\/terms/, loaders.terms],
  [/^\/privacy/, loaders.privacy],
];

/** Preload whichever route chunk matches the clicked/hovered href. Run from
 *  a single document-level listener so we don't need to wire it per-link. */
const preloadForHref = (href: string) => {
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    const match = pathLoaders.find(([rx]) => rx.test(url.pathname));
    match?.[1]();
  } catch {
    // invalid URL, ignore
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  useEffect(() => {
    if ((location.pathname === '/' || location.pathname === '/index') && isInitialLoad) {
      // Play the intro once per browser TAB, not once ever and not every
      // visit. Suppress for reduced-motion / save-data / 2G users.
      const playedThisTab = (() => {
        try { return sessionStorage.getItem('introPlayed') === '1'; }
        catch { return false; }
      })();
      const prefersReduced = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const conn = (navigator as any).connection;
      const saveData = conn?.saveData === true;
      const slowNetwork = conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g';
      if (!playedThisTab && !prefersReduced && !saveData && !slowNetwork) {
        setShowIntro(true);
      }
      setIsInitialLoad(false);
    }
  }, [location.pathname, isInitialLoad]);

  // After first paint, warm the chunks for the pages the user is most
  // likely to click next. Uses requestIdleCallback so it doesn't compete
  // with real work for CPU/bandwidth.
  useEffect(() => {
    const warmLikelyNext = () => {
      loaders.about();
      loaders.services();
      loaders.findCharger();
      loaders.partner();
    };
    const ric: any = (window as any).requestIdleCallback;
    if (typeof ric === 'function') {
      const id = ric(warmLikelyNext, { timeout: 5000 });
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const t = setTimeout(warmLikelyNext, 2500);
    return () => clearTimeout(t);
  }, []);

  // Preload route chunks on hover/focus. One delegated listener on the
  // document keeps nav instant-feeling without touching every Link.
  useEffect(() => {
    const targetHref = (e: Event) => {
      const el = e.target as HTMLElement;
      const anchor = el?.closest?.('a[href]') as HTMLAnchorElement | null;
      return anchor?.href || null;
    };
    const onEnter = (e: Event) => {
      const href = targetHref(e);
      if (href) preloadForHref(href);
    };
    document.addEventListener('mouseover', onEnter, { passive: true });
    document.addEventListener('touchstart', onEnter, { passive: true });
    document.addEventListener('focusin', onEnter);
    return () => {
      document.removeEventListener('mouseover', onEnter);
      document.removeEventListener('touchstart', onEnter);
      document.removeEventListener('focusin', onEnter);
    };
  }, []);

  const handleIntroComplete = () => {
    try { sessionStorage.setItem('introPlayed', '1'); } catch { /* storage disabled */ }
    setShowIntro(false);
  };

  if (showIntro) {
    return <VideoIntro onComplete={handleIntroComplete} />;
  }

  return (
    <>
      <LoadingProgressBar isLoading={false} />
      <Navigation />
      <Suspense fallback={<PageSkeleton />}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/find-charger" element={<FindCharger />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/invest" element={<Invest />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/charging-stations" element={<AdminChargingStations />} />
          <Route path="/admin/blogs" element={<AdminBlogs />} />
          <Route path="/admin/enquiries" element={<AdminEnquiries />} />
          <Route path="/admin/content" element={<AdminContent />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
