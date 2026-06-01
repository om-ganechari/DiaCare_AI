import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  History, 
  Database,
  Grid
} from "lucide-react";

export const AuthView: React.FC = () => {
  const { 
    loginWithGoogle, 
    setCurrentPage, 
    t 
  } = useApp();

  const [authError, setAuthError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const clearMessages = () => {
    setAuthError("");
  };

  // Trigger Google Login
  const handleGoogleAuth = async () => {
    if (actionLoading) return;
    clearMessages();
    setActionLoading(true);
    try {
      await loginWithGoogle();
      setCurrentPage("dashboard");
    } catch (err: any) {
      console.error("[Auth Failure]", err);
      const isCancelledPopup = 
        err?.code === "auth/cancelled-popup-request" ||
        err?.code === "auth/popup-closed-by-user" ||
        String(err).includes("cancelled-popup-request") ||
        String(err).includes("popup-closed-by-user");

      if (isCancelledPopup) {
        setAuthError(
          "Authentication window was closed. Please ensure popups are permitted on this domain and try again."
        );
      } else {
        setAuthError(
          err?.message || "Google single sign-on attempt failed. Please check your network and try again."
        );
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div id="diacare-auth-view-page" className="relative min-h-[85vh] flex items-center justify-center py-16 px-4 bg-[#050816] overflow-hidden font-sans text-left">
      {/* Premium Background Ambient Glow */}
      <div className="absolute top-1/10 left-1/10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/10 right-1/10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-2xl relative z-10 space-y-6">
        
        {/* Core Header with Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 text-white shadow-lg shadow-cyan-500/20 antialiased">
            <Activity className="h-7 w-7 stroke-[2.5]" id="diacare-auth-spinning-logo" />
          </div>
          <div>
            <h2 id="diacare-auth-title" className="text-3xl font-extrabold text-white tracking-tight">
              DiaCare AI
            </h2>
            <p className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase mt-1">
              Metabolic Intelligence Matrix
            </p>
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Gain secure clearance to predictive diabetes risking analysis, automated medical audits, and smart diagnostics visualization.
          </p>
        </div>

        {/* Security Notification Error logs */}
        <AnimatePresence mode="wait">
          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              id="diacare-auth-error-panel"
              className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs leading-relaxed space-y-1 relative"
            >
              <div className="font-bold flex items-center space-x-1.5 text-red-400">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Security Notice / Operation Error</span>
              </div>
              <p className="opacity-95">{authError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Telemetry Benefits Indicators */}
        <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-[11px] text-slate-300">
          <div className="flex items-start space-x-3">
            <div className="p-1 rounded bg-cyan-500/10 text-cyan-400 mt-0.5">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Secure OAuth Session</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Authenticates seamlessly using your secure Google account. No clinical passwords to manage.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-1 rounded bg-purple-500/10 text-purple-400 mt-0.5">
              <History className="h-3.5 w-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Telemetry Persistence</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Your calculated metrics, lab-assessment logs, custom diet, and routine plans save securely to Firestore.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 mt-0.5">
              <Database className="h-3.5 w-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Isolated Data Nodes</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Your medical calculations are isolated under secure user paths, complying with data sandbox directives.
              </p>
            </div>
          </div>
        </div>

        {/* Google Authentication Button */}
        <div className="space-y-4 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            id="google-sso-auth-button"
            type="button"
            disabled={actionLoading}
            onClick={handleGoogleAuth}
            className="w-full py-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/40 text-slate-100 transition-all font-sans font-bold flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xl"
          >
            {actionLoading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-cyan-400 rounded-full" />
            ) : (
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48c0,-0.61 -0.06,-1.21 -0.16,-1.7,-0.01,-0.12 -0.1,-0.2 -0.17,-0.2z" fill="#4285F4" />
                  <path d="M12,20.5c2.3,0 4.23,-0.76 5.64,-2.08l-3.3,-2.58c-0.91,0.61 -2.08,0.98 -3.34,0.98c-2.57,0 -4.75,-1.74 -5.52,-4.08H2.1v2.66c1.43,2.83 4.36,4.68 7.74,4.68c0.72,0 1.44,-0.08 2.16,-0.26z" fill="#34A853" />
                  <path d="M6.48,12.74c-0.19,-0.58 -0.3,-1.2 -0.3,-1.84s0.11,-1.26 0.3,-1.84V6.4H2.1c-0.67,1.33 -1.05,2.83 -1.05,4.42s0.38,3.09 1.05,4.42l3.41,-2.66c0,-0.01 0,-0.01 0,-0.02z" fill="#FBBC05" />
                  <path d="M12,5.18c1.25,0 2.37,0.43 3.25,1.27l2.43,-2.43C16.22,2.65 14.28,2 12,2C8.62,2 5.69,3.85 4.26,6.68l3.41,2.66c0.77,-2.34 2.95,-4.08 5.52,-4.08c0.27,0 0.54,0.02 0.81,0.06z" fill="#EA4335" />
                </g>
              </svg>
            )}
            <span className="font-sans font-extrabold text-xs uppercase tracking-wider">
              {actionLoading ? "Establishing persistence session..." : "Continue with Google"}
            </span>
          </motion.button>
        </div>

        {/* Footer Clinic disclaimer */}
        <div className="text-center pt-2">
          <p className="text-[9px] text-slate-500 leading-normal font-mono">
            Governed under HIPAA data alignment parameters. Requires official Google account verification.
          </p>
        </div>

      </div>
    </div>
  );
};
