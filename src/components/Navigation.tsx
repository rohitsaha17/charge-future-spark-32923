import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isPageVisible, loading } = useSiteSettings();

  // All possible nav links with their visibility keys
  const allNavLinks = [
    { name: "Home", path: "/", visibilityKey: null }, // Always visible
    { name: "About Us", path: "/about", visibilityKey: "about" as const },
    { name: "Services", path: "/services", visibilityKey: "services" as const },
    { name: "Blogs", path: "/blog", visibilityKey: "blog" as const },
    { name: "Find a Charger", path: "/find-charger", visibilityKey: null }, // Always visible
    { name: "Become Our Partner", path: "/partner", visibilityKey: "partner" as const },
    { name: "Invest in APlus", path: "/invest", visibilityKey: "invest" as const },
  ];

  // Filter nav links based on visibility settings
  const navLinks = allNavLinks.filter(link => {
    if (link.visibilityKey === null) return true; // Always show Home and Find a Charger
    return isPageVisible(link.visibilityKey);
  });

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="container mx-auto px-4 py-4">
        <div className="nav-glass rounded-2xl px-6 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-3 animate-fade-in"
            onClick={() => {
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            <img src={logo} alt="A Plus Charge" className="h-8 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => {
                  if (link.path === '/' && location.pathname === '/') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`text-sm font-medium transition-all duration-200 px-4 py-2 rounded-lg ${
                  isActive(link.path)
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 nav-glass rounded-2xl p-6">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.path)
                      ? "text-primary"
                      : "text-foreground/80"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;