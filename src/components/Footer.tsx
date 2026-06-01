import React from "react";
import { Activity, ShieldCheck, Cpu } from "lucide-react";
import { useApp } from "../context/AppContext";

export const Footer: React.FC = () => {
  const { t } = useApp();

  return (
    <footer className="bg-black/40 border-t border-white/5 py-12 px-6 mt-16 text-slate-400 font-sans text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Footer info Column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-cyan-400 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              DiaCare AI
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            {t("footerDesc")}
          </p>
        </div>

        {/* Technical architecture specs */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold font-mono tracking-wider text-cyan-300 uppercase">
             {t("terminalCredentials")}
          </h4>
          <div className="space-y-2 text-xs font-mono text-slate-400">
            <div className="flex items-center space-x-2">
              <Cpu className="h-3.5 w-3.5 text-purple-400" />
              <span>{t("viteReactEngine")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
              <span>{t("firebaseSecure")}</span>
            </div>
            <div className="text-[10px] text-slate-500">
              UTC Connection: 2026-05-31 Standard Terminal
            </div>
          </div>
        </div>

        {/* Disclaimer Column */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-2">
          <h5 className="text-xs font-bold font-sans text-cyan-300 flex items-center space-x-1">
            <span>{t("disclaimerTitle")}</span>
          </h5>
          <p className="text-[11px] text-slate-400 leading-normal font-sans">
            {t("disclaimerText")}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 font-mono">
        <div>
          &copy; {new Date().getFullYear()} {t("allRightsReserved")}
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <span className="hover:text-gray-400 cursor-pointer">{t("standardsReady")}</span>
          <span>&middot;</span>
          <span className="hover:text-gray-400 cursor-pointer">{t("securityProtocol")}</span>
        </div>
      </div>
    </footer>
  );
};
