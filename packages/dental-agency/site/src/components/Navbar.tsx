import { useState } from "react";
import { Phone, Menu, X, User, LogOut } from "lucide-react";
import { PRACTICE } from "../data/practice";

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: { name: string; email: string } | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "services", label: "Services" },
  { id: "appointments", label: "Appointments" },
  { id: "cost-analyzer", label: "Cost Analyzer" },
  { id: "contact", label: "Contact" },
];

export default function Navbar({ currentPage, onNavigate, user, onLoginClick, onLogout }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-warm-white/90 backdrop-blur-md border-b border-cream-dark/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button onClick={() => onNavigate("home")} className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-butter flex items-center justify-center text-espresso font-display font-bold text-sm group-hover:bg-butter-dark transition-colors">
              E
            </div>
            <span className="font-display text-lg sm:text-xl font-semibold tracking-tight text-espresso">
              Edison Dental <span className="text-coral">27</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 lg:px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  currentPage === item.id
                    ? "bg-espresso text-warm-white"
                    : "text-espresso-light hover:bg-cream-dark"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`tel:${PRACTICE.phone}`}
              className="hidden sm:flex items-center gap-2 text-sm text-espresso-light hover:text-espresso transition-colors"
            >
              <Phone size={14} />
              {PRACTICE.phone}
            </a>
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate("dashboard")}
                  className="flex items-center gap-2 bg-butter hover:bg-butter-dark text-espresso px-3 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
                >
                  <User size={14} />
                  <span className="hidden sm:inline">{user.name}</span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 text-warm-gray hover:text-espresso transition-colors cursor-pointer"
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center gap-2 bg-espresso hover:bg-espresso-light text-warm-white px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
              >
                <User size={14} />
                <span className="hidden sm:inline">Patient Login</span>
              </button>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-espresso cursor-pointer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-warm-white border-b border-cream-dark shadow-lg animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  currentPage === item.id
                    ? "bg-espresso text-warm-white"
                    : "text-espresso-light hover:bg-cream"
                }`}
              >
                {item.label}
              </button>
            ))}
            {user && (
              <button
                onClick={() => { onNavigate("dashboard"); setMobileOpen(false); }}
                className="block w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-coral hover:bg-blush/30 cursor-pointer"
              >
                My Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
