import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img src={logo} alt="A Plus Charge" className="h-10 w-auto mb-4" />
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
                <span>info@apluscharge.com</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone size={16} />
                <span>+91 XXX XXX XXXX</span>
              </li>
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin size={16} />
                <span>Guwahati, Assam, Northeast India</span>
              </li>
            </ul>
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
