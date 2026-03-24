import { useState } from "react";
import { Plus, X, Calculator, ArrowRight } from "lucide-react";
import { SERVICE_CATEGORIES } from "../data/practice";

const ALL_SERVICES = SERVICE_CATEGORIES.flatMap((c) =>
  c.services.map((s) => ({ ...s, category: c.name, accent: c.accent }))
);

interface Props {
  onNavigate: (page: string) => void;
}

export default function CostAnalyzer({ onNavigate }: Props) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [hasInsurance, setHasInsurance] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = searchQuery
    ? ALL_SERVICES.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ALL_SERVICES;

  const selected = ALL_SERVICES.filter((s) => selectedServices.includes(s.name));

  const totalLow = selected.reduce((a, s) => a + s.estimatedCost.low, 0);
  const totalHigh = selected.reduce((a, s) => a + s.estimatedCost.high, 0);

  const insuranceSavingsLow = selected.reduce(
    (a, s) => a + (s.estimatedCost.low * s.insuranceCoverage) / 100,
    0
  );
  const insuranceSavingsHigh = selected.reduce(
    (a, s) => a + (s.estimatedCost.high * s.insuranceCoverage) / 100,
    0
  );

  const outOfPocketLow = hasInsurance ? totalLow - insuranceSavingsLow : totalLow;
  const outOfPocketHigh = hasInsurance ? totalHigh - insuranceSavingsHigh : totalHigh;

  const toggleService = (name: string) => {
    setSelectedServices((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="pt-24 pb-20 min-h-screen bg-warm-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <span className="text-sm font-semibold text-coral uppercase tracking-wider">Plan Your Treatment</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-espresso mt-3">
            Treatment <em className="not-italic text-coral">Cost</em> Analyzer
          </h1>
          <p className="text-espresso-light mt-4 max-w-xl">
            Get estimated costs for your dental treatments. Select the services you need to see a breakdown with and without insurance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service selector */}
          <div className="lg:col-span-2">
            <div className="bg-cream rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Calculator size={20} className="text-coral" />
                <h3 className="font-display text-lg font-bold text-espresso">Select Treatments</h3>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search treatments..."
                className="w-full px-4 py-3 rounded-xl bg-warm-white border border-cream-dark focus:border-butter-dark focus:ring-2 focus:ring-butter/40 outline-none text-sm mb-5 transition-all"
              />

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {filteredServices.map((s) => {
                  const isSelected = selectedServices.includes(s.name);
                  return (
                    <button
                      key={s.name}
                      onClick={() => toggleService(s.name)}
                      className={`w-full text-left flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-espresso bg-warm-white"
                          : "border-transparent bg-warm-white/60 hover:bg-warm-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{s.icon}</span>
                        <div>
                          <div className="font-semibold text-sm text-espresso">{s.name}</div>
                          <div className="text-xs text-warm-gray">{s.category}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-warm-gray">
                          ${s.estimatedCost.low.toLocaleString()}–${s.estimatedCost.high.toLocaleString()}
                        </span>
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-coral flex items-center justify-center">
                            <X size={12} className="text-warm-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-cream-dark flex items-center justify-center">
                            <Plus size={12} className="text-warm-gray" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cost summary */}
          <div>
            <div className="bg-espresso text-cream rounded-3xl p-6 sm:p-8 sticky top-24">
              <h3 className="font-display text-xl font-bold text-warm-white mb-6">Cost Estimate</h3>

              {/* Insurance toggle */}
              <div className="flex items-center justify-between mb-6 pb-5 border-b border-cream/10">
                <span className="text-sm text-cream/80">I have insurance</span>
                <button
                  onClick={() => setHasInsurance(!hasInsurance)}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
                    hasInsurance ? "bg-sage" : "bg-espresso-light"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-warm-white shadow transition-transform ${
                      hasInsurance ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {selected.length === 0 ? (
                <p className="text-cream/50 text-sm text-center py-8">
                  Select treatments from the left to see your estimated costs
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {selected.map((s) => (
                      <div key={s.name} className="flex items-center justify-between text-sm">
                        <span className="text-cream/80 truncate mr-2">{s.name}</span>
                        <span className="text-warm-white font-medium whitespace-nowrap">
                          ${s.estimatedCost.low.toLocaleString()}–${s.estimatedCost.high.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-cream/10 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-cream/60">Subtotal</span>
                      <span className="text-cream">
                        ${totalLow.toLocaleString()} – ${totalHigh.toLocaleString()}
                      </span>
                    </div>
                    {hasInsurance && (
                      <div className="flex justify-between text-sm">
                        <span className="text-sage">Insurance savings (est.)</span>
                        <span className="text-sage font-medium">
                          -${Math.round(insuranceSavingsLow).toLocaleString()} – -${Math.round(insuranceSavingsHigh).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 border-t border-cream/10">
                      <span className="font-semibold text-warm-white">Your estimated cost</span>
                      <span className="font-display text-xl font-bold text-butter">
                        ${Math.round(outOfPocketLow).toLocaleString()} – ${Math.round(outOfPocketHigh).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate("appointments")}
                    className="mt-6 w-full bg-butter hover:bg-butter-dark text-espresso font-semibold py-3 rounded-full text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    Book These Treatments <ArrowRight size={14} />
                  </button>
                </>
              )}

              <p className="text-xs text-cream/30 mt-6 leading-relaxed">
                * Estimates based on typical ranges. Actual costs depend on complexity, materials, and your insurance plan. We accept most insurance (except DMO) and credit cards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
