import { useState } from "react";
import {
  Calendar, Clock, MessageCircle, Send, ChevronRight,
  Activity, FileText, CheckCircle, AlertCircle, X,
} from "lucide-react";
import { MOCK_TREATMENTS, MOCK_APPOINTMENTS } from "../data/practice";

interface Props {
  user: { name: string; email: string } | null;
  onNavigate: (page: string) => void;
}

interface ChatMsg {
  from: "user" | "assistant";
  text: string;
}

const TREATMENT_CHART_DATA = [
  { month: "Oct", count: 1 },
  { month: "Nov", count: 0 },
  { month: "Dec", count: 2 },
  { month: "Jan", count: 1 },
  { month: "Feb", count: 1 },
  { month: "Mar", count: 2 },
];

export default function Dashboard({ user, onNavigate }: Props) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    { from: "assistant", text: "Hi! I'm your dental care assistant. How can I help you today? You can ask about appointments, treatments, costs, or general dental care questions." },
  ]);

  const upcomingAppts = MOCK_APPOINTMENTS.filter((a) => a.status !== "cancelled");
  const completedTreatments = MOCK_TREATMENTS.filter((t) => t.status === "completed");
  const upcomingTreatments = MOCK_TREATMENTS.filter((t) => t.status === "upcoming");
  const totalSpent = completedTreatments.reduce((a, t) => a + t.cost, 0);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages((prev) => [...prev, { from: "user", text: userMsg }]);
    setChatInput("");

    setTimeout(() => {
      let reply = "I'd be happy to help with that! For specific questions about your treatment plan or billing, please call us at (732) 906-8883 during office hours.";
      const lower = userMsg.toLowerCase();
      if (lower.includes("appointment") || lower.includes("book") || lower.includes("schedule")) {
        reply = "You can book an appointment directly through our online scheduler! Click the 'Book New Appointment' button on your dashboard, or I can help you find an available slot. We're open Mon, Tue, Thu, Fri from 9 AM to 4 PM.";
      } else if (lower.includes("cost") || lower.includes("price") || lower.includes("insurance")) {
        reply = "We work with many insurance companies (except DMO) and accept credit cards. For a detailed estimate, try our Cost Analyzer tool! A routine check-up & cleaning typically ranges from $150-$300, with most insurance covering ~80%.";
      } else if (lower.includes("whitening") || lower.includes("zoom")) {
        reply = "Our Zoom teeth whitening is one of our most popular cosmetic treatments! Results are typically 4-8 shades lighter in just one session. Cost ranges from $300-$800. Would you like to schedule a whitening appointment?";
      } else if (lower.includes("pain") || lower.includes("emergency") || lower.includes("hurt")) {
        reply = "If you're experiencing dental pain or an emergency, please call us immediately at (732) 906-8883. We'll do our best to see you as soon as possible during office hours. If it's after hours, go to your nearest emergency room for severe pain.";
      } else if (lower.includes("hours") || lower.includes("open")) {
        reply = "We're open Monday, Tuesday, Thursday, and Friday from 9:00 AM to 4:00 PM. We're closed on Wednesday, Saturday, and Sunday.";
      }
      setChatMessages((prev) => [...prev, { from: "assistant", text: reply }]);
    }, 800);
  };

  const maxChartCount = Math.max(...TREATMENT_CHART_DATA.map((d) => d.count), 1);

  return (
    <div className="pt-24 pb-20 min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-espresso">
            Welcome back, <em className="not-italic text-coral">{user?.name || "Patient"}</em>
          </h1>
          <p className="text-warm-gray mt-2">Here's an overview of your dental care</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Upcoming Appts", value: upcomingAppts.length.toString(), icon: Calendar, color: "bg-butter" },
            { label: "Treatments Done", value: completedTreatments.length.toString(), icon: CheckCircle, color: "bg-sage" },
            { label: "Upcoming Treatments", value: upcomingTreatments.length.toString(), icon: AlertCircle, color: "bg-lavender" },
            { label: "Total Invested", value: `$${totalSpent.toLocaleString()}`, icon: Activity, color: "bg-blush" },
          ].map((stat) => (
            <div key={stat.label} className="bg-warm-white rounded-2xl p-5 border border-cream-dark/40">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon size={18} className="text-espresso" />
              </div>
              <div className="text-2xl font-display font-bold text-espresso">{stat.value}</div>
              <div className="text-xs text-warm-gray mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Treatment history chart */}
          <div className="lg:col-span-2 bg-warm-white rounded-2xl p-6 border border-cream-dark/40">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold text-espresso">Treatment History</h3>
              <span className="text-xs text-warm-gray">Last 6 months</span>
            </div>
            <div className="flex items-end gap-4 h-40">
              {TREATMENT_CHART_DATA.map((d) => (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-32">
                    <div
                      className="w-full max-w-[40px] bg-butter rounded-t-lg transition-all hover:bg-butter-dark"
                      style={{ height: `${(d.count / maxChartCount) * 100}%`, minHeight: d.count > 0 ? 16 : 4 }}
                    />
                  </div>
                  <span className="text-xs text-warm-gray">{d.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming appointments */}
          <div className="bg-warm-white rounded-2xl p-6 border border-cream-dark/40">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-espresso">Upcoming</h3>
              <button
                onClick={() => onNavigate("appointments")}
                className="text-xs text-coral font-semibold hover:underline cursor-pointer"
              >
                Book new
              </button>
            </div>
            <div className="space-y-3">
              {upcomingAppts.map((appt) => (
                <div key={appt.id} className="p-3 rounded-xl bg-cream border border-cream-dark/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-espresso">{appt.service}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      appt.status === "confirmed" ? "bg-sage/30 text-sage-dark" : "bg-butter/50 text-espresso-light"
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-warm-gray">
                    <span className="flex items-center gap-1"><Calendar size={11} />{new Date(appt.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{appt.time}</span>
                  </div>
                  <div className="text-xs text-warm-gray mt-1">{appt.doctor}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Treatment tracker */}
        <div className="mt-6 bg-warm-white rounded-2xl p-6 border border-cream-dark/40">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold text-espresso flex items-center gap-2">
              <FileText size={18} className="text-coral" /> Treatment Tracker
            </h3>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-cream-dark" />
            <div className="space-y-6">
              {MOCK_TREATMENTS.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t) => (
                <div key={t.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 border-warm-white ${
                    t.status === "completed"
                      ? "bg-sage"
                      : t.status === "in-progress"
                      ? "bg-butter"
                      : "bg-cream-dark"
                  }`} />
                  <div className="bg-cream rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm text-espresso">{t.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-warm-gray mt-1">
                          <span>{new Date(t.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                          <span>{t.doctor}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {t.cost > 0 && (
                          <span className="text-sm font-semibold text-espresso">${t.cost.toLocaleString()}</span>
                        )}
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          t.status === "completed"
                            ? "bg-sage/20 text-sage-dark"
                            : t.status === "in-progress"
                            ? "bg-butter/30 text-espresso"
                            : "bg-lavender/30 text-espresso-light"
                        }`}>
                          {t.status === "completed" ? "Completed" : t.status === "in-progress" ? "In Progress" : "Upcoming"}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-warm-gray mt-2 leading-relaxed">{t.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat widget */}
      {chatOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[340px] sm:w-[380px] bg-warm-white rounded-2xl shadow-2xl border border-cream-dark/40 z-50 animate-slide-in-right overflow-hidden">
          <div className="bg-espresso px-5 py-4 flex items-center justify-between">
            <div>
              <h4 className="font-display font-bold text-warm-white text-sm">Dental Care Chat</h4>
              <p className="text-cream/50 text-xs">Ask about appointments, costs, care</p>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-cream/50 hover:text-cream cursor-pointer">
              <X size={18} />
            </button>
          </div>
          <div className="h-72 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "bg-espresso text-cream rounded-br-md"
                      : "bg-cream text-espresso rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-cream-dark/40">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about your care..."
                className="flex-1 px-4 py-2.5 rounded-full bg-cream border border-cream-dark text-sm outline-none focus:border-butter-dark transition-colors"
              />
              <button
                type="submit"
                className="w-9 h-9 rounded-full bg-espresso text-cream flex items-center justify-center hover:bg-espresso-light transition-colors cursor-pointer"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Chat FAB */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={`fixed bottom-6 right-4 sm:right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all z-50 cursor-pointer ${
          chatOpen ? "bg-coral hover:bg-coral-dark" : "bg-espresso hover:bg-espresso-light"
        }`}
      >
        {chatOpen ? (
          <ChevronRight size={22} className="text-warm-white" />
        ) : (
          <MessageCircle size={22} className="text-warm-white" />
        )}
      </button>
    </div>
  );
}
