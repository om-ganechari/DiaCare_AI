import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { PredictionMetrics } from "../types";
import { Activity, ShieldAlert, CheckCircle, HelpCircle, Sparkles } from "lucide-react";
import axios from "axios";
import { sendAssessmentReport } from "../services/emailService";

export const PredictionForm: React.FC = () => {
  const { addPrediction, setCurrentPage, t, user, userProfile, assessments, setEmailStatus } = useApp();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [metrics, setMetrics] = useState<PredictionMetrics>({
    pregnancies: 0,
    glucose: 120,
    bloodPressure: 80,
    skinThickness: 20,
    insulin: 85,
    bmi: 24.5,
    pedigree: 0.47,
    age: 32,
  });

  const handleInputChange = (key: keyof PredictionMetrics, value: number) => {
    setMetrics((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const autofillTemplate = (type: "healthy" | "high_risk") => {
    if (type === "healthy") {
      setMetrics({
        pregnancies: 1,
        glucose: 88,
        bloodPressure: 72,
        skinThickness: 15,
        insulin: 45,
        bmi: 21.4,
        pedigree: 0.24,
        age: 26,
      });
    } else {
      setMetrics({
        pregnancies: 4,
        glucose: 168,
        bloodPressure: 92,
        skinThickness: 38,
        insulin: 195,
        bmi: 38.6,
        pedigree: 0.89,
        age: 48,
      });
    }
  };

  const handlePredictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setEmailStatus(null);

    try {
      // Send parameters directly to full-stack endpoint
      const response = await axios.post("/api/predict", metrics);

      if (response.data && response.data.success) {
        const { riskPercentage, riskLevel, insights } = response.data;
        // Record predictions to Firestore DB to track audit history
        await addPrediction(metrics, riskPercentage, riskLevel, insights);

        // Fetch user demographics
        const mailUserEmail = userProfile?.email || user?.email || "";
        const mailUserName = userProfile?.name || user?.displayName || "Practitioner";

        if (mailUserEmail) {
          const estimatedHealthScore = Math.max(
            95 - Math.round(riskPercentage / 2.5) - (assessments[0] ? Math.round(assessments[0].riskScore / 5) : 0),
            10
          );

          // Asynchronously dispatch EmailJS summary report
          sendAssessmentReport({
            user_name: mailUserName,
            user_email: mailUserEmail,
            prediction: `Diabetes Predictive Analysis (Insulin: ${metrics.insulin} uIU/mL, Glucose: ${metrics.glucose} mg/dL, BMI: ${metrics.bmi} kg/m²). ${insights.substring(0, 300)}...`,
            risk_level: `${riskLevel} RISK`,
            health_score: estimatedHealthScore,
            date: new Date().toLocaleString(),
          })
            .then((res) => {
              if (res.success) {
                setEmailStatus({
                  type: "success",
                  message: `${t("sendEmailSuccess") || "Report sent to email successfully!"} (Sent to ${mailUserEmail})`,
                });
              } else {
                console.warn("Automated EmailJS trigger skipped:", res.error);
                setEmailStatus({
                  type: "error",
                  message: `${t("sendEmailError") || "Failed to dispatch email."} (${res.error})`,
                });
              }
            })
            .catch((mailErr) => {
              console.error("Automated email dispatch execution error:", mailErr);
              setEmailStatus({
                type: "error",
                message: `Failed to execute automatic email dispatch.`,
              });
            });
        }

        // Switch view to Results
        setCurrentPage("results");
      } else {
        setErrorMsg("Failed to generate custom clinical predictive insights. Check connection.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.error || err.message || "Failed to contact metabolic neural computing node.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center p-4 md:p-8 bg-[#050816] font-sans text-left">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-4 gap-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center space-x-2">
              <Activity className="h-6 w-6 text-cyan-300" />
              <span>{t("navPredictor")}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Input metabolic biomarkers into the DiaCare AI diagnostic predictor engine.
            </p>
          </div>

          {/* Quick presets templates */}
          <div className="flex items-center space-x-2 bg-white/5 border border-white/10 p-1.5 rounded-lg self-start">
            <span className="text-[9px] font-mono font-bold text-cyan-300 pl-2 pr-1 uppercase">
              Autofill:
            </span>
            <button
               onClick={() => autofillTemplate("healthy")}
               className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
            >
              Healthy Profile
            </button>
            <button
               onClick={() => autofillTemplate("high_risk")}
               className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer"
            >
              High-Risk Profile
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs text-center leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePredictSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Pregnancies */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                <span>{t("pregnancies")}</span>
              </label>
              <input
                type="number"
                required
                min={0}
                max={20}
                value={metrics.pregnancies}
                onChange={(e) => handleInputChange("pregnancies", parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-300 focus:bg-white/10 focus:outline-none transition-all text-xs font-sans"
              />
            </div>

            {/* Plasma Glucose */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                <span className="text-amber-400 font-extrabold">*</span>
                <span>{t("glucose")}</span>
              </label>
              <input
                type="number"
                required
                min={40}
                max={400}
                value={metrics.glucose}
                onChange={(e) => handleInputChange("glucose", parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-amber-500/30 text-white focus:border-amber-400 focus:bg-white/10 focus:outline-none transition-all text-xs font-sans"
              />
            </div>

            {/* Blood Pressure */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                <span>{t("bloodPressure")}</span>
              </label>
              <input
                type="number"
                required
                min={30}
                max={200}
                value={metrics.bloodPressure}
                onChange={(e) => handleInputChange("bloodPressure", parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-300 focus:bg-white/10 focus:outline-none transition-all text-xs font-sans"
              />
            </div>

            {/* Skin Thickness */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                <span>{t("skinThickness")}</span>
              </label>
              <input
                type="number"
                required
                min={0}
                max={100}
                value={metrics.skinThickness}
                onChange={(e) => handleInputChange("skinThickness", parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-300 focus:bg-white/10 focus:outline-none transition-all text-xs font-sans"
              />
            </div>

            {/* Insulin Levels */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                <span>{t("insulin")}</span>
              </label>
              <input
                type="number"
                required
                min={0}
                max={800}
                value={metrics.insulin}
                onChange={(e) => handleInputChange("insulin", parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-300 focus:bg-white/10 focus:outline-none transition-all text-xs font-sans"
              />
            </div>

            {/* BMI Index */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                <span className="text-amber-400 font-extrabold">*</span>
                <span>{t("bmi")}</span>
              </label>
              <input
                type="number"
                step="0.1"
                required
                min={10}
                max={70}
                value={metrics.bmi}
                onChange={(e) => handleInputChange("bmi", parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-amber-500/30 text-white focus:border-amber-400 focus:bg-white/10 focus:outline-none transition-all text-xs font-sans"
              />
            </div>

            {/* Pedigree Function value */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                <span>{t("pedigree")}</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                min={0.01}
                max={3.0}
                value={metrics.pedigree}
                onChange={(e) => handleInputChange("pedigree", parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-cyan-300 focus:bg-white/10 focus:outline-none transition-all text-xs font-sans"
              />
            </div>

            {/* Age value */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center space-x-1.5">
                <span className="text-amber-400 font-extrabold">*</span>
                <span>{t("age")}</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={120}
                value={metrics.age}
                onChange={(e) => handleInputChange("age", parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-amber-500/30 text-white focus:border-amber-400 focus:bg-white/10 focus:outline-none transition-all text-xs font-sans"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-sans font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                <span>Computing neural metabolic risk...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5 text-black animate-pulse" />
                <span>{t("diagnoseBtn")}</span>
              </>
            )}
          </button>
        </form>

        {/* Small educational note at footer */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] text-slate-400 font-sans leading-normal">
          <span className="font-bold text-cyan-300">💡 Clinical Note:</span> The diabetes pedigree function calculates hereditary coefficients of risk based on direct family history records. If insulin/skin thickness parameters are unknown, standard clinical averages (85 μIU/mL, 20mm) can be maintained.
        </div>

      </div>
    </div>
  );
};
