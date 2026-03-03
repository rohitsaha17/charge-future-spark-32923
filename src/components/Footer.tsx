import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Youtube, Linkedin, Twitter, Facebook } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img src={logo} alt="A Plus Charge" className="h-10 w-auto mb-4" loading="lazy" decoding="async" />
            <p className="text-sm text-muted-foreground">
              Northeast India's pioneering EV charging network. Serving Assam, Meghalaya, Arunachal Pradesh, 
              and the entire Seven Sisters with clean, smart energy solutions.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">Services</Link></li>
              <li><Link to="/find-charger" className="text-sm text-muted-foreground hover:text-primary transition-colors">Find a Charger</Link></li>
              <li><Link to="/partner" className="text-sm text-muted-foreground hover:text-primary transition-colors">Become Our Partner</Link></li>
              <li><Link to="/terms-and-conditions" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">For Investors</h3>
            <ul className="space-y-2">
              <li><Link to="/invest" className="text-sm text-muted-foreground hover:text-primary transition-colors">Investment Opportunities</Link></li>
              <li><Link to="/partner" className="text-sm text-muted-foreground hover:text-primary transition-colors">ROI Calculator</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail size={16} />
                <a href="mailto:info@apluscharge.in" className="hover:text-primary transition-colors">
                  info@apluscharge.in
                </a>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone size={16} />
                <a href="tel:+917099018180" className="hover:text-primary transition-colors">
                  +91 70990 18180
                </a>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin size={16} />
                <span>ALTERNATEV SOLUTIONS PVT LTD<br />23, Rajat Kamal Path, RG Baruah Road,<br />Guwahati-781024</span>
              </li>
            </ul>
            <div className="flex items-center gap-3 mt-4">
              <a href="https://www.instagram.com/apluscharge" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/apluscharge" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="https://www.youtube.com/@evboy_samyak" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube size={20} />
              </a>
              <a href="https://x.com/apluscharge" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://www.facebook.com/apluscharge" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} A Plus Charge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
