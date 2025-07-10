
import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  Menu,
  X,
  Heart,
  User,
} from "lucide-react";
// Add these imports at the top
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { pathname } = useLocation();
  
  // Check if we're on the home page
  const isHomePage = pathname === '/';
  // On mobile, always use dark text for visibility. On desktop, use conditional logic
  const shouldUseDarkText = !isHomePage || isScrolled;

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (!mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  return (
      <header
    className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      // Mobile: completely solid background for visibility
      "lg:bg-white/20 lg:backdrop-blur-md bg-white",
      isScrolled ? "bg-white shadow-md py-3" : "py-5"
    )}
  >
      <div className="px-0.5">
        {/* Top header with contact info */}
        <div
          className={cn(
            "hidden lg:flex justify-between items-center text-sm mb-4 transition-opacity duration-300 border-b-[0.5px] border-black/30 pb-2",
            isScrolled ? "opacity-0 pointer-events-none h-0 overflow-hidden" : shouldUseDarkText ? "text-black" : "text-white"
          )}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <Phone size={16} className="ml-3"/>
              <span>+1 (234) 567-890</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} />
              <span>info@Azumahhomes.com</span>
            </div>
          </div>

          <div className="flex items-center gap-6 mr-4">
            {!user && (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium hover:text-real-orange transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium hover:text-real-orange transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
            {user && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 hover:text-real-orange transition-colors"
              >
                <User size={16} />
                <span>Dashboard</span>
              </Link>
            )}
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex justify-between items-center px-4 py-2">
        <Link
          to="/"
          className="flex items-center gap-2"
        >
          <img src="/logo.png" alt="Logo" className="w-12 h-12 lg:w-20 lg:h-20" />
          <div className="leading-tight">
            <div
              className={cn(
                "text-2xl lg:text-5xl font-extrabold tracking-tight hover:text-blue-700 transition-colors duration-300",
                // Always dark on mobile for visibility, conditional on desktop
                "text-black lg:text-black lg:group-hover:text-blue-700",
                !shouldUseDarkText && "lg:text-white"
              )}
            >
              Azumah Homes
            </div>
          </div>
        </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center justify-end flex-1 space-x-9">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "font-medium transition-colors",
                  isActive ? "text-real-orange" : shouldUseDarkText ? "text-black hover:text-real-orange" : "text-white hover:text-real-orange"
                )
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/properties"
              className={({ isActive }) =>
                cn(
                  "font-medium transition-colors",
                  isActive ? "text-real-orange" : shouldUseDarkText ? "text-black hover:text-real-orange" : "text-white hover:text-real-orange"
                )
              }
            >
              Properties
            </NavLink>
            <NavLink
              to="/agents"
              className={({ isActive }) =>
                cn(
                  "font-medium transition-colors",
                  isActive ? "text-real-orange" : shouldUseDarkText ? "text-black hover:text-real-orange" : "text-white hover:text-real-orange"
                )
              }
            >
              Agents
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                cn(
                  "font-medium transition-colors",
                  isActive ? "text-real-orange" : shouldUseDarkText ? "text-black hover:text-real-orange" : "text-white hover:text-real-orange"
                )
              }
            >
              About
            </NavLink>
            <NavLink
              to="/blog"
              className={({ isActive }) =>
                cn(
                  "font-medium transition-colors",
                  isActive ? "text-real-orange" : shouldUseDarkText ? "text-black hover:text-real-orange" : "text-white hover:text-real-orange"
                )
              }
            >
              Blog
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                cn(
                  "font-medium transition-colors",
                  isActive ? "text-real-orange" : shouldUseDarkText ? "text-black hover:text-real-orange" : "text-white hover:text-real-orange"
                )
              }
            >
              Contact
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            {user && (
              <Link to="/dashboard/favorites" className={cn(
                "hidden lg:flex items-center gap-1 px-3 py-2",
                // Always dark on mobile for visibility, conditional on desktop
                "text-black",
                !shouldUseDarkText && "lg:text-white"
              )}>
                <Heart size={20} />
              </Link>
            )}
            {/* Login/Signup buttons moved to top header */}
            {isAdmin && (
              <>
                <Link to="/submit-listing" className="hidden lg:inline-block">
                  <Button>
                    Add Property
                  </Button>
                </Link>
                <Link to="/submit-blog" className="hidden lg:inline-block">
                  <Button variant="outline" className={cn(
                    "border-2",
                    shouldUseDarkText ? "border-real-orange text-real-orange hover:bg-real-orange hover:text-white" : "border-white text-white hover:bg-white hover:text-real-orange"
                  )}>
                    Add Blog
                  </Button>
                </Link>
              </>
            )}
            <button
              className={cn(
                "lg:hidden",
                // Always dark on mobile for visibility
                "text-black"
              )}
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 bg-white z-50 transform transition-transform lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="container mx-auto p-5">
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="text-2xl font-bold text-real-orange">
              Azumah Homes
            </Link>
            <button
              onClick={toggleMobileMenu}
              className="text-gray-800"
              aria-label="Close mobile menu"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col space-y-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "text-xl font-medium",
                  isActive ? "text-real-orange" : "text-gray-800"
                )
              }
              onClick={toggleMobileMenu}
            >
              Home
            </NavLink>
            <NavLink
              to="/properties"
              className={({ isActive }) =>
                cn(
                  "text-xl font-medium",
                  isActive ? "text-real-orange" : "text-gray-800"
                )
              }
              onClick={toggleMobileMenu}
            >
              Properties
            </NavLink>
            <NavLink
              to="/agents"
              className={({ isActive }) =>
                cn(
                  "text-xl font-medium",
                  isActive ? "text-real-orange" : "text-gray-800"
                )
              }
              onClick={toggleMobileMenu}
            >
              Agents
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                cn(
                  "text-xl font-medium",
                  isActive ? "text-real-orange" : "text-gray-800"
                )
              }
              onClick={toggleMobileMenu}
            >
              About
            </NavLink>
            <NavLink
              to="/blog"
              className={({ isActive }) =>
                cn(
                  "text-xl font-medium",
                  isActive ? "text-real-orange" : "text-gray-800"
                )
              }
              onClick={toggleMobileMenu}
            >
              Blog
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                cn(
                  "text-xl font-medium",
                  isActive ? "text-real-orange" : "text-gray-800"
                )
              }
              onClick={toggleMobileMenu}
            >
              Contact
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  "text-xl font-medium",
                  isActive ? "text-real-orange" : "text-gray-800"
                )
              }
              onClick={toggleMobileMenu}
            >
              Dashboard
            </NavLink>
            {isAdmin && (
              <>
                <NavLink
                  to="/submit-listing"
                  className="bg-real-orange text-white py-3 px-6 rounded-md text-center lg:hidden"
                  onClick={toggleMobileMenu}
                >
                  Add Property
                </NavLink>
                <NavLink
                  to="/submit-blog"
                  className="border-2 border-real-orange text-real-orange py-3 px-6 rounded-md text-center hover:bg-real-orange hover:text-white transition-colors lg:hidden"
                  onClick={toggleMobileMenu}
                >
                  Add Blog
                </NavLink>
              </>
            )}
          </nav>

          {!user && (
            <div className="mt-8 pt-6 border-t lg:hidden">
              <div className="flex flex-col space-y-3">
                <Link
                  to="/login"
                  className="bg-real-orange text-white py-3 px-6 rounded-md text-center font-medium lg:hidden"
                  onClick={toggleMobileMenu}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="border-2 border-real-orange text-real-orange py-3 px-6 rounded-md text-center font-medium hover:bg-real-orange hover:text-white transition-colors lg:hidden"
                  onClick={toggleMobileMenu}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}

          <div className="mt-10 border-t pt-6 lg:hidden">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-real-orange" />
                <span>+1 (234) 567-890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-real-orange" />
                <span>info@Azumah Homes.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
