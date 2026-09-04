import { useState, useRef, useEffect } from 'react';
import { Phone } from 'lucide-react';

const FloatingContactInfo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-24 z-50 group" ref={dropdownRef}>
      {/* Phone Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center ${
          isOpen
            ? 'bg-slate-800 rotate-0'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-110 hover:shadow-[0_0_30px_rgba(0,198,255,0.5)]'
        }`}
        style={{
          animation: isOpen ? undefined : 'pulse 2s infinite'
        }}
        aria-label="Contact us"
      >
        <Phone className="w-6 h-6 text-white" />
      </button>

      {/* Dropdown Menu - appears to the left of button */}
      <div
        className={`fixed bottom-20 right-24 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 origin-bottom-right ${
          isOpen
            ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto'
            : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 text-white">
          <h3 className="font-bold text-lg">Contact Us</h3>
          <p className="text-xs text-white/80 mt-1">Tap to call directly</p>
        </div>

        {/* Contact Items */}
        <div className="p-4 space-y-3">
          {/* Customer Care */}
          <a
            href="tel:+917099018180"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors active:bg-blue-100"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-cyan-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Customer Care</p>
              <p className="text-lg font-bold text-cyan-600">7099018180</p>
            </div>
          </a>

          {/* Business Enquiries */}
          <a
            href="tel:+917099018181"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors active:bg-blue-100"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Business Enquiries</p>
              <p className="text-lg font-bold text-blue-600">7099018181</p>
            </div>
          </a>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(6, 182, 212, 0); }
        }
      `}</style>
    </div>
  );
};

export default FloatingContactInfo;