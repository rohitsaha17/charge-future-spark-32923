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
import Home from "./pages/Home"; // Eager: first-paint critical

// Lazy-loaded: split into separate chunks so the initial bundle is tiny
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const FindCharger = lazy(() => import("./pages/FindCharger"));
const Partner = lazy(() => import("./pages/Partner"));
const Invest = lazy(() => import("./pages/Invest"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminChargingStations = lazy(() => import("./pages/AdminChargingStations"));
const AdminBlogs = lazy(() => import("./pages/AdminBlogs"));
const AdminEnquiries = lazy(() => import("./pages/AdminEnquiries"));
const AdminContent = lazy(() => import("./pages/AdminContent"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

const SuspenseFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  useEffect(() => {
    if ((location.pathname === '/' || location.pathname === '/index') && isInitialLoad) {
      // Play the intro every time the user lands on the homepage. We only
      // suppress it for:
      //  - users who explicitly prefer reduced motion
      //  - save-data / 2G connections where the 2.6MB video would be abusive
      // Otherwise the brand video always runs first.
      const prefersReduced = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const conn = (navigator as any).connection;
      const saveData = conn?.saveData === true;
      const slowNetwork = conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g';

      if (!prefersReduced && !saveData && !slowNetwork) {
        setShowIntro(true);
      }
      setIsInitialLoad(false);
    }
  }, [location.pathname, isInitialLoad]);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsNavigating(true);
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsNavigating(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  if (showIntro) {
    return <VideoIntro onComplete={handleIntroComplete} />;
  }

  return (
    <>
      <LoadingProgressBar isLoading={isNavigating} />
      <Navigation />
      <div
        className={`transition-opacity duration-200 ${
          isNavigating ? "opacity-0" : "opacity-100"
        }`}
      >
        <Suspense fallback={<SuspenseFallback />}>
          <Routes location={displayLocation}>
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
      </div>
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
