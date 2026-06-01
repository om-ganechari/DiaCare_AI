import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { User, Settings, CheckCircle2, Languages, Star, Sparkles } from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { userProfile, updateUserProfile, language, setLanguage, t } = useApp();

  const [name, setName] = useState(userProfile?.name || "");
  const [age, setAge] = useState<number>(userProfile?.age || 30);
  const [gender, setGender] = useState(userProfile?.gender || "male");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [medicalNotes, setMedicalNotes] = useState(userProfile?.medicalNotes || "");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await updateUserProfile({
        name,
        age,
        gender,
        bio,
        medicalNotes,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] p-4 md:p-8 bg-[#050816] font-sans text-left">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px]" />

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left demographics form block */}
        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center space-x-2">
              <User className="h-6 w-6 text-cyan-300" />
              <span>{t("navProfile")}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {t("customizeClinicalFactor")}
            </p>
          </div>

          {success && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center space-x-2.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              <span>{t("demographicFactorsRegistered")}</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-400 mb-1.5 uppercase">
                  {t("fullName")}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-300 focus:bg-white/10 focus:outline-none transition-all text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-400 mb-1.5 uppercase">
                    {t("age")}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 30)}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-300 focus:bg-white/10 focus:outline-none transition-all text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-400 mb-1.5 uppercase">
                    {t("gender")}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-300 focus:bg-white/10 focus:outline-none transition-all text-xs outline-none"
                  >
                    <option value="male" className="bg-[#050816] text-white">{t("male")}</option>
                    <option value="female" className="bg-[#050816] text-white">{t("female")}</option>
                    <option value="other" className="bg-[#050816] text-white">{t("other")}</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 mb-1.5 uppercase">
                {t("activityHabitsDietNotes")}
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={t("sedentaryPlaceholder")}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-300 focus:bg-white/10 focus:outline-none transition-all text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 mb-1.5 uppercase">
                {t("clinicalDiagnosisMedicineNotes")}
              </label>
              <textarea
                rows={3}
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder={t("medicationPlaceholder")}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-300 focus:bg-white/10 focus:outline-none transition-all text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-sans font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              {loading ? t("syncing") : t("updateCoordinatesBtn")}
            </button>
          </form>
        </div>

        {/* Right regional translation panel links */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Lanuage custom cards */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4 text-left">
            <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
              <Languages className="h-4 w-4 text-purple-400" />
              <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-widest">
                 {t("systemLanguage")}
              </h3>
            </div>

            <div className="space-y-2">
              {[
                { code: "en", label: t("englishLanguage"), localized: "Standard English" },
                { code: "hi", label: t("hindiLanguage"), localized: "हिंदी" },
                { code: "mr", label: t("marathiLanguage"), localized: "मराठी" },
              ].map((langItem) => {
                const isActive = language === langItem.code;
                return (
                  <button
                    key={langItem.code}
                    onClick={() => setLanguage(langItem.code as any)}
                    className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? "bg-purple-500/10 border-purple-500 text-purple-300 font-bold"
                        : "bg-white/5 border border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold">{langItem.label}</div>
                      <div className="text-[10px] font-mono opacity-65">{langItem.localized}</div>
                    </div>
                    {isActive && <CheckCircle2 className="h-4.5 w-4.5 text-purple-300" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] text-slate-400 leading-normal text-left flex items-start space-x-2.5">
            <Star className="h-4 w-4 text-cyan-300 shrink-0 mt-0.5" />
            <span>{t("providingParametersTip")}</span>
          </div>

        </div>

      </div>
    </div>
  );
};
