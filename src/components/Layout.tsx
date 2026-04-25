import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Heart, User, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userType, setUserType] = useState<'patient' | 'doctor' | 'pharmacy' | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check authentication state and user type
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');
    
    if (token && storedUserType) {
      setIsLoggedIn(true);
      setUserType(storedUserType as 'patient' | 'doctor' | 'pharmacy');
    } else {
      setIsLoggedIn(false);
      setUserType(null);
    }
  }, [location]); // Re-check on route change

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUserType(null);
    window.location.href = '/';
  };

  const getNavLinks = () => {
    const baseLinks = [
      { label: "Home", path: "/" },
      { label: "Doctors", path: "/doctors" },
      { label: "Medicines", path: "/medicines" },
    ];

    if (userType === 'doctor') {
      return [...baseLinks, { label: "Dashboard", path: "/doctor-dashboard" }];
    } else if (userType === 'patient') {
      return [...baseLinks, { label: "Patient Portal", path: "/patient-portal" }];
    } else if (userType === 'pharmacy') {
      return [...baseLinks, { label: "Pharmacy Dashboard", path: "/pharmacy-dashboard" }];
    }
    
    return [...baseLinks];
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-600">Heal-U</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />Logout
                </Button>
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium capitalize">{userType}</span>
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login"><LogIn className="mr-2 h-4 w-4" />Login</Link>
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link to="/register"><User className="mr-2 h-4 w-4" />Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t overflow-hidden"
            >
              <div className="container py-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex gap-2 pt-2 border-t mt-2">
                  {isLoggedIn ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />Logout
                      </Button>
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md">
                        <User className="h-4 w-4" />
                        <span className="text-sm font-medium capitalize">{userType}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" className="flex-1" asChild>
                        <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
                      </Button>
                      <Button size="sm" className="flex-1 bg-blue-600" asChild>
                        <Link to="/register" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-white py-8">
        <div className="container text-center text-sm text-gray-600">
          <p>© 2026 E-MedCare. Connecting patients with healthcare professionals.</p>
        </div>
      </footer>
    </div>
  );
}
