import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Heart, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Doctors", path: "/doctors" },
  { label: "Medicines", path: "/medicines" },
  { label: "Appointments", path: "/appointments" },
  { label: "Consultation", path: "/consultation" },
  { label: "Pharmacy", path: "/pharmacy" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-medical flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-gradient-medical">E-MedCare</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login"><LogIn className="mr-2 h-4 w-4" />Login</Link>
            </Button>
            <Button size="sm" className="bg-gradient-medical hover:opacity-90" asChild>
              <Link to="/register"><User className="mr-2 h-4 w-4" />Sign Up</Link>
            </Button>
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
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex gap-2 pt-2 border-t mt-2">
                  <Button variant="ghost" size="sm" className="flex-1" asChild>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-medical" asChild>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-card py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 E-MedCare. Connecting patients with healthcare professionals.</p>
        </div>
      </footer>
    </div>
  );
}
