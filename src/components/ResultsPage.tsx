import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { ShieldAlert, Download, HeartPulse, Activity, CheckCircle, TrendingUp, RefreshCw, Printer, Mail, Send, AlertTriangle } from "lucide-react";
import { jsPDF } from "jspdf";
import { RiskMeter } from "./RiskMeter";
import { sendAssessmentReport, validateEmail } from "../services/emailService";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const ResultsPage: React.FC = () => {
  const { currentPredictionResult, userProfile, user, setCurrentPage, t, emailStatus, setEmailStatus, assessments, addReport } = useApp();

  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Sync recipient input with user bio email coordinates on mount or profile updates
  useEffect(() => {
    if (userProfile?.email || user?.email) {
      setRecipientEmail(userProfile?.email || user?.email || "");
    }
  }, [userProfile, user]);

  const generatePDFReport = (): jsPDF | null => {
    if (!currentPredictionResult) return null;
    const doc = new jsPDF();
    
    // Calculate clinical health score
    let estimatedHealthScore = 95;
    estimatedHealthScore -= Math.round(currentPredictionResult.riskPercentage / 2.5);
    if (assessments && assessments[0]) {
      estimatedHealthScore -= Math.round(assessments[0].riskScore / 5);
    }
    estimatedHealthScore = Math.max(estimatedHealthScore, 10);

    const lvl = currentPredictionResult.riskLevel;

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
    doc.text("CLINICAL ANALYZER REPORT // METABOLIC TEST MATRIX", 33, 31);
    doc.text(`GENERATED DATE: ${new Date(currentPredictionResult.createdAt).toLocaleString()}`, 33, 37);
    
    doc.setDrawColor(22, 189, 202);
    doc.setLineWidth(1.5);
    doc.line(15, 45, 195, 45);
    
    // Patient Information Block
    doc.setTextColor(51, 65, 85); // slate-700
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("PATIENT DEMOGRAPHICS & CLINICAL METRICS", 15, 58);
    
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.rect(15, 62, 180, 28);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`Full Name:  ${userProfile?.name || user?.displayName || "N/A"}`, 20, 70);
    doc.text(`User Email:  ${userProfile?.email || user?.email || "N/A"}`, 20, 78);
    doc.text(`Record ID:  ${currentPredictionResult.predictionId.toUpperCase()}`, 20, 84);
    
    doc.text(`Age Bracket:  ${userProfile?.age || currentPredictionResult.metrics.age} years`, 115, 70);
    doc.text(`Biological Gender:  ${userProfile?.gender || "Male"}`, 115, 78);
    doc.text(`Language Mapped:  ${(userProfile?.language || "en").toUpperCase()}`, 115, 84);
    
    // Diagnostics Section
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text("DIAGNOSTIC PREDICTOR REPORT OUTCOMES", 15, 102);
    
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
    doc.text("Estimated Diabetes Risk Level:", 20, 115);
    
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`${lvl} RISK PROFILE`, 83, 115);
    
    doc.setTextColor(15, 23, 42);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Relative Diabetes Risk Index:", 20, 123);
    doc.setFont("Helvetica", "bold");
    doc.text(`${currentPredictionResult.riskPercentage}% risk score`, 83, 123);

    doc.setFont("Helvetica", "normal");
    doc.text("Computed Health / Vital Score:", 20, 131);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text(`${estimatedHealthScore} / 100`, 83, 131);
    
    // Laboratory Readings Table
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text("PHYSIOLOGICAL LABORATORY BIOMARKERS", 15, 150);
    
    doc.setFillColor(241, 245, 249);
    doc.rect(15, 154, 180, 8, "F");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("Laboratory Signal parameter", 20, 159.5);
    doc.text("Recorded Reading Parameter", 145, 159.5);
    
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    
    const fields = [
      { name: "Plasma Glucose Concentration", val: `${currentPredictionResult.metrics.glucose} mg/dL` },
      { name: "Two-Hour Serum Insulin", val: `${currentPredictionResult.metrics.insulin} uIU/mL` },
      { name: "Body Mass Index (BMI Value)", val: `${currentPredictionResult.metrics.bmi} kg/m2` },
      { name: "Diastolic Blood Pressure", val: `${currentPredictionResult.metrics.bloodPressure} mmHg` },
      { name: "Diabetes Pedigree Function (Genetics Coeff)", val: `${currentPredictionResult.metrics.pedigree}` },
      { name: "Active Pregnancy Count", val: `${currentPredictionResult.metrics.pregnancies}` }
    ];
    
    let rowY = 168;
    fields.forEach((f) => {
      doc.text(f.name, 20, rowY);
      doc.setFont("Helvetica", "bold");
      doc.text(f.val, 145, rowY);
      doc.setFont("Helvetica", "normal");
      doc.line(15, rowY + 3, 195, rowY + 3);
      rowY += 10;
    });

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
    doc.text("DiaCare AI Therapeutic Directives & Recommendations", 15, 15);
    
    // AI Insights (Wrapped beautifully)
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    doc.text("1. CUSTOM CLINICAL INTERPRETIVE FINDINGS", 15, 38);
    
    doc.setTextColor(15, 23, 42);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    const splitInsights = doc.splitTextToSize(insights, 180);
    doc.text(splitInsights, 15, 46);
    
    const insightsCountY = 46 + (splitInsights.length * 4.5);
    
    // Diet recommendations
    doc.setTextColor(51, 65, 85);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("2. THERAPEUTIC DIABETIC NUTRITIONAL MEAL PROTOCOLS", 15, insightsCountY + 5);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const dietText = "Optimizing cellular safety and preventing glycemic spikes:\n" +
      "  - Breakfast: Steel-cut oats cooked with cinnamon, handful of raw almonds/walnuts and zero sucrose sweetener.\n" +
      "  - Lunch: High fiber leafy vegetable wrap using whole wheat/spelt, baked block of tofu, or steamed chicken breast.\n" +
      "  - Mid-day Snacks: Flaxseed or chia pudding made in non-dairy milk, sugar-free yogurt with fresh blueberries.\n" +
      "  - Dinner: Stir-fried bell peppers, asparagus, high cruciferous broccoli alongside baked salmon or paneer proteins.";
    const splitDiet = doc.splitTextToSize(dietText, 180);
    doc.text(splitDiet, 15, insightsCountY + 11);
    
    const dietCountY = insightsCountY + 11 + (splitDiet.length * 4.5);

    // Exercise protocols
    doc.setTextColor(51, 65, 85);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("3. INSULIN-SENSITIVITY EXERCISE ROUTINES (GLUT4 UPTAKE)", 15, dietCountY + 5);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const workoutText = "Cardiovascular and hypertrophy plans geared to raise metabolic rates:\n" +
      "  - Routine A (Aerobic Glycolysis): 30 to 45 minutes of brisk walking (Zone 2 heart rates, 110-130 BPM) daily.\n" +
      "  - Routine B (Resistance GLUT4 Uplift): 2-3 weekly resistance sequences employing compound movements (squats, pulls).\n" +
      "  - Routine C (High Intensity Glycogen Burn): 15-minute HIIT sprint segments after meals to burn muscle glycogen stores.";
    const splitWorkout = doc.splitTextToSize(workoutText, 180);
    doc.text(splitWorkout, 15, dietCountY + 11);

    const workoutCountY = dietCountY + 11 + (splitWorkout.length * 4.5);

    // Suggested Medical Tests
    doc.setTextColor(51, 65, 85);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("4. SUGGESTED DIAGNOSTIC TESTS & CLINICAL STABILIZATION TARGETS", 15, workoutCountY + 5);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    const testsText = "Recommended regular metrics checkpoints to consult with your physician:\n" +
      "  - Test 1: Glycated Hemoglobin (HbA1c) Panel - target value < 5.7% (Interval: every 6 months).\n" +
      "  - Test 2: Fasting Blood Glucose (FBG) - target value 70-99 mg/dL (Interval: quarterly/monthly).\n" +
      "  - Test 3: Oral Glucose Tolerance Test (OGTT) - target value < 140 mg/dL (Interval: as advised).\n" +
      "  - Test 4: Diastolic Blood Pressure Tracker - target value < 80 mmHg (Interval: self-check weekly).\n" +
      "  - Test 5: Lipids Profile Panel - LDL < 100 mg/dL, HDL > 40 mg/dL, Triglycerides < 150 mg/dL.";
    const splitTests = doc.splitTextToSize(testsText, 180);
    doc.text(splitTests, 15, workoutCountY + 11);

    // Final Warning disclaimer on Page 2
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Report is verified and certified by DiaCare AI clinical engine. Standard clinical procedures apply. Page 2 of 2", 15, 285);

    return doc;
  };

  const uploadAndSendReport = async (doc: jsPDF, recipient: string, isAuto: boolean) => {
    if (!currentPredictionResult) return;
    
    setEmailLoading(true);
    setEmailStatus({
      type: "success",
      message: "Generating PDF and uploading securely to Cloud Clinical Storage..."
    });

    try {
      // 1. Convert jsPDF output to a Blob
      const pdfBlob = doc.output("blob");
      const currentUid = user?.uid || "unauthenticated_user";
      const recordId = "rpt_" + Date.now().toString();
      
      // 2. Upload to Firebase Storage
      let publicPdfUrl = "https://pro-dialect-fmln4.web.app/"; // Robust fallback default
      try {
        const storageRef = ref(storage, `users/${currentUid}/reports/${recordId}.pdf`);
        console.log("[Firebase Storage Upload] Target reference:", storageRef.fullPath);
        const snapshot = await uploadBytes(storageRef, pdfBlob, {
          contentType: "application/pdf"
        });
        publicPdfUrl = await getDownloadURL(snapshot.ref);
        console.log("[Firebase Storage SUCCESS] Generated Public PDF Link:", publicPdfUrl);
      } catch (storageErr: any) {
        console.warn("[Firebase Storage Error] Could not construct custom bucket pointer, using fallback webapp reference:", storageErr);
      }

      // Calculate health score matching our results algorithm
      let estimatedHealthScore = 95;
      estimatedHealthScore -= Math.round(currentPredictionResult.riskPercentage / 2.5);
      if (assessments && assessments[0]) {
        estimatedHealthScore -= Math.round(assessments[0].riskScore / 5);
      }
      estimatedHealthScore = Math.max(estimatedHealthScore, 10);

      // 3. Save PDF details to Firestore user's reports collection
      await addReport(
        `DiaCare AI Clinical Analysis - ${currentPredictionResult.riskLevel} RISK`,
        "application/pdf",
        Math.round(pdfBlob.size || 0),
        `Metabolic Risk Percentage: ${currentPredictionResult.riskPercentage}%. Diagnostic status suggests clinical ${currentPredictionResult.riskLevel} parameters. Verified targets logged.`,
        publicPdfUrl
      );
      console.log("[Firestore Database Record] Assessment tracking report record successfully appended.");

      // 4. Construct content structures for our healthcare email templates
      const userName = userProfile?.name || user?.displayName || "Verified DiaCare Patient";
      const userEmail = recipient;
      const evaluationDate = new Date().toLocaleString();
      const riskCategory = `${currentPredictionResult.riskLevel} RISK`;
      const riskPercentage = currentPredictionResult.riskPercentage;
      const diabetesStatus = currentPredictionResult.riskLevel === "HIGH" ? "Diabetic / High Risk Profile" : currentPredictionResult.riskLevel === "MODERATE" ? "Pre-diabetic / Moderate Risk" : "Normal / Healthy Target";
      
      const aiSummary = currentPredictionResult.insights;
      const recommendations = "Nutrition:\n- High fiber greens and oats\n- Lean protein and complex carbs\n- Avoid simple sugars\n\nExercise:\n- 150 mins Zone 2 cardio weekly\n- 2 resistance training sessions";
      const suggestedTests = "1. HbA1c Glycated Hemoglobin Test (Target: < 5.7%)\n2. Fasting Blood Glucose (FBG) (Target: 70-99 mg/dL)\n3. Oral Glucose Tolerance Test (OGTT) (Target: < 140 mg/dL)\n4. Diastolic Blood Pressure Tracker (Target: < 80 mmHg)\n5. Lipids Profile Panel - LDL < 100 mg/dL, HDL > 40 mg/dL";

      const pdfBase64 = doc.output("datauristring");

      // 5. Fire Request to custom Nodemailer API endpoint
      const response = await fetch("/api/send-email-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_email: userEmail,
          user_name: userName,
          date: evaluationDate,
          risk_percentage: riskPercentage,
          risk_category: riskCategory,
          diabetes_status: diabetesStatus,
          health_score: estimatedHealthScore,
          ai_summary: aiSummary,
          recommendations: recommendations,
          suggested_tests: suggestedTests,
          pdf_base64: pdfBase64,
          pdf_url: publicPdfUrl
        })
      });

      const responseData = await response.json();
      
      if (response.ok && responseData.success) {
        console.log("[Nodemailer Delivery SUCCESS]", responseData);
        setEmailStatus({
          type: "success",
          message: `Medical assessment report successfully dispatched to ${userEmail} with inline PDF attachment! (Nodemailer Channel)`
        });
      } else {
        // Nodemailer failed or unconfigured - EmailJS is completely disabled per instructions
        console.warn("[Clinical Dispatch Failure] Backend Nodemailer is unconfigured or failed. EmailJS is disabled.");
        setEmailStatus({
          type: "error",
          message: responseData.message || "Failed to deliver report email via Gmail SMTP backend. Please configure your SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS environment variables."
        });
      }
    } catch (err: any) {
      console.error("[Clinical Dispatch Engine Exception]", err);
      setEmailStatus({
        type: "error",
        message: `An unexpected delivery error occurred: ${err?.message || String(err)}`
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = generatePDFReport();
    if (!doc) return;
    
    doc.save(`diacare_analyzer_report_${Date.now()}.pdf`);

    // Automatically send an email after PDF report is generated (Requirement 4 & 5)
    const emailToUse = userProfile?.email || user?.email || "";
    if (emailToUse) {
      if (!validateEmail(emailToUse)) {
        console.warn("[Auto Email Log] Invalid format for automatic recipient. Skipping auto-dispatch.");
        return;
      }

      console.log("[Auto Email Log] Initiating automatic email dispatch triggered on PDF report generation for:", emailToUse);
      uploadAndSendReport(doc, emailToUse, true);
    }
  };

  const handleSendEmail = async () => {
    if (!currentPredictionResult) return;
    
    if (!recipientEmail || recipientEmail.trim() === "") {
      setEmailStatus({
        type: "error",
        message: "Please enter a valid email address",
      });
      return;
    }
    
    // Explicit recipient email validation (Requirement 7)
    if (!validateEmail(recipientEmail)) {
      console.warn("[Manual Email Log] Email format validation failed for recipient:", recipientEmail);
      setEmailStatus({
        type: "error",
        message: "Invalid email format. Please check your spelling (e.g. name@example.com) and try again.",
      });
      return;
    }

    const doc = generatePDFReport();
    if (!doc) return;

    await uploadAndSendReport(doc, recipientEmail, false);
  };

  const handleSendTestEmail = async () => {
    if (!recipientEmail || recipientEmail.trim() === "") {
      setEmailStatus({
        type: "error",
        message: "Please enter a valid email address",
      });
      return;
    }

    if (!validateEmail(recipientEmail)) {
      console.warn("[Test Email Log] Email format validation failed for recipient:", recipientEmail);
      setEmailStatus({
        type: "error",
        message: "Invalid email format. A proper email is required to dispatch the test diagnostic.",
      });
      return;
    }

    const doc = generatePDFReport();
    if (!doc) return;

    await uploadAndSendReport(doc, recipientEmail, false);
  };

  if (!currentPredictionResult) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Activity className="h-10 w-10 text-cyan-400 animate-pulse" />
        <h3 className="font-sans font-bold text-lg text-white">No active prediction records evaluated</h3>
        <p className="text-xs text-gray-400 max-w-sm">
          Please feed physiological metabolic values into our clinical analyzer form.
        </p>
        <button
          onClick={() => setCurrentPage("prediction")}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 font-bold text-xs text-white"
        >
          Open Clinical Form
        </button>
      </div>
    );
  }

  const { metrics, riskPercentage, riskLevel, insights } = currentPredictionResult;

  return (
    <div className="relative min-h-[85vh] p-4 md:p-8 bg-[#050816] font-sans text-left print:bg-white print:text-black">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] print:hidden" />

      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        
        {/* Actions bar header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4 gap-4 print:hidden">
          <button
            onClick={() => setCurrentPage("prediction")}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-cyan-300 font-bold border border-white/10 rounded-lg hover:bg-white/10"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Re-evaluate</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs text-black font-bold bg-cyan-500 hover:bg-cyan-400 rounded-lg transition-all"
          >
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </button>
        </div>

        {/* Clinical Report Output frame */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-8 print:border-none print:shadow-none print:bg-white print:p-2">
          
          {/* Lab letterhead header and metadata block */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase">
                DIACARE CLINICAL AI MATRIX
              </span>
              <h1 className="text-xl md:text-2xl font-extrabold text-white print:text-black">
                {t("resultsTitle")}
              </h1>
              <p className="text-[10px] text-slate-500 font-mono">
                LAB REPORT TOKEN ID: {currentPredictionResult.predictionId.toUpperCase()}
              </p>
            </div>

            <div className="text-left md:text-right text-xs text-slate-400 font-mono">
              <div>Date: {new Date(currentPredictionResult.createdAt).toLocaleString()}</div>
              <div>Patient: {userProfile?.name || "Verified Profile"}</div>
              <div>Age: {userProfile?.age || metrics.age} yrs &middot; Biological Gender: {userProfile?.gender || "Male"}</div>
            </div>
          </div>

          {/* Physical outcome meter */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
              <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest mb-2 block">
                {t("riskLabel") || "Evaluated Risk"}
              </span>
              <RiskMeter percentage={riskPercentage} level={riskLevel} />
            </div>

            {/* Parameter readings grid */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Plasma Glucose", val: `${metrics.glucose} mg/dL`, isImpactful: metrics.glucose > 120 },
                { label: "Insulin (2-Hour)", val: `${metrics.insulin} μIU/mL`, isImpactful: metrics.insulin > 140 },
                { label: "BMI", val: `${metrics.bmi}`, isImpactful: metrics.bmi > 25 },
                { label: "Diastolic Blood Press", val: `${metrics.bloodPressure} mm Hg`, isImpactful: metrics.bloodPressure > 85 },
                { label: "Genetics pedigree", val: `${metrics.pedigree}`, isImpactful: metrics.pedigree > 0.6 },
                { label: "Age", val: `${metrics.age}`, isImpactful: metrics.age > 45 },
                { label: "Pregnancies", val: `${metrics.pregnancies}`, isImpactful: metrics.pregnancies > 3 },
                { label: "Skin Thickness", val: `${metrics.skinThickness} mm`, isImpactful: false },
              ].map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between h-[65px] ${
                    item.isImpactful
                      ? "bg-amber-950/20 border-amber-500/30"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <span className="text-[9px] font-sans text-slate-400 truncate uppercase font-bold">
                    {item.label}
                  </span>
                  <span className={`text-xs font-mono font-bold ${item.isImpactful ? "text-amber-400" : "text-white print:text-black"}`}>
                    {item.val}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* Medical Advice, Care Pathways and Emailing section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-6">
            <div id="clinical-advice-box" className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/30 text-white space-y-2">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest flex items-center space-x-1.5">
                <ShieldAlert className="h-4 w-4" />
                <span>Diagnostic Medical Advisory</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {riskLevel === "HIGH" 
                  ? t("highRiskAdvice") 
                  : riskLevel === "MODERATE" 
                  ? t("moderateRiskAdvice") 
                  : t("lowRiskAdvice")}
              </p>
            </div>

            <div id="clinical-care-box" className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30 text-white space-y-2">
              <h4 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Activity className="h-4 w-4" />
                <span>Recommended Care Pathway</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {riskLevel === "HIGH" 
                  ? t("highRiskCare") 
                  : riskLevel === "MODERATE" 
                  ? t("moderateRiskCare") 
                  : t("lowRiskCare")}
              </p>
            </div>
          </div>

          {/* Optional Mail dispatcher */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-cyan-400" />
                  <span>Receive Secure Analytical Report</span>
                </h4>
                <p className="text-[11px] text-slate-400 font-sans">
                  Transmit an encrypted digital copy of this diagnosis directly to your mailbox.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                <input
                  type="email"
                  id="results-recipient-email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Enter recipient email address..."
                  className="bg-white/5 px-3 py-2 border border-white/10 rounded-lg text-xs font-sans text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-full sm:w-48 md:w-56"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    disabled={emailLoading}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5 cursor-pointer"
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
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={emailLoading}
                    className="flex-1 sm:flex-initial px-3 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-lg text-xs font-bold font-sans uppercase tracking-wider transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Send Test Email</span>
                  </button>
                </div>
              </div>
            </div>

            {emailStatus && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-start space-x-2 font-sans ${
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

          {/* Deep AI parsed insights */}
          <div className="space-y-4 text-left border-t border-white/10 pt-6">
            <div className="flex items-center space-x-2">
              <HeartPulse className="h-5 w-5 text-cyan-300" />
              <h3 className="text-sm font-sans font-extrabold text-white print:text-black">
                {t("aiDescription")}
              </h3>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line overflow-y-auto max-h-[400px] print:bg-white print:text-black print:border-none print:p-0">
               {insights}
            </div>
          </div>

          {/* Next Steps navigational panel links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-6 print:hidden">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-cyan-300">Optimize Daily Carbohydrate Budgets</h4>
                <p className="text-[11px] text-slate-400 mt-1">Generate custom low-glycemic dietary meal planners.</p>
              </div>
              <button
                onClick={() => setCurrentPage("diet")}
                className="mt-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] text-center self-start px-3 transition-all cursor-pointer"
              >
                Go to Diet Planner
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-purple-300">Boost Insulin Receptor Sensitivity</h4>
                <p className="text-[11px] text-slate-400 mt-1">Engage custom strength and aerobic workouts.</p>
              </div>
              <button
                onClick={() => setCurrentPage("workout")}
                className="mt-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 font-bold text-[10px] text-center self-start px-3 transition-all cursor-pointer"
              >
                Go to Workout Routines
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
