import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { SERVICE_CATEGORIES } from "../data/practice";

interface Props {
  onNavigate: (page: string) => void;
}

export default function Services({ onNavigate }: Props) {
  const [activeCategory, setActiveCategory] = useState(0);
  const cat = SERVICE_CATEGORIES[activeCategory];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-warm-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <span className="text-sm font-semibold text-coral uppercase tracking-wider">Our Services</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-espresso mt-3">
            Comprehensive <em className="not-italic text-coral">Dental</em> Care
          </h1>
          <p className="text-espresso-light mt-4 max-w-xl">
            From routine check-ups to advanced implants — we offer a full range of dental services for the whole family.
          </p>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {SERVICE_CATEGORIES.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setActiveCategory(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeCategory === i
                  ? "bg-espresso text-warm-white"
                  : "bg-cream hover:bg-cream-dark text-espresso-light"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cat.services.map((service) => (
            <div
              key={service.name}
              className={`${cat.accent} rounded-2xl p-6 hover:shadow-md transition-all group`}
            >
              <div className="text-3xl mb-4">{service.icon}</div>
              <h3 className="font-display text-lg font-bold text-espresso">{service.name}</h3>
              <p className="text-sm text-espresso-light mt-2 leading-relaxed">{service.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-warm-gray">Est. </span>
                  <span className="font-semibold text-espresso">
                    ${service.estimatedCost.low.toLocaleString()} – ${service.estimatedCost.high.toLocaleString()}
                  </span>
                </div>
                {service.insuranceCoverage > 0 && (
                  <span className="text-xs bg-warm-white/60 px-2.5 py-1 rounded-full text-espresso-light">
                    ~{service.insuranceCoverage}% covered
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-warm-gray text-sm mb-4">Want to know exact costs for your treatment plan?</p>
          <button
            onClick={() => onNavigate("cost-analyzer")}
            className="group inline-flex items-center gap-2 bg-espresso hover:bg-espresso-light text-warm-white px-7 py-3.5 rounded-full font-semibold text-sm transition-all cursor-pointer"
          >
            Open Cost Analyzer <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
