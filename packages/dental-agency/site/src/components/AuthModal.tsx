import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

interface Props {
  onClose: () => void;
  onLogin: (email: string, password: string) => void;
  onRegister: (name: string, email: string, phone: string, password: string) => void;
}

export default function AuthModal({ onClose, onLogin, onRegister }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") onLogin(form.email || "patient@edisondental27.com", form.password || "demo");
    else onRegister(form.name || "Demo Patient", form.email || "patient@edisondental27.com", form.phone || "(732) 555-0100", form.password || "demo");
    onClose();
  };

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm" />
      <div
        className="relative bg-warm-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-butter px-8 pt-8 pb-12">
          <button onClick={onClose} className="absolute top-4 right-4 text-espresso/60 hover:text-espresso cursor-pointer">
            <X size={20} />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-warm-white flex items-center justify-center text-2xl mb-4">
            🦷
          </div>
          <h2 className="font-display text-2xl font-bold text-espresso">
            {mode === "login" ? "Welcome Back" : "Join Our Practice"}
          </h2>
          <p className="text-espresso-light text-sm mt-1">
            {mode === "login"
              ? "Sign in to manage your appointments and treatments"
              : "Create an account to book appointments online"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 -mt-6 relative space-y-4">
          <div className="bg-warm-white rounded-2xl shadow-sm border border-cream-dark p-5 space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"

                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-dark focus:border-butter-dark focus:ring-2 focus:ring-butter/40 outline-none text-sm transition-all"
                  placeholder="Jane Smith"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-dark focus:border-butter-dark focus:ring-2 focus:ring-butter/40 outline-none text-sm transition-all"
                placeholder="jane@example.com"
              />
            </div>
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-1.5">Phone</label>
                <input
                  type="tel"

                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-dark focus:border-butter-dark focus:ring-2 focus:ring-butter/40 outline-none text-sm transition-all"
                  placeholder="(732) 555-0100"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-warm-gray uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}

                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-cream border border-cream-dark focus:border-butter-dark focus:ring-2 focus:ring-butter/40 outline-none text-sm pr-10 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-gray hover:text-espresso cursor-pointer"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-espresso hover:bg-espresso-light text-warm-white font-semibold py-3 rounded-full transition-colors text-sm cursor-pointer"
          >
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>

          <p className="text-center text-sm text-warm-gray">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-coral font-semibold hover:underline cursor-pointer"
            >
              {mode === "login" ? "Register" : "Sign In"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
