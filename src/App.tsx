import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import VideoIntro from "./components/VideoIntro";
import LoadingProgressBar from "./components/LoadingProgressBar";
import { useWebVitals } from "./hooks/useWebVitals";

// Lazy load pages for better code splitting and faster initial load
const Home = lazy(() => import("./pages/Home"));
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
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized QueryClient with better caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const [showIntro, setShowIntro] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  // Monitor Web Vitals in development
  useWebVitals();

  // Scroll to top on route change - memoized for INP optimization
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  useEffect(() => {
    // Only check on initial mount when on home page
    if ((location.pathname === '/' || location.pathname === '/index') && isInitialLoad) {
      // Check if video has been played in this tab session
      const hasPlayedInSession = sessionStorage.getItem('videoPlayedInSession');
      
      if (!hasPlayedInSession) {
        setShowIntro(true);
      }
      setIsInitialLoad(false);
    }
  }, [location.pathname, isInitialLoad]);

  useEffect(() => {
    // Handle route transitions with fade animation
    if (location.pathname !== displayLocation.pathname) {
      setIsNavigating(true);
      
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsNavigating(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  // Memoized callback for better INP
  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem('videoPlayedInSession', 'true');
    setShowIntro(false);
  }, []);

  if (showIntro) {
    return <VideoIntro onComplete={handleIntroComplete} />;
  }

  // Memoized transition class for performance
  const transitionClass = useMemo(() => 
    `transition-opacity duration-300 will-change-opacity ${isNavigating ? "opacity-0" : "opacity-100"}`,
    [isNavigating]
  );

  return (
    <>
      <LoadingProgressBar isLoading={isNavigating} />
      <Navigation />
      <div className={transitionClass}>
        <Suspense fallback={<PageLoader />}>
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
