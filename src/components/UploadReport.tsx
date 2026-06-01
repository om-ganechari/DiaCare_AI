import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { FileText, FileImage, UploadCloud, AlertCircle, Sparkles, CheckCircle, Database } from "lucide-react";
import axios from "axios";

export const UploadReport: React.FC = () => {
  const { addReport, reports, t } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [latestAnalysis, setLatestAnalysis] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(t("fileSizeExceedsLimit"));
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setLatestAnalysis(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const result = reader.result as string;
        const base64Data = result.split(",")[1]; // extract base64 segment

        const response = await axios.post("/api/analyze-report", {
          fileName: file.name,
          fileType: file.type || "application/pdf",
          fileData: base64Data,
        });

        if (response.data && response.data.success) {
          const insights = response.data.insights;
          setLatestAnalysis(insights);
          await addReport(file.name, file.type || "application/pdf", file.size, insights);
          setSuccessMsg(t("parsedReportSuccess"));
        } else {
          setErrorMsg(t("parseReportError"));
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err?.response?.data?.error || err.message || t("endpointError"));
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg(t("readDeviceError"));
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative min-h-[85vh] p-4 md:p-8 bg-[#050816] font-sans text-left">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Drag Drop Action block */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center space-x-2">
              <UploadCloud className="h-6 w-6 text-cyan-300" />
              <span>{t("uploadTitle")}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {t("uploadSubtitle")}
            </p>
          </div>

          {/* Interactive Drag zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`cursor-pointer min-h-[220px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all duration-200 ${
              dragActive
                ? "border-cyan-300 bg-white/15 scale-[0.99]"
                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="application/pdf,image/png,image/jpeg,image/jpg"
              className="hidden"
            />

            {loading ? (
              <div className="space-y-4">
                <span className="animate-spin h-10 w-10 border-4 border-cyan-300 border-t-transparent rounded-full block mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-mono font-bold text-cyan-300 animate-pulse">
                    {t("parsingReport")}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {t("binaryTelemetry")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-sm">
                <div className="mx-auto w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cyan-300">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-sans font-bold text-white">
                    {dragActive ? t("dragActive") : t("dragPrompt")}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {t("supportedFiles")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/30 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center space-x-2.5">
              <AlertCircle className="h-4.5 w-4.5 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center space-x-2.5">
              <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Latest Analysis Results display panel */}
          {latestAnalysis && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <h3 className="font-sans font-bold text-sm text-white">
                  {t("extractedInsights")}
                </h3>
              </div>
              <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line max-h-[300px] overflow-y-auto pr-2">
                {latestAnalysis}
              </div>
            </div>
          )}
        </div>

        {/* Right Uploaded Reports list historical log */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
            <Database className="h-4 w-4 text-purple-400" />
            <h3 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
               {t("analysisHistory")}
            </h3>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {reports.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                {t("noArchivedRuns")}
              </div>
            ) : (
              reports.map((rpt) => (
                <div
                  key={rpt.reportId}
                  onClick={() => setLatestAnalysis(rpt.insights)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    latestAnalysis === rpt.insights
                      ? "bg-purple-500/10 border-purple-500"
                      : "bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-white/5 text-cyan-300">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <div className="text-xs min-w-0 flex-1 space-y-0.5">
                      <div className="font-sans font-bold text-white truncate">
                        {rpt.fileName}
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold">
                        <span>{(rpt.fileSize / 1024).toFixed(1)} KB</span>
                        <span>{new Date(rpt.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
