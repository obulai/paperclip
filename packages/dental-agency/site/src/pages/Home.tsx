import { ArrowRight, Star, ChevronLeft, ChevronRight, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { PRACTICE, DOCTORS, SERVICE_CATEGORIES, TESTIMONIALS, STATS, MARQUEE_SERVICES } from "../data/practice";

interface Props {
  onNavigate: (page: string) => void;
  onLoginClick: () => void;
  isLoggedIn: boolean;
}

export default function Home({ onNavigate, onLoginClick, isLoggedIn }: Props) {
  const [reviewIdx, setReviewIdx] = useState(0);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-butter/60 via-cream to-warm-white" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-butter/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blush/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 py-32 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-warm-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-espresso-light mb-6 animate-fade-in-up border border-cream-dark/50">
              <span className="w-2 h-2 rounded-full bg-sage-dark" />
              Serving Edison since {PRACTICE.established}
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-espresso leading-[1.05] animate-fade-in-up delay-100">
              Your{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Smile,</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-butter rounded-sm -z-0" />
              </span>
              <br />
              <em className="not-italic text-coral">Our Priority.</em>
            </h1>
            <p className="text-lg text-espresso-light mt-6 max-w-lg leading-relaxed animate-fade-in-up delay-200">
              {PRACTICE.tagline} Our practice has been serving the Edison community for over 20 years.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8 animate-fade-in-up delay-300">
              <button
                onClick={() => isLoggedIn ? onNavigate("appointments") : onLoginClick()}
                className="group flex items-center gap-2 bg-espresso hover:bg-espresso-light text-warm-white px-7 py-3.5 rounded-full font-semibold text-sm transition-all cursor-pointer"
              >
                Book Appointment
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href={`tel:${PRACTICE.phone}`}
                className="flex items-center gap-2 border-2 border-espresso/20 hover:border-espresso/40 px-6 py-3.5 rounded-full text-sm font-semibold text-espresso transition-all"
              >
                <Phone size={15} />
                Call Us
              </a>
            </div>
          </div>

          {/* Floating card */}
          <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2">
            <div className="bg-warm-white rounded-3xl shadow-xl p-6 w-72 border border-cream-dark/40 animate-fade-in-up delay-400">
              <div className="text-4xl mb-3">🦷</div>
              <h3 className="font-display text-lg font-bold">Featured Treatments</h3>
              <div className="mt-4 space-y-2">
                {["Invisalign", "Zoom Whitening", "Dental Implants"].map((s) => (
                  <div key={s} className="flex items-center gap-2 text-sm bg-cream rounded-xl px-3 py-2.5">
                    <span className="w-2 h-2 rounded-full bg-coral" />
                    {s}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <div className="text-3xl font-display font-bold text-espresso">20<span className="text-coral">+</span></div>
                  <div className="text-xs text-warm-gray">Years of expertise</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services marquee */}
      <div className="bg-espresso py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...MARQUEE_SERVICES, ...MARQUEE_SERVICES].map((s, i) => (
            <span key={i} className="mx-6 text-cream/70 text-sm font-medium flex items-center gap-3">
              {s} <span className="text-coral">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`text-center animate-fade-in-up delay-${(i + 1) * 100}`}
            >
              <div className="text-4xl sm:text-5xl font-display font-bold text-espresso">{stat.value}</div>
              <div className="text-sm text-warm-gray mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services grid */}
      <section id="services-section" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-coral uppercase tracking-wider">What We Offer</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-espresso mt-3">
              Our Core <em className="not-italic text-coral">Dental</em> Services
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICE_CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                className={`${cat.accent} rounded-3xl p-7 hover:shadow-lg transition-all group cursor-pointer`}
                onClick={() => onNavigate("services")}
              >
                <div className="text-3xl mb-4">{cat.services[0].icon}</div>
                <h3 className="font-display text-xl font-bold text-espresso mb-2">{cat.name}</h3>
                <p className="text-sm text-espresso-light leading-relaxed mb-4">
                  {cat.services.map((s) => s.name).join(", ")}
                </p>
                <div className="flex items-center gap-1 text-sm font-semibold text-espresso">
                  Learn more <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-warm-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-warm-gray uppercase tracking-wider">Meet Our Doctors</span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-espresso mt-3">
              Discover Our Team of{" "}
              <em className="not-italic text-coral">Dental</em> Experts
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {DOCTORS.map((doc) => (
              <div key={doc.name} className="group">
                <div className={`${doc.color} rounded-3xl mb-4 flex items-center justify-center h-72 overflow-hidden transition-transform group-hover:scale-[1.02]`}>
                  <img
                    src={doc.photo}
                    alt={doc.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <h3 className="font-display text-xl font-bold text-espresso">{doc.name}</h3>
                <p className="text-coral text-sm font-medium">{doc.title}</p>
                <p className="text-warm-gray text-sm mt-2">{doc.degree}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {doc.memberships.slice(0, 3).map((m) => (
                    <span key={m} className="text-xs bg-cream px-2.5 py-1 rounded-full text-espresso-light">{m}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-espresso text-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-sm font-semibold text-coral uppercase tracking-wider">Testimonials</span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-warm-white mt-3">
                {TESTIMONIALS.length}+ <em className="not-italic text-butter">Reviews</em>
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setReviewIdx(Math.max(0, reviewIdx - 1))}
                disabled={reviewIdx === 0}
                className="w-10 h-10 rounded-full border border-cream/20 flex items-center justify-center hover:bg-cream/10 disabled:opacity-30 transition-all cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setReviewIdx(Math.min(TESTIMONIALS.length - 1, reviewIdx + 1))}
                disabled={reviewIdx >= TESTIMONIALS.length - 1}
                className="w-10 h-10 rounded-full bg-butter text-espresso flex items-center justify-center hover:bg-butter-dark disabled:opacity-30 transition-all cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.slice(reviewIdx, reviewIdx + 3).map((t) => (
              <div key={t.name} className="bg-espresso-light/50 backdrop-blur-sm rounded-2xl p-6 border border-cream/10">
                <div className="inline-block bg-coral/20 text-coral text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {t.service}
                </div>
                <p className="text-cream/90 leading-relaxed mb-5 text-sm">"{t.text}"</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-warm-white text-sm">{t.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={13} className="fill-butter text-butter" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact-section" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-warm-white rounded-3xl p-8 md:p-14 flex flex-col md:flex-row gap-10 shadow-sm border border-cream-dark/40">
            <div className="flex-1">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-espresso">
                Ready to Schedule <br />Your <em className="not-italic text-coral">Visit?</em>
              </h2>
              <p className="text-espresso-light mt-4 leading-relaxed">
                New patients welcome! We accept most insurance plans and offer flexible payment options. Call us or book online today.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-butter flex items-center justify-center">
                    <Phone size={16} className="text-espresso" />
                  </div>
                  <div>
                    <div className="text-xs text-warm-gray">Call Us</div>
                    <a href={`tel:${PRACTICE.phone}`} className="font-semibold text-espresso hover:text-coral transition-colors">
                      {PRACTICE.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-mint flex items-center justify-center">
                    <MapPin size={16} className="text-espresso" />
                  </div>
                  <div>
                    <div className="text-xs text-warm-gray">Visit Us</div>
                    <span className="font-semibold text-espresso text-sm">{PRACTICE.address}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => isLoggedIn ? onNavigate("appointments") : onLoginClick()}
                className="mt-8 group flex items-center gap-2 bg-espresso hover:bg-espresso-light text-warm-white px-7 py-3.5 rounded-full font-semibold text-sm transition-all cursor-pointer"
              >
                Book Online Now
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="flex-1 bg-cream rounded-2xl min-h-[280px] flex items-center justify-center text-warm-gray text-sm overflow-hidden">
              <iframe
                title="Edison Dental 27 Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3035.3!2d-74.364!3d40.528!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDMxJzQxLjAiTiA3NMKwMjEnNTAuNCJX!5e0!3m2!1sen!2sus!4v1"
                className="w-full h-full min-h-[280px] rounded-2xl border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
