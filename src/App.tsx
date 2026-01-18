import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import VideoIntro from "./components/VideoIntro";
import LoadingProgressBar from "./components/LoadingProgressBar";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import FindCharger from "./pages/FindCharger";
import Partner from "./pages/Partner";
import Invest from "./pages/Invest";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminChargingStations from "./pages/AdminChargingStations";
import AdminBlogs from "./pages/AdminBlogs";
import AdminEnquiries from "./pages/AdminEnquiries";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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

  const handleIntroComplete = () => {
    // Mark video as played in this session
    sessionStorage.setItem('videoPlayedInSession', 'true');
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
        className={`transition-opacity duration-300 ${
          isNavigating ? "opacity-0" : "opacity-100"
        }`}
      >
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
