import React, { useState } from "react";
import { useApp, Page } from "../context/AppContext";
import { Language } from "../types";
import { Activity, ShieldAlert, FileText, Settings, LogOut, Menu, X, Landmark, HeartHandshake, Dumbbell, Sparkles } from "lucide-react";

export const Header: React.FC = () => {
  const { user, userProfile, language, setLanguage, currentPage, setCurrentPage, logout, t } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    setMenuOpen(false);
  };

  const navItems = user
    ? [
        { page: "dashboard" as Page, label: t("navDashboard"), icon: Landmark },
        { page: "assessment" as Page, label: t("navAssessment"), icon: ShieldAlert },
        { page: "prediction" as Page, label: t("navPredictor"), icon: Activity },
        { page: "diet" as Page, label: t("navDiet"), icon: HeartHandshake },
        { page: "workout" as Page, label: t("navWorkout"), icon: Dumbbell },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 bg-white/5 border-b border-white/10 backdrop-blur-md px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and App Name */}
        <div 
          onClick={() => navigateTo("landing")} 
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <div className="bg-gradient-to-br from-cyan-400 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-105">
            <Activity className="h-5 w-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <span className="font-sans font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-white">
              DiaCare AI
            </span>
            <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              METABOLIC TERMINAL
            </div>
          </div>
        </div>

        {/* Desktop Navigation Items */}
        {user && (
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => navigateTo(item.page)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg font-sans text-sm font-medium transition-colors ${
                    isActive
                      ? "text-cyan-300 bg-white/10"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 text-cyan-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Global Controls */}
        <div className="hidden lg:flex items-center space-x-3">
          {/* Language selection dropdown dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="px-3 py-1.5 rounded-lg font-sans text-xs font-bold text-cyan-300 border border-white/10 hover:bg-white/5 transition-all flex items-center space-x-1"
            >
              <Sparkles className="h-3 w-3" />
              <span>
                {language === "en" ? "EN" : language === "hi" ? "हिंदी" : "मराठी"}
              </span>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-28 rounded-xl bg-slate-900 border border-white/10 p-1 shadow-2xl z-50">
                {(["en", "hi", "mr"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-all ${
                      language === lang
                        ? "text-cyan-300 bg-white/10"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lang === "en" ? "English" : lang === "hi" ? "हिंदी" : "मराठी"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              {/* Profile Image & Name display */}
              <div 
                onClick={() => navigateTo("profile")} 
                className="flex items-center space-x-2 px-2 py-1 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer"
                title={t("navProfile")}
              >
                {userProfile?.photoURL || user?.photoURL ? (
                  <img
                    src={userProfile?.photoURL || user?.photoURL || ""}
                    alt="profile"
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-lg object-cover border border-cyan-500/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center font-bold text-xs text-white uppercase select-none">
                    {(userProfile?.name || user?.displayName || "U").charAt(0)}
                  </div>
                )}
                <span className="hidden xl:inline-block font-sans text-xs font-semibold text-slate-300 max-w-[110px] truncate">
                  {userProfile?.name || user?.displayName || "User"}
                </span>
              </div>

              {/* Profile settings button */}
              <button
                onClick={() => navigateTo("profile")}
                className={`p-2 rounded-lg border transition-all ${
                  currentPage === "profile"
                    ? "bg-white/15 border-white/20 text-cyan-300"
                    : "border-white/10 text-slate-300 hover:bg-white/5"
                }`}
                title={t("navProfile")}
              >
                <Settings className="h-4 w-4" />
              </button>
              {/* LogOut action button */}
              <button
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 text-xs font-bold transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t("logout")}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => navigateTo("login")}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-sans text-sm font-bold shadow-lg shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {t("clinicalSignIn")}
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center space-x-2">
          {/* Quick language button on mobile */}
          <button
            onClick={() => {
              const order: Language[] = ["en", "hi", "mr"];
              const currentIndex = order.indexOf(language);
              const next = order[(currentIndex + 1) % order.length];
              setLanguage(next);
            }}
            className="px-2 py-1 rounded border border-cyan-500/30 text-[10px] font-bold text-cyan-300"
          >
            {language.toUpperCase()}
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg border border-cyan-500/20 text-gray-300 hover:text-white"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="lg:hidden mt-3 border-t border-cyan-500/10 pt-3 pb-2 flex flex-col space-y-1">
          {user ? (
            <>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.page}
                    onClick={() => navigateTo(item.page)}
                    className={`flex items-center space-x-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm font-sans font-medium transition-all ${
                      isActive
                        ? "text-cyan-400 bg-cyan-950/40 border-l-2 border-cyan-400"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 opacity-80" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <div className="border-t border-cyan-500/10 my-2 pt-2 flex flex-col space-y-1">
                <button
                  onClick={() => navigateTo("profile")}
                  className={`flex items-center space-x-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm font-sans font-medium transition-all ${
                    currentPage === "profile"
                      ? "text-purple-400 bg-purple-950/40"
                      : "text-gray-300"
                  }`}
                >
                  <Settings className="h-4.5 w-4.5" />
                  <span>{t("profileSettings")}</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm font-sans font-medium text-red-400 hover:bg-red-950/20"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  <span>{t("logout")}</span>
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => navigateTo("login")}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-center text-sm font-bold shadow-md"
            >
              {t("signInToSystem")}
            </button>
          )}
        </div>
      )}
    </nav>
  );
};
