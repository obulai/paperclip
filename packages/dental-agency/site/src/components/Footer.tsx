import { Phone, MapPin, Clock, Mail } from "lucide-react";
import { PRACTICE } from "../data/practice";

export default function Footer() {
  return (
    <footer className="bg-espresso text-cream/80">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-butter flex items-center justify-center text-espresso font-display font-bold text-sm">
                E
              </div>
              <span className="font-display text-xl font-semibold text-warm-white">
                Edison Dental <span className="text-coral">27</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-cream/60">
              Serving the Edison community since {PRACTICE.established}. {PRACTICE.tagline}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold text-warm-white mb-4">Contact</h4>
            <div className="space-y-3 text-sm">
              <a href={`tel:${PRACTICE.phone}`} className="flex items-center gap-2 hover:text-butter transition-colors">
                <Phone size={14} /> {PRACTICE.phone}
              </a>
              <a href={`mailto:${PRACTICE.email}`} className="flex items-center gap-2 hover:text-butter transition-colors">
                <Mail size={14} /> {PRACTICE.email}
              </a>
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0" /> {PRACTICE.address}
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-display text-lg font-semibold text-warm-white mb-4">Hours</h4>
            <div className="space-y-1.5 text-sm">
              {PRACTICE.hours.map((h) => (
                <div key={h.day} className="flex justify-between">
                  <span className="text-cream/60">{h.day}</span>
                  <span className={h.time === "Closed" ? "text-coral/70" : ""}>
                    <Clock size={12} className="inline mr-1" />
                    {h.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-warm-white mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              {["Services", "Meet Our Team", "Book Appointment", "Cost Analyzer", "Patient Portal"].map((l) => (
                <div key={l}>
                  <a href="#" className="hover:text-butter transition-colors">{l}</a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/40">
          <p>&copy; {new Date().getFullYear()} Edison Dental 27. All rights reserved.</p>
          <p>We work with many insurance companies to maximize your benefits (except DMO).</p>
        </div>
      </div>
    </footer>
  );
}
