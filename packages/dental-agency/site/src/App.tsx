import { useState, useCallback, useEffect } from "react";
import Navbar from "./components/Navbar";
import AuthModal from "./components/AuthModal";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Appointments from "./pages/Appointments";
import CostAnalyzer from "./pages/CostAnalyzer";
import Dashboard from "./pages/Dashboard";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { user, login, register, logout } = useAuth();
  const [page, setPage] = useState("home");
  const [showAuth, setShowAuth] = useState(false);

  const navigate = useCallback((p: string) => {
    // Guard auth-required pages
    if (["dashboard", "appointments"].includes(p) && !user) {
      setShowAuth(true);
      return;
    }
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [user]);

  // After login, redirect if they were trying to access a guarded page
  useEffect(() => {
    if (user && showAuth) {
      setShowAuth(false);
    }
  }, [user, showAuth]);

  const renderPage = () => {
    switch (page) {
      case "services":
        return <Services onNavigate={navigate} />;
      case "appointments":
        return <Appointments onNavigate={navigate} />;
      case "cost-analyzer":
        return <CostAnalyzer onNavigate={navigate} />;
      case "dashboard":
        return <Dashboard user={user} onNavigate={navigate} />;
      case "contact":
        // Scroll to contact on home
        setPage("home");
        setTimeout(() => {
          document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        return <Home onNavigate={navigate} onLoginClick={() => setShowAuth(true)} isLoggedIn={!!user} />;
      default:
        return <Home onNavigate={navigate} onLoginClick={() => setShowAuth(true)} isLoggedIn={!!user} />;
    }
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <Navbar
        currentPage={page}
        onNavigate={navigate}
        user={user}
        onLoginClick={() => setShowAuth(true)}
        onLogout={() => { logout(); setPage("home"); }}
      />

      <main>
        {renderPage()}
      </main>

      <Footer />

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLogin={login}
          onRegister={register}
        />
      )}
    </div>
  );
}

export default App;
