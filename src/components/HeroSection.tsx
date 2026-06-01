import React from "react";
import { useApp } from "../context/AppContext";
import { Play, Sparkles, Brain, CheckCircle2, TrendingUp } from "lucide-react";

export const HeroSection: React.FC = () => {
  const { setCurrentPage, t, user } = useApp();

  return (
    <div className="relative overflow-hidden min-h-[85vh] flex items-center justify-center px-4 md:px-8 py-16 bg-[#050816]">
      {/* Background glowing ambient elements */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left copy text block */}
        <div className="lg:col-span-7 text-left space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300 fill-cyan-400/10" />
            <span>{t("futuristicAi")}</span>
          </div>

          <h1 className="font-sans font-extrabold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none">
            {t("heroTitle")}{" "}
            <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-white">
              {t("diabetesRiskIntel")}
            </span>
          </h1>

          <p className="max-w-xl text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
            {t("heroSubtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <button
              onClick={() => setCurrentPage(user ? "assessment" : "login")}
              className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black font-sans font-bold text-sm rounded-lg transition-all"
            >
              <span>{t("getStarted")}</span>
              <Play className="h-4 w-4 fill-black shrink-0" />
            </button>

            <button
              onClick={() => setCurrentPage(user ? "dashboard" : "login")}
              className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-white/10 border border-white/20 hover:bg-white/15 text-white font-sans font-bold text-sm rounded-lg transition-all text-center"
            >
              <span>{t("viewDashboard")}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-10 text-gray-400 border-t border-cyan-500/10">
            <div>
              <div className="font-bold font-sans text-2xl text-cyan-400">92.4%</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                {t("pimaAccuracy")}
              </div>
            </div>
            <div>
              <div className="font-bold font-sans text-2xl text-purple-400">OCR 2.0</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                {t("labPdfEngine")}
              </div>
            </div>
            <div>
              <div className="font-bold font-sans text-2xl text-teal-400">Gemini 3.5</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
                {t("aiCore")}
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview glassmorphism bento card visualization */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-purple-500/10 rounded-2xl blur-[30px]" />
          <div className="relative bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            
            {/* Top diagnostic panel bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-cyan-400" />
                <span className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-widest">
                  {t("assessmentAnalyzer")}
                </span>
              </div>
              <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              </div>
            </div>

            {/* Simulated diagnostic chart & score */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/15 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase font-medium">
                    {t("diagnosticRiskState")}
                  </div>
                  <div className="font-sans font-bold text-lg text-white mt-0.5">
                    {t("metabolicRiskLevel")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                    {t("lowRisk")}
                  </div>
                </div>
              </div>

              {/* Progress dynamic scale */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>{t("glycemicImpactIndex")}</span>
                  <span className="text-cyan-300 font-bold">12%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-cyan-500 w-[24%]" />
                </div>
              </div>
            </div>

            {/* Diagnostics check items */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center space-x-2.5 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>{t("check1")}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>{t("check2")}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>{t("check3")}</span>
              </div>
            </div>

            {/* Small active badge */}
            <div className="flex items-center justify-center p-3.5 bg-white/5 border border-white/15 rounded-xl text-xs text-cyan-300 font-mono tracking-tight font-medium space-x-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <span>{t("realTimeDbLinked")}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
