import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { AuthView } from "./components/AuthView";
import { DashboardView } from "./components/DashboardView";
import { RiskAssessment } from "./components/RiskAssessment";
import { PredictionForm } from "./components/PredictionForm";
import { ResultsPage } from "./components/ResultsPage";
import { DietPlanner } from "./components/DietPlanner";
import { WorkoutPlanner } from "./components/WorkoutPlanner";
import { ProfilePage } from "./components/ProfilePage";
import { Chatbot } from "./components/Chatbot";
import { Mail, CheckCircle2, AlertTriangle, X, Activity } from "lucide-react";

const AppContainer: React.FC = () => {
  const { currentPage, user, loading, setCurrentPage, emailStatus, setEmailStatus } = useApp();

  const protectedPages = [
    "dashboard",
    "assessment",
    "prediction",
    "results",
    "diet",
    "workout",
    "profile",
    "upload",
  ];

  React.useEffect(() => {
    if (!loading && !user && protectedPages.includes(currentPage)) {
      setCurrentPage("login");
    }
  }, [user, loading, currentPage, setCurrentPage]);

  React.useEffect(() => {
    if (emailStatus) {
      const timer = setTimeout(() => {
        setEmailStatus(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [emailStatus, setEmailStatus]);

  const renderActiveView = () => {
    if (loading) {
      return (
        <div id="diacare-route-loading-gate" className="min-h-[75vh] flex flex-col items-center justify-center space-y-4 text-center">
          <div className="relative flex items-center justify-center">
            <div className="animate-spin w-12 h-12 border-4 border-cyan-500/10 border-t-cyan-400 rounded-full" />
            <Activity className="absolute h-5 w-5 text-cyan-400 animate-pulse" />
          </div>
          <p className="text-xs text-slate-400 font-mono tracking-widest uppercase mt-2">
            Synchronizing Clinical Session...
          </p>
        </div>
      );
    }

    switch (currentPage) {
      case "landing":
        return (
          <div id={"dia-landing-container"}>
            <HeroSection />
            <FeaturesSection />
          </div>
        );
      case "login":
      case "signup":
      case "forgot":
        return <AuthView />;
      case "dashboard":
        return <DashboardView />;
      case "assessment":
        return <RiskAssessment />;
      case "prediction":
        return <PredictionForm />;
      case "results":
        return <ResultsPage />;
      case "diet":
        return <DietPlanner />;
      case "workout":
        return <WorkoutPlanner />;
      case "profile":
        return <ProfilePage />;
      default:
        return (
          <div id={"dia-landing-container"}>
            <HeroSection />
            <FeaturesSection />
          </div>
        );
    }
  };

  return (
    <div id="diacare-app-workspace" className="min-h-screen bg-[#050816] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black relative">
      <div>
        <Header />
        <main className="relative">{renderActiveView()}</main>
      </div>
      <Footer />

      {/* Futuristic Clinical Mailer Toast Telemetry Indicator (Requirement 7) */}
      {emailStatus && (
        <div 
          id="diacare-telemetry-toast"
          className={`fixed bottom-6 right-6 md:max-w-md w-[calc(100vw-3rem)] z-[9999] rounded-2xl border backdrop-blur-2xl shadow-2xl p-4 flex items-start space-x-3 transition-all duration-300 transform translate-y-0 scale-100 ${
            emailStatus.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-100 shadow-emerald-500/5"
              : "bg-red-950/40 border-red-500/30 text-red-100 shadow-red-500/5"
          }`}
        >
          <div className={`p-2 rounded-xl shrink-0 ${
            emailStatus.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500"
          }`}>
            {emailStatus.type === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertTriangle className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Mail className="h-3 w-3" />
              <span>{emailStatus.type === "success" ? "Clinical Dispatch Approved" : "Clinical Dispatch Rejected"}</span>
            </h5>
            <p className="text-[11px] text-slate-300 leading-normal font-sans">
              {emailStatus.message}
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => setEmailStatus(null)}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Intelligent AI Chatbot: "DiaCare AI Assistant" (Requirement 6-8) */}
      <Chatbot />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContainer />
    </AppProvider>
  );
}
