import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Check, Calendar, Clock } from "lucide-react";
import { DOCTORS, SERVICE_CATEGORIES, TIME_SLOTS } from "../data/practice";

interface Props {
  onNavigate: (page: string) => void;
}

const ALL_SERVICES = SERVICE_CATEGORIES.flatMap((c) => c.services.map((s) => ({ ...s, category: c.name })));

export default function Appointments({ onNavigate }: Props) {
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [booked, setBooked] = useState(false);

  const [monthOffset, setMonthOffset] = useState(0);
  const baseDate = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1).getDay();
  const today = new Date();

  const monthName = baseDate.toLocaleString("default", { month: "long", year: "numeric" });

  const isAvailable = (day: number) => {
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);
    const dow = d.getDay();
    return dow !== 0 && dow !== 3 && dow !== 6 && d >= today;
  };

  const handleBook = () => {
    setBooked(true);
    setTimeout(() => onNavigate("dashboard"), 2000);
  };

  if (booked) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-sage mx-auto flex items-center justify-center mb-6">
            <Check size={32} className="text-warm-white" />
          </div>
          <h2 className="font-display text-3xl font-bold text-espresso">Appointment Booked!</h2>
          <p className="text-warm-gray mt-3">
            {selectedService} with {selectedDoctor}<br />
            {selectedDate} at {selectedTime}
          </p>
          <p className="text-sm text-warm-gray mt-6">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { label: "Service", done: !!selectedService },
    { label: "Doctor", done: !!selectedDoctor },
    { label: "Date", done: !!selectedDate },
    { label: "Time", done: !!selectedTime },
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <span className="text-sm font-semibold text-coral uppercase tracking-wider">Book Online</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-espresso mt-3">
            Schedule Your <em className="not-italic text-coral">Appointment</em>
          </h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => s.done || i <= step ? setStep(i) : null}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                  i === step
                    ? "bg-espresso text-warm-white scale-110"
                    : s.done
                    ? "bg-sage text-warm-white"
                    : "bg-cream-dark text-warm-gray"
                }`}
              >
                {s.done && i < step ? <Check size={14} /> : i + 1}
              </button>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-espresso" : "text-warm-gray"}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${s.done ? "bg-sage" : "bg-cream-dark"}`} />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-warm-white rounded-3xl p-6 sm:p-8 shadow-sm border border-cream-dark/40">
          {/* Step 0: Service */}
          {step === 0 && (
            <div>
              <h3 className="font-display text-xl font-bold text-espresso mb-2">Select a Service</h3>
              <p className="text-sm text-warm-gray mb-6">Choose the type of treatment you need</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {ALL_SERVICES.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => { setSelectedService(s.name); setStep(1); }}
                    className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedService === s.name
                        ? "border-espresso bg-cream"
                        : "border-cream-dark hover:border-butter-dark"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{s.icon}</span>
                      <div>
                        <div className="font-semibold text-sm text-espresso">{s.name}</div>
                        <div className="text-xs text-warm-gray">{s.category}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Doctor */}
          {step === 1 && (
            <div>
              <h3 className="font-display text-xl font-bold text-espresso mb-2">Choose Your Doctor</h3>
              <p className="text-sm text-warm-gray mb-6">Select the doctor for your visit</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DOCTORS.map((doc) => (
                  <button
                    key={doc.name}
                    onClick={() => { setSelectedDoctor(doc.name); setStep(2); }}
                    className={`text-left p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedDoctor === doc.name
                        ? "border-espresso bg-cream"
                        : "border-cream-dark hover:border-butter-dark"
                    }`}
                  >
                    <img src={doc.photo} alt={doc.name} className={`w-16 h-16 rounded-2xl ${doc.color} object-cover mb-4`} />
                    <div className="font-display text-lg font-bold text-espresso">{doc.name}</div>
                    <div className="text-sm text-coral">{doc.title}</div>
                    <div className="text-xs text-warm-gray mt-1">{doc.degree}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date */}
          {step === 2 && (
            <div>
              <h3 className="font-display text-xl font-bold text-espresso mb-2">Pick a Date</h3>
              <p className="text-sm text-warm-gray mb-6">We're open Mon, Tue, Thu, Fri — 9 AM to 4 PM</p>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setMonthOffset((m) => m - 1)} className="p-2 hover:bg-cream rounded-full cursor-pointer">
                  <ChevronLeft size={18} />
                </button>
                <span className="font-display text-lg font-semibold">{monthName}</span>
                <button onClick={() => setMonthOffset((m) => m + 1)} className="p-2 hover:bg-cream rounded-full cursor-pointer">
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="py-2 text-warm-gray font-medium text-xs">{d}</div>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`e-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const avail = isAvailable(day);
                  const sel = selectedDate === dateStr;
                  return (
                    <button
                      key={day}
                      disabled={!avail}
                      onClick={() => { setSelectedDate(dateStr); setStep(3); }}
                      className={`py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                        sel
                          ? "bg-espresso text-warm-white font-bold"
                          : avail
                          ? "hover:bg-butter text-espresso"
                          : "text-cream-dark cursor-not-allowed"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Time */}
          {step === 3 && (
            <div>
              <h3 className="font-display text-xl font-bold text-espresso mb-2">Select a Time</h3>
              <p className="text-sm text-warm-gray mb-6">
                <Calendar size={13} className="inline mr-1" />
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
                      selectedTime === t
                        ? "border-espresso bg-espresso text-warm-white"
                        : "border-cream-dark hover:border-butter-dark text-espresso"
                    }`}
                  >
                    <Clock size={13} className="inline mr-1" />
                    {t}
                  </button>
                ))}
              </div>
              {selectedTime && (
                <div className="mt-8 p-5 rounded-2xl bg-cream border border-cream-dark">
                  <h4 className="font-display font-bold text-espresso mb-3">Appointment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-warm-gray">Service</span>
                      <span className="font-medium">{selectedService}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warm-gray">Doctor</span>
                      <span className="font-medium">{selectedDoctor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warm-gray">Date</span>
                      <span className="font-medium">
                        {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warm-gray">Time</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleBook}
                    className="mt-5 w-full bg-espresso hover:bg-espresso-light text-warm-white py-3 rounded-full font-semibold text-sm transition-colors cursor-pointer"
                  >
                    Confirm Appointment
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
