
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-6">Azumah Homes</h3>
            <p className="text-gray-400 mb-6">
              Find your dream home with our professional real estate services. 
              We make property buying, selling, and renting simple and transparent.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-real-blue transition-colors"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-real-blue transition-colors"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/properties" className="text-gray-400 hover:text-white transition-colors">
                  Properties
                </Link>
              </li>
              <li>
                <Link to="/agents" className="text-gray-400 hover:text-white transition-colors">
                  Our Agents
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Property Types</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/properties?type=apartment" className="text-gray-400 hover:text-white transition-colors">
                  Apartments
                </Link>
              </li>
              <li>
                <Link to="/properties?type=house" className="text-gray-400 hover:text-white transition-colors">
                  Houses
                </Link>
              </li>
              <li>
                <Link to="/properties?type=villa" className="text-gray-400 hover:text-white transition-colors">
                  Villas
                </Link>
              </li>
              <li>
                <Link to="/properties?type=office" className="text-gray-400 hover:text-white transition-colors">
                  Office
                </Link>
              </li>
              <li>
                <Link to="/properties?type=studio" className="text-gray-400 hover:text-white transition-colors">
                  Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-real-blue shrink-0 mt-1" />
                <span className="text-gray-400">
                  1234 Property St.<br/>New York, NY 10001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-real-blue" />
                <a href="tel:+12345678901" className="text-gray-400 hover:text-white transition-colors">
                  +1 (234) 567-8901
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-real-blue" />
                <a href="mailto:info@Azumah Homes.com" className="text-gray-400 hover:text-white transition-colors">
                  info@Azumah Homes.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} Azumah Homes. All Rights Reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-gray-500 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms-of-service" className="text-gray-500 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
