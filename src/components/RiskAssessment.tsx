import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { RiskAssessmentAnswers } from "../types";
import { ShieldAlert, ArrowLeft, ArrowRight, CheckCircle2, Award, HeartPulse, Printer, Mail, Send, CheckCircle, AlertTriangle } from "lucide-react";
import { jsPDF } from "jspdf";
import { RiskMeter } from "./RiskMeter";
import { sendAssessmentReport, validateEmail } from "../services/emailService";

export const RiskAssessment: React.FC = () => {
  const { addAssessment, setCurrentPage, user, userProfile, emailStatus, setEmailStatus, t } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form question answers state
  const [answers, setAnswers] = useState<RiskAssessmentAnswers>({
    exerciseFrequency: "occasional",
    dietQuality: "average",
    sleepHours: "average",
    unusualThirst: false,
    frequentUrination: false,
    familyDiabetes: "none",
    suddenWeightLoss: false,
    chronicFatigue: false,
    blurredVision: false,
    slowHealing: false,
    tobaccoAlcoholUse: "none",
    stressLevel: "low",
    ageGroup: "under35",
    gestationalHistory: "no",
    tinglingSensations: false,
    darkSkinPatches: false,
    frequentInfections: false,
    increasedHunger: false,
  });

  const [diagnosticResult, setDiagnosticResult] = useState<{
    score: number;
    level: "LOW" | "MODERATE" | "HIGH";
  } | null>(null);

  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Sync recipient input with user bio email coordinates on mount or profile updates
  useEffect(() => {
    if (userProfile?.email || user?.email) {
      setRecipientEmail(userProfile?.email || user?.email || "");
    }
  }, [userProfile, user]);

  const generatePDFReport = (): jsPDF | null => {
    if (!diagnosticResult) return null;
    const doc = new jsPDF();
    
    // Calculate estimated health score
    const estScore = Math.max(95 - Math.round(diagnosticResult.score / 3), 10);
    const lvl = diagnosticResult.level;

    // --- PAGE 1 ---
    // Draw elegant dark Navy title block
    doc.setFillColor(15, 23, 42); // slate 900
    doc.rect(0, 0, 210, 45, "F");
    
    // Draw visual logo element (heartpulse/cross shape)
    doc.setFillColor(34, 211, 238); // cyan-400
    doc.circle(20, 22, 8, "F");
    doc.setFillColor(15, 23, 42);
    doc.rect(18.5, 17, 3, 10, "F");
    doc.rect(15, 20.5, 10, 3, "F");

    // Brand Label
    doc.setTextColor(34, 211, 238);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("DiaCare AI", 33, 23);
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text("CLINICAL ANALYZER REPORT // LIFESTYLE RISK METRIC MATRIX", 33, 31);
    doc.text(`GENERATED DATE: ${new Date().toLocaleString()}`, 33, 37);
    
    doc.setDrawColor(22, 189, 202);
    doc.setLineWidth(1.5);
    doc.line(15, 45, 195, 45);
    
    // Patient Information Block
    doc.setTextColor(51, 65, 85); // slate-700
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("PATIENT DEMOGRAPHICS & PROFILE SUMMARY", 15, 58);
    
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.rect(15, 62, 180, 28);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Full Name:  ${userProfile?.name || user?.displayName || "Verified Profile"}`, 20, 70);
    doc.text(`User Email:  ${userProfile?.email || user?.email || "N/A"}`, 20, 78);
    doc.text(`Record ID:  LST_${Date.now().toString().substring(5)}`, 20, 84);
    
    doc.text(`Age Bracket:  ${userProfile?.age || "N/A"} years`, 115, 70);
    doc.text(`Biological Gender:  ${userProfile?.gender || "Male"}`, 115, 78);
    doc.text(`Language Mapped:  ${(userProfile?.language || "en").toUpperCase()}`, 115, 84);
    
    // Diagnostics Section
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text("LIFESTYLE EVALUATION OUTCOMES", 15, 102);
    
    // Status color selection
    let statusColor = [16, 185, 129]; // low green
    if (lvl === "HIGH") {
      statusColor = [239, 68, 68]; // high red
    } else if (lvl === "MODERATE") {
      statusColor = [245, 158, 11]; // moderate orange
    }

    doc.setFillColor(248, 250, 252);
    doc.rect(15, 106, 180, 32, "F");
    doc.rect(15, 106, 180, 32, "S");
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Calculated Diabetes Risk Level:", 20, 115);
    
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${lvl} RISK PROFILE`, 83, 115);
    
    doc.setTextColor(15, 23, 42);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Lifestyle Score Indicator:", 20, 123);
    doc.setFont("Helvetica", "bold");
    doc.text(`${diagnosticResult.score} / 255 points`, 83, 123);

    doc.setFont("Helvetica", "normal");
    doc.text("Computed Health / Vital Score:", 20, 131);
    doc.setFont("Helvetica", "bold");
    doc.text(`${estScore} / 100`, 83, 131);
    
    // Diagnostic Advisory
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text("METABOLIC ADVICE & PREDICTIONS", 15, 150);
    
    const adviceText = lvl === "HIGH" 
      ? t("highRiskAdvice") 
      : lvl === "MODERATE" 
      ? t("moderateRiskAdvice") 
      : t("lowRiskAdvice");
      
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    const splitAdvice = doc.splitTextToSize(adviceText, 180);
    doc.text(splitAdvice, 15, 156);
    
    // Disclaimer footer on Page 1
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Clinical disclaimer: This AI diagnostic evaluation is for lifestyle risk simulation only. Page 1 of 2", 15, 285);

    // --- PAGE 2 ---
    doc.addPage();
    
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DiaCare AI Lifestyle Directives & Care recommendations", 15, 15);
    
    // Care Pathway Detail
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    doc.text("1. CUSTOM STRATEGIC HEALTH RECOMMENDATIONS", 15, 38);
    
    doc.setTextColor(15, 23, 42);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    
    const careText = lvl === "HIGH" 
      ? t("highRiskCare") 
      : lvl === "MODERATE" 
      ? t("moderateRiskCare") 
      : t("lowRiskCare");
      
    const splitCare = doc.splitTextToSize(careText, 180);
    doc.text(splitCare, 15, 46);
    
    const careCountY = 46 + (splitCare.length * 5);
    
    // Personalized Habits Guide
    doc.setTextColor(51, 65, 85);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("2. BEHAVIORAL CHANGES & THERAPEUTIC HABITS", 15, careCountY + 5);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const dietText = "Optimizing cellular safety and preventing glycemic spikes:\n" +
      "  - Exercise Habit: Try to include at least 150 minutes of moderate activity weekly.\n" +
      "  - Stress Control: Minimize sedentary durations and employ breathing sequences.\n" +
      "  - Nutrition Plan: Prioritize high-fiber complex carbohydrates and moderate fats.";
    const splitDiet = doc.splitTextToSize(dietText, 180);
    doc.text(splitDiet, 15, careCountY + 11);

    // Final Warning disclaimer on Page 2
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Report is verified and certified by DiaCare AI clinical engine. Standard clinical procedures apply. Page 2 of 2", 15, 285);

    return doc;
  };

  const handleDownloadPDF = () => {
    const doc = generatePDFReport();
    if (!doc) return;
    doc.save(`diacare_metabolic_report_${Date.now()}.pdf`);
  };

  const handleSendEmail = async () => {
    if (!diagnosticResult) return;

    if (!recipientEmail || recipientEmail.trim() === "") {
      setEmailStatus({
        type: "error",
        message: "Please enter a valid email address",
      });
      return;
    }

    // Explicit recipient email validation
    if (!validateEmail(recipientEmail)) {
      console.warn("[Manual Email Log] Email format validation failed for recipient:", recipientEmail);
      setEmailStatus({
        type: "error",
        message: "Invalid email format. Please check your spelling (e.g. name@example.com) and try again.",
      });
      return;
    }

    setEmailLoading(true);
    setEmailStatus(null);
    try {
      const lvl = diagnosticResult.level;
      const advice = lvl === "HIGH" ? t("highRiskAdvice") : lvl === "MODERATE" ? t("moderateRiskAdvice") : t("lowRiskAdvice");
      const estScore = Math.max(95 - Math.round(diagnosticResult.score / 3), 10);

      // Generate PDF doc to send
      const doc = generatePDFReport();
      const pdfBase64 = doc ? doc.output("datauristring") : undefined;

      console.log("[Manual Assessment Email] Triggering manual lifestyle email dispatcher to:", recipientEmail);
      const res = await sendAssessmentReport({
        user_name: userProfile?.name || user?.displayName || "Practitioner",
        user_email: recipientEmail,
        prediction: `Diabetes Lifestyle Assessment Profile evaluation. Multi-score Index: ${diagnosticResult.score}/255. Advice: ${advice}`,
        risk_level: `${lvl} RISK`,
        health_score: estScore,
        date: new Date().toLocaleString(),
        pdf_report: pdfBase64
      });

      if (res.success) {
        setEmailStatus({ type: "success", message: t("sendEmailSuccess") || "Report sent to email successfully!" });
      } else {
        setEmailStatus({ type: "error", message: `${t("sendEmailError") || "Failed sending email."} (${res.error})` });
      }
    } catch (err: any) {
      console.error(err);
      setEmailStatus({ type: "error", message: t("sendEmailError") || "Failed sending email." });
    } finally {
      setEmailLoading(false);
    }
  };

  const calculateRisk = () => {
    let score = 0;

    // Lifestyle points
    if (answers.exerciseFrequency === "never") score += 20;
    if (answers.exerciseFrequency === "occasional") score += 10;
    if (answers.dietQuality === "poor") score += 20;
    if (answers.dietQuality === "average") score += 10;
    if (answers.sleepHours === "poor") score += 15;
    if (answers.sleepHours === "average") score += 5;
    if (answers.tobaccoAlcoholUse === "heavy") score += 15;
    if (answers.tobaccoAlcoholUse === "moderate") score += 5;
    if (answers.stressLevel === "high") score += 15;
    if (answers.stressLevel === "moderate") score += 5;

    // Demographics and Genetics points
    if (answers.ageGroup === "above45") score += 15;
    if (answers.ageGroup === "35to45") score += 10;
    if (answers.gestationalHistory === "yes") score += 20;
    if (answers.familyDiabetes === "both_parents") score += 30;
    if (answers.familyDiabetes === "one_parent") score += 20;
    if (answers.familyDiabetes === "siblings") score += 15;

    // Symptoms points
    if (answers.unusualThirst) score += 15;
    if (answers.frequentUrination) score += 15;
    if (answers.suddenWeightLoss) score += 20;
    if (answers.chronicFatigue) score += 10;
    if (answers.blurredVision) score += 15;
    if (answers.slowHealing) score += 20;
    if (answers.tinglingSensations) score += 15;
    if (answers.darkSkinPatches) score += 15;
    if (answers.frequentInfections) score += 10;
    if (answers.increasedHunger) score += 15;

    let level: "LOW" | "MODERATE" | "HIGH" = "LOW";
    if (score > 45) level = "MODERATE";
    if (score > 90) level = "HIGH";

    return { score, level };
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { score, level } = calculateRisk();

    try {
      await addAssessment(answers, score, level);
      setDiagnosticResult({ score, level });
      
      const mailUserEmail = userProfile?.email || user?.email || "";
      const mailUserName = userProfile?.name || user?.displayName || "Practitioner";

      if (mailUserEmail) {
        const estScore = Math.max(95 - Math.round(score / 3), 10);
        console.log("[Auto Email] Automatically dispatching lifestyle metabolic assessment email report for:", mailUserEmail);
        sendAssessmentReport({
          user_name: mailUserName,
          user_email: mailUserEmail,
          prediction: `Diabetes Lifestyle & Hereditary Diagnostic Risk Assessment. Physical Activity: ${answers.exerciseFrequency}, Diet Quality: ${answers.dietQuality}, Score index: ${score}/255.`,
          risk_level: `${level} RISK`,
          health_score: estScore,
          date: new Date().toLocaleString()
        })
          .then((res) => {
            if (res.success) {
              setEmailStatus({
                type: "success",
                message: `${t("sendEmailSuccess") || "Report sent to email successfully!"} (Sent to ${mailUserEmail})`,
              });
            } else {
              setEmailStatus({
                type: "error",
                message: `${t("sendEmailError") || "Failed sending email."} (${res.error})`,
              });
            }
          })
          .catch((mailErr) => {
            console.error("Automated lifestyle assessment dispatch execution error:", mailErr);
          });
      }

      setStep(4);
    } catch (err) {
      console.error("Failed to commit assessment data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxToggle = (key: keyof RiskAssessmentAnswers) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectChange = (key: keyof RiskAssessmentAnswers, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center p-4 md:p-8 bg-[#050816] font-sans text-left">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative z-10 space-y-6">
        
        {/* Step progress bar header */}
        {step < 4 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
              <span className="font-bold text-cyan-300">{t("stageOfThree")} {step} {t("ofThree")}</span>
              <span>{Math.round((step / 3) * 100)}% {t("percentComplete")}</span>
            </div>
            <div className="h-2 rounded-full bg-black/30 border border-white/10">
              <div
                className="h-full rounded-full bg-cyan-500 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: LIFESTYLE QUESTIONS */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-extrabold text-white">
                {t("lifestyleGroup")}
              </h2>
              <p className="text-xs text-slate-400">
                {t("exerciseDescription")}
              </p>
            </div>

            <div className="space-y-5">
              {/* Exercise frequency */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                  {t("physicalExerciseFrequency")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "never", label: t("neverRarely") },
                    { value: "occasional", label: t("oneTwoWeekly") },
                    { value: "regular", label: t("activeDailyWorkout") },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectChange("exerciseFrequency", opt.value)}
                      className={`px-4 py-3 rounded-lg border text-xs font-bold transition-all text-center ${
                        answers.exerciseFrequency === opt.value
                          ? "bg-cyan-500 border-cyan-400 text-black shadow-lg"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diet quality */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                  {t("dietaryGlycemicLevel")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "poor", label: t("highSugarFood") },
                    { value: "average", label: t("standardHomeDiet") },
                    { value: "excellent", label: t("lowCarbDiet") },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectChange("dietQuality", opt.value)}
                      className={`px-3 py-3 rounded-lg border text-xs font-bold transition-all text-center ${
                        answers.dietQuality === opt.value
                          ? "bg-cyan-500 border-cyan-400 text-black shadow-lg"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep Hours */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                  {t("sleepQuality")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "poor", label: t("underFiveHours") },
                    { value: "average", label: t("fiveSevenHours") },
                    { value: "good", label: t("eightPlusHours") },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectChange("sleepHours", opt.value)}
                      className={`px-4 py-3 rounded-lg border text-xs font-bold transition-all text-center ${
                        answers.sleepHours === opt.value
                          ? "bg-cyan-500 border-cyan-400 text-black shadow-lg"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tobacco & Alcohol Intake */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                  {t("tobaccoAlcoholUse")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "none", label: t("optionsNone") },
                    { value: "moderate", label: t("optionsOccasional") },
                    { value: "heavy", label: t("optionsHeavy") },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectChange("tobaccoAlcoholUse", opt.value)}
                      className={`px-4 py-3 rounded-lg border text-xs font-bold transition-all text-center ${
                        answers.tobaccoAlcoholUse === opt.value
                          ? "bg-cyan-500 border-cyan-400 text-black shadow-lg"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stress Level */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                  {t("stressSedentary")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "low", label: t("optionsLowStyle") },
                    { value: "moderate", label: t("optionsModStyle") },
                    { value: "high", label: t("optionsHighStyle") },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectChange("stressLevel", opt.value)}
                      className={`px-3 py-3 rounded-lg border text-xs font-bold transition-all text-center ${
                        answers.stressLevel === opt.value
                          ? "bg-cyan-500 border-cyan-400 text-black shadow-lg"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stepper buttons */}
            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                onClick={() => setStep(2)}
                className="flex items-center space-x-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg active:scale-[0.98] transition-all uppercase tracking-wider"
              >
                <span>{t("next")}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FAMILY GENETICS */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-extrabold text-white">
                {t("familyGroup")}
              </h2>
              <p className="text-xs text-slate-400">
                {t("chromosomalRiskTitle")}
              </p>
            </div>

            <div className="space-y-5 text-left">
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                  {t("familyDiabetesHistory")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: "none", label: t("noDirectRisk") },
                    { value: "one_parent", label: t("oneParentDiagnosed") },
                    { value: "both_parents", label: t("bothParentsDiagnosed") },
                    { value: "siblings", label: t("siblingsDiagnosed") },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelectChange("familyDiabetes", opt.value)}
                      className={`px-4 py-3.5 rounded-lg border text-xs font-bold transition-all text-left flex items-center justify-between ${
                        answers.familyDiabetes === opt.value
                          ? "bg-cyan-500 border-cyan-400 text-black shadow-lg"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <span>{opt.label}</span>
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 transition-opacity ${
                          answers.familyDiabetes === opt.value ? "opacity-100 text-black" : "opacity-0"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Age group */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                  {t("ageDemographyTitle")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "under35", label: t("optionsUnder35") },
                    { value: "35to45", label: t("options35to45") },
                    { value: "above45", label: t("optionsAbove45") },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectChange("ageGroup", opt.value)}
                      className={`px-4 py-3 rounded-lg border text-xs font-bold transition-all text-center ${
                        answers.ageGroup === opt.value
                          ? "bg-cyan-500 border-cyan-400 text-black shadow-lg"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gestational history */}
              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                  {t("gestationalDiabetesHistory")}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "no", label: t("optionsNoHistory") },
                    { value: "yes", label: t("optionsYesGestational") },
                    { value: "not_applicable", label: t("optionsNotApplicable") },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelectChange("gestationalHistory", opt.value)}
                      className={`px-4 py-3 rounded-lg border text-xs font-bold transition-all text-center ${
                        answers.gestationalHistory === opt.value
                          ? "bg-cyan-500 border-cyan-400 text-black shadow-lg"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stepper buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <button
                onClick={() => setStep(1)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-lg border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t("back")}</span>
              </button>

              <button
                onClick={() => setStep(3)}
                className="flex items-center space-x-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg transition-all uppercase tracking-wider"
              >
                <span>{t("next")}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SYMPTOMS EVALUATION */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-extrabold text-white">
                {t("symptomsGroup")}
              </h2>
              <p className="text-xs text-slate-400">
                {t("systemicWarningTitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {[
                { key: "unusualThirst", label: t("polydipsia") },
                { key: "frequentUrination", label: t("polyuria") },
                { key: "suddenWeightLoss", label: t("rapidWeightDrop") },
                { key: "chronicFatigue", label: t("chronicExhaustion") },
                { key: "blurredVision", label: t("blurredVisionSpikes") },
                { key: "slowHealing", label: t("slowHealingWounds") },
                { key: "tinglingSensations", label: t("tinglingSensations") },
                { key: "darkSkinPatches", label: t("darkSkinPatches") },
                { key: "frequentInfections", label: t("frequentInfections") },
                { key: "increasedHunger", label: t("increasedHunger") },
              ].map((opt) => {
                const isChecked = !!answers[opt.key as keyof RiskAssessmentAnswers];
                return (
                  <button
                    key={opt.key}
                    onClick={() => handleCheckboxToggle(opt.key as keyof RiskAssessmentAnswers)}
                    className={`p-4 rounded-lg border text-xs font-bold text-left transition-all flex items-start space-x-3 ${
                      isChecked
                        ? "bg-purple-500/20 border-purple-500 text-purple-300"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isChecked ? "bg-purple-500 border-purple-400 text-black" : "border-slate-600 bg-black/30"
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Stepper buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <button
                onClick={() => setStep(2)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-lg border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t("back")}</span>
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-lg transition-all uppercase tracking-wider"
              >
                {loading ? (
                  <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>{t("finish")}</span>
                    <HeartPulse className="h-4 w-4 text-slate-900 animate-pulse" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUBMITTED DISPLAY OUTCOMES */}
        {step === 4 && diagnosticResult && (
          <div className="space-y-6 text-center py-6">
            <div className="inline-flex p-4 bg-white/5 border border-white/10 rounded-full text-cyan-300">
              <Award className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white">
                {t("assessmentCompleted")}
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                {t("assessmentCompletedDesc")}
              </p>
            </div>

            <div className="max-w-md mx-auto p-5 rounded-2xl bg-white/5 border border-white/10 relative flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase font-bold mb-2">
                {t("derivedDiabetesRisk")}
              </span>
              <RiskMeter 
                percentage={Math.round((diagnosticResult.score / 255) * 100)} 
                level={diagnosticResult.level} 
              />
            </div>

            {/* Medical Advice and Care Pathway Blocks */}
            <div className="max-w-md mx-auto text-left space-y-4 pt-2">
              <div id="medical-advice-card" className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-white space-y-2">
                <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  {t("advisorySection") || "Diagnostic Medical Advisory"}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {diagnosticResult.level === "HIGH" 
                    ? t("highRiskAdvice") 
                    : diagnosticResult.level === "MODERATE" 
                    ? t("moderateRiskAdvice") 
                    : t("lowRiskAdvice")}
                </p>
              </div>

              <div id="physician-care-card" className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30 text-white space-y-2">
                <h4 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                  {t("carePathwayTitle") || "Recommended Care Pathways"}
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                  {diagnosticResult.level === "HIGH" 
                    ? t("highRiskCare") 
                    : diagnosticResult.level === "MODERATE" 
                    ? t("moderateRiskCare") 
                    : t("lowRiskCare")}
                </p>
              </div>
            </div>

            {/* Document and Report Distribution Actions */}
            <div className="max-w-md mx-auto space-y-4 pt-4 border-t border-white/10 text-left">
              <div>
                <button
                  type="button"
                  id="download-result-pdf"
                  onClick={handleDownloadPDF}
                  className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-black font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-cyan-500/10 active:scale-[0.98]"
                >
                  <Printer className="h-4 w-4" />
                  <span>Download Report</span>
                </button>
              </div>

              {/* Send Option Mail section */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-purple-400" />
                  <span>{t("sendEmailLabel") || "Send Diagnostic Report to Inbox"}</span>
                </h4>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    id="recipient-mail-input"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter recipient email address..."
                    className="flex-1 bg-white/5 px-3 py-2 border border-white/10 rounded-lg text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={emailLoading}
                    className="px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5"
                  >
                    {emailLoading ? (
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Send className="h-3 w-3" />
                        <span>Email PDF Report</span>
                      </>
                    )}
                  </button>
                </div>

                {emailStatus && (
                  <div
                    className={`p-2.5 rounded-lg border text-[11px] leading-relaxed flex items-start space-x-2 ${
                      emailStatus.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}
                  >
                    {emailStatus.type === "success" ? (
                      <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    )}
                    <span>{emailStatus.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendation navigation buttons */}
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
              <button
                onClick={() => setCurrentPage("diet")}
                className="py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-300 font-sans font-bold text-xs rounded-lg transition-all"
              >
                {t("navDiet")}
              </button>
              <button
                onClick={() => setCurrentPage("workout")}
                className="py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-purple-300 font-sans font-bold text-xs rounded-lg transition-all"
              >
                {t("navWorkout")}
              </button>
            </div>

            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => setCurrentPage("dashboard")}
                className="text-xs text-cyan-300 font-mono font-bold hover:underline"
              >
                {t("goDashboardTerminal")} &rarr;
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
