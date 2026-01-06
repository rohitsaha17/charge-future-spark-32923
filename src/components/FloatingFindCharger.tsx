import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const FloatingFindCharger = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Link
      to="/find-charger"
      className={`fixed bottom-6 left-4 z-50 md:hidden flex items-center gap-2 px-4 py-3 rounded-full
        bg-gradient-to-r from-primary to-cyan-500 text-white font-semibold text-sm
        shadow-[0_4px_20px_rgba(38,116,236,0.4)] 
        transition-all duration-300 ease-out
        hover:shadow-[0_6px_30px_rgba(0,198,255,0.5)] hover:scale-105
        active:scale-95
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
    >
      <MapPin className="w-4 h-4" />
      <span>Find Charger</span>
    </Link>
  );
};

export default FloatingFindCharger;
