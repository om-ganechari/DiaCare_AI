import React from "react";
import { Activity, ShieldAlert, Cpu, HeartHandshake, Dumbbell } from "lucide-react";
import { useApp } from "../context/AppContext";
import { FeedbackForm } from "./FeedbackForm";

export const FeaturesSection: React.FC = () => {
  const { t } = useApp();

  const features = [
    {
      title: t("clinicalAnalyzerTitle"),
      desc: t("clinicalAnalyzerDesc"),
      icon: Activity,
      color: "from-cyan-400 to-cyan-600",
    },
    {
      title: t("lifestyleAuditTitle"),
      desc: t("lifestyleAuditDesc"),
      icon: ShieldAlert,
      color: "from-violet-400 to-violet-600",
    },
    {
      title: t("dietOptimizerTitle"),
      desc: t("dietOptimizerDesc"),
      icon: HeartHandshake,
      color: "from-pink-400 to-pink-600",
    },
    {
      title: t("workoutProtocolsTitle"),
      desc: t("workoutProtocolsDesc"),
      icon: Dumbbell,
      color: "from-teal-400 to-teal-600",
    },
    {
      title: t("multilingualTitle"),
      desc: t("multilingualDesc"),
      icon: Cpu,
      color: "from-blue-400 to-blue-600",
    },
  ];

  return (
    <section className="bg-[#050816] py-20 px-4 md:px-8 space-y-24 relative z-10 font-sans">
      
      {/* 1. FEATURES SECTION */}
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-mono font-bold tracking-widest text-cyan-300 uppercase">
            {t("therapeuticCapabilities")}
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white">
            {t("preventionTechnology")}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t("prevTechDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 hover:bg-white/10 transition-all text-left flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="inline-flex w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border border-cyan-500/30 text-cyan-300 items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
                <div className="pt-4 flex items-center space-x-1 text-xs text-cyan-300 font-mono font-bold hover:underline cursor-pointer group-hover:translate-x-1 transition-transform mt-3">
                  <span>{t("exploreModule")}</span>
                  <span>&rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. HOW IT WORKS */}
      <div className="bg-[#050816] py-16 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              {t("threeStepTitle")}
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {t("threeStepDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative">
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-white/5 border border-white/10 text-cyan-300 font-mono font-bold text-lg flex items-center justify-center">
                1
              </div>
              <h3 className="text-lg font-bold text-white">{t("step1Title")}</h3>
              <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
                {t("step1Desc")}
              </p>
            </div>

            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-white/5 border border-white/10 text-purple-400 font-mono font-bold text-lg flex items-center justify-center">
                2
              </div>
              <h3 className="text-lg font-bold text-white">{t("step2Title")}</h3>
              <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
                {t("step2Desc")}
              </p>
            </div>

            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-white/5 border border-white/10 text-teal-400 font-mono font-bold text-lg flex items-center justify-center">
                3
              </div>
              <h3 className="text-lg font-bold text-white">{t("step3Title")}</h3>
              <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
                {t("step3Desc")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE DIAGNOSTIC FEEDBACK */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <FeedbackForm />
      </div>

    </section>
  );
};
