import React from "react";
import { useApp } from "../context/AppContext";
import { Activity, ShieldCheck, HeartPulse, Award, Scale, ChevronRight, FileText, Plus, Database, Sparkles, TrendingUp } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const DashboardView: React.FC = () => {
  const { userProfile, predictions, assessments, reports, setCurrentPage, setCurrentPredictionResult, t } = useApp();

  // Compute aggregated scores or fallbacks
  const latestPrediction = predictions[0] || null;
  const latestAssessment = assessments[0] || null;

  // Chart calculation logic (last 10 records)
  const chartDataReversed = [...predictions].slice(0, 10).reverse();
  const chartLabels = chartDataReversed.length > 0 
    ? chartDataReversed.map(p => new Date(p.createdAt).toLocaleDateString())
    : ["Reference 1", "Reference 2", "Reference 3", "Reference 4"];

  const glucoseValues = chartDataReversed.length > 0
    ? chartDataReversed.map(p => p.metrics.glucose)
    : [98, 114, 155, 102];

  const riskPercentages = chartDataReversed.length > 0
    ? chartDataReversed.map(p => p.riskPercentage)
    : [12, 38, 74, 18];

  const glucoseChartData = {
    labels: chartLabels,
    datasets: [
      {
        fill: true,
        label: `${t("glucose") || "Glucose"} Reading (mg/dL)`,
        data: glucoseValues,
        borderColor: "#22d3ee",
        backgroundColor: "rgba(34, 211, 238, 0.08)",
        tension: 0.35,
        borderWidth: 2,
        pointBackgroundColor: "#22d3ee",
      }
    ]
  };

  const riskChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: t("diabetes") ? `${t("diabetes")} Risk Score (%)` : "Risk Score (%)",
        data: riskPercentages,
        backgroundColor: chartDataReversed.length > 0 
          ? chartDataReversed.map(p => {
              if (p.riskLevel === "HIGH") return "rgba(239, 68, 68, 0.7)";
              if (p.riskLevel === "MODERATE") return "rgba(245, 158, 11, 0.7)";
              return "rgba(16, 185, 129, 0.7)";
            })
          : ["rgba(16, 185, 129, 0.7)", "rgba(245, 158, 11, 0.7)", "rgba(239, 68, 68, 0.7)", "rgba(16, 185, 129, 0.7)"],
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#94a3b8",
          font: { size: 9, family: "JetBrains Mono" }
        }
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.03)" },
        ticks: { color: "#64748b", font: { size: 9, family: "JetBrains Mono" } }
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.03)" },
        ticks: { color: "#64748b", font: { size: 9, family: "JetBrains Mono" } }
      }
    }
  };

  const getHealthScore = () => {
    let baseScore = 95;
    if (latestPrediction) {
      baseScore -= Math.round(latestPrediction.riskPercentage / 2.5);
    }
    if (latestAssessment) {
      baseScore -= Math.round(latestAssessment.riskScore / 5);
    }
    return Math.max(baseScore, 10);
  };

  const getScoreVibe = (score: number) => {
    if (score > 80) return { label: t("excellentStatus"), color: "text-emerald-400 border-emerald-500/35 bg-emerald-500/10" };
    if (score > 55) return { label: t("moderateOutlook"), color: "text-amber-400 border-amber-500/35 bg-amber-500/10" };
    return { label: t("criticalAlert"), color: "text-red-400 border-red-500/35 bg-red-500/10" };
  };

  const score = getHealthScore();
  const status = getScoreVibe(score);

  const displayOlderPrediction = (pred: any) => {
    setCurrentPredictionResult(pred);
    setCurrentPage("results");
  };

  return (
    <div className="relative min-h-[85vh] p-4 md:p-8 bg-[#050816] font-sans text-left">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Welcome card row panel */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-[10px] font-mono uppercase tracking-wider">
               <Sparkles className="h-3 w-3 animate-pulse text-cyan-300" />
               <span>{t("physiologicalDiagnosticsNode")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
              {t("welcomeBackUser")} {userProfile?.name || "Practitioner"}
            </h1>
            <p className="text-xs text-slate-400 max-w-md">
              {t("monitoringSugarFactors")}
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentPage("prediction")}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-sans text-xs font-bold rounded-lg transition-all uppercase tracking-wider"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>{t("diagnoseBiomarkers")}</span>
            </button>
            
            <button
              onClick={() => setCurrentPage("assessment")}
              className="px-4 py-2.5 rounded-lg border border-white/10 hover:bg-white/10 text-white font-sans text-xs font-bold transition-all"
            >
              {t("auditLifestyle")}
            </button>
          </div>
        </div>

        {/* Bento statistical grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Health index score card */}
          <div className="md:col-span-4 bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between text-left relative overflow-hidden h-full min-h-[220px]">
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                {t("metabolicEfficiency")}
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">{t("healthIntegrityIndex")}</h3>
            </div>

            <div className="flex items-baseline space-x-1 py-4">
              <span className="text-6xl font-extrabold text-white leading-none">{score}</span>
              <span className="text-slate-400 text-sm font-mono">/ 100</span>
            </div>

            <div className={`self-start inline-block px-3 py-1 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${status.color}`}>
              {status.label}
            </div>
          </div>

          {/* Diabetes Risk Meter Card */}
          <div className="md:col-span-4 bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between text-left h-full min-h-[220px]">
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                 {t("molecularFactor")}
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">{t("diabetesRiskMetric")}</h3>
            </div>

            {latestPrediction ? (
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-baseline">
                  <span
                    className={`font-sans font-extrabold text-4xl leading-none ${
                      latestPrediction.riskLevel === "HIGH"
                        ? "text-red-400"
                        : latestPrediction.riskLevel === "MODERATE"
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {latestPrediction.riskLevel}
                  </span>
                  <span className="text-xs text-cyan-300 font-mono font-bold">{latestPrediction.riskPercentage}% {t("factor")}</span>
                </div>

                <div className="h-2 rounded-full bg-black/40">
                  <div
                    className={`h-2 rounded-full ${
                      latestPrediction.riskLevel === "HIGH"
                        ? "bg-red-500"
                        : latestPrediction.riskLevel === "MODERATE"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${latestPrediction.riskPercentage}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-6">
                {t("noDiagnosticRuns")}
              </div>
            )}

            <button
              onClick={() => {
                if (latestPrediction) {
                  setCurrentPredictionResult(latestPrediction);
                  setCurrentPage("results");
                } else {
                  setCurrentPage("prediction");
                }
              }}
              className="text-xs font-mono font-bold text-cyan-300 flex items-center space-x-1 hover:underline cursor-pointer"
            >
              <span>{latestPrediction ? t("expandRiskInsights") : t("initializeRiskForms")}</span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </button>
          </div>

          {/* BMI card */}
          <div className="md:col-span-4 bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between text-left h-full min-h-[220px]">
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                 {t("scaleIndicator")}
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">{t("bodyMassRatio")}</h3>
            </div>

            <div className="space-y-3 py-3">
              <div className="flex items-baseline space-x-1">
                <span className="text-5xl font-extrabold text-white leading-none">
                  {latestPrediction?.metrics?.bmi || "24.5"}
                </span>
                <span className="text-slate-400 text-xs font-mono font-bold">kg/m²</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal max-w-xs">
                {t("bmiFormulaExplanation")}
              </p>
            </div>

            <div className="text-[10px] font-mono uppercase tracking-widest text-[#567aae] bg-white/5 border border-white/10 p-2 rounded-xl text-center">
              {t("normalThresholdProtocol")}
            </div>
          </div>

        </div>

        {/* METABOLIC ANALYTICS TRENDS (Requirement 5) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white/[0.04] border border-white/10 p-6 rounded-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-cyan-500/[0.02] rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-purple-500/[0.02] rounded-full blur-[80px]" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4.5 w-4.5 text-cyan-400" />
                <h4 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-widest">
                  Glucose Telemetry Trend
                </h4>
              </div>
              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20 uppercase tracking-wider">
                {predictions.length > 0 ? "Active Logs" : "Simulated reference"}
              </span>
            </div>
            <div className="h-[210px] w-full relative">
              <Line data={glucoseChartData} options={chartOptions} />
            </div>
            <p className="text-[10px] text-slate-400 leading-normal font-sans">
              Tracks plasma glucose level diagnostics across sequential assessments to monitor pancreatic insulin outputs and glycemic management.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-4.5 w-4.5 text-purple-400" />
                <h4 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-widest">
                  Diabetes Multi-Factor Risk Trend
                </h4>
              </div>
              <span className="text-[9px] font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full border border-purple-400/20 uppercase tracking-wider">
                {predictions.length > 0 ? "Active clinical" : "Standard Model"}
              </span>
            </div>
            <div className="h-[210px] w-full relative">
              <Bar data={riskChartData} options={chartOptions} />
            </div>
            <p className="text-[10px] text-slate-400 leading-normal font-sans">
              Evaluates neural risk probability coefficients based on blood pressure, genetics parameters, insulin index, and body mass ratios.
            </p>
          </div>
        </div>

        {/* Previous Reports & History logs grids */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Historical diagnostics predictions list */}
          <div className="lg:col-span-7 bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Database className="h-4.5 w-4.5 text-purple-400" />
                <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-widest">
                   {t("diagnosticRecordLogs")} ({predictions.length})
                </h3>
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase">{t("secureAesCloud")}</span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {predictions.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  {t("noHistPredictions")}
                </div>
              ) : (
                predictions.map((pred) => (
                  <div
                    key={pred.predictionId}
                    onClick={() => displayOlderPrediction(pred)}
                    className="p-3.5 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between text-left"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                         <span className="text-xs font-sans font-bold text-white">{t("glucose")}: {pred.metrics.glucose} mg/dL</span>
                         <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/10 text-cyan-300 border border-white/10 font-mono font-bold">{t("age")}: {pred.metrics.age}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                         {t("recordedAt")}: {new Date(pred.createdAt).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold font-mono ${
                          pred.riskLevel === "HIGH"
                            ? "text-red-400 bg-red-950/20 border border-red-500/20"
                            : pred.riskLevel === "MODERATE"
                            ? "text-amber-400 bg-amber-950/20 border border-amber-500/20"
                            : "text-emerald-400 bg-emerald-950/20 border border-emerald-500/20"
                        }`}
                      >
                        {pred.riskLevel}
                      </span>
                      <ChevronRight className="h-4.5 w-4.5 text-slate-600" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right OCR Reports logs */}
          <div className="lg:col-span-5 bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
              <FileText className="h-4.5 w-4.5 text-cyan-300" />
              <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-widest">
                 {t("archivedOcrReports")}
              </h3>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {reports.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  {t("noOcrLabResults")}
                </div>
              ) : (
                reports.map((rpt) => (
                  <div
                    key={rpt.reportId}
                    onClick={() => setCurrentPage("upload")}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between text-left"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="text-xs font-sans font-bold text-white truncate">
                        {rpt.fileName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-2">
                        <span>{(rpt.fileSize / 1024).toFixed(1)} KB</span>
                        <span>&bull;</span>
                        <span>{new Date(rpt.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 shrink-0 ml-2" />
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
