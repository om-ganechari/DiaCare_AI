import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  Sparkles, 
  RefreshCw, 
  ShieldAlert, 
  HeartPulse, 
  TrendingUp, 
  Activity, 
  FileText, 
  Globe 
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

export const Chatbot: React.FC = () => {
  const { currentPredictionResult, userProfile, user, language, setCurrentPage } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasNewMessageBadge, setHasNewMessageBadge] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Dynamic Translations based on current Language configuration ("en" | "hi" | "mr")
  const getBotLabels = () => {
    switch (language) {
      case "hi":
        return {
          title: "DiaCare AI सहायक",
          status: "क्रियाशील",
          greeting: `नमस्ते ${userProfile?.name || "मरीज"}! मैं आपका DiaCare AI सहायक हूँ। आज मैं आपके चयापचय (metabolic) और मधुमेह स्वास्थ्य चिंताओं में आपकी क्या सहायता कर सकता हूँ?`,
          placeholder: "DiaCare AI सहायक से पूछें...",
          disclaimer: "यह उपकरण केवल शैक्षिक जानकारी प्रदान करता है और चिकित्सा सलाह का विकल्प नहीं है।",
          quickActions: [
            { text: "मूल्यांकन शुरू करें", prompt: "How to start diabetes risk assessment in DiaCare?" },
            { text: "मेरे परिणाम समझाएं", prompt: "Explain My Results and diabetes levels." },
            { text: "मधुमेह के लक्षण", prompt: "What are the common symptoms of diabetes?" },
            { text: "निरोगी आहार योजना", prompt: "Provide healthy diet suggestions for prediabetes." },
            { text: "व्यायाम योजना", prompt: "Suggest an exercise and fitness plan for active glucose control." },
            { text: "रिपोर्ट डाउनलोड सहायता", prompt: "How do I download the PDF health assessment report?" }
          ]
        };
      case "mr":
        return {
          title: "DiaCare AI सहाय्यक",
          status: "सक्रिय",
          greeting: `नमस्कार ${userProfile?.name || "रुग्ण"}! मी तुमचा DiaCare AI सहाय्यक आहे. आज मी आपल्या चयापचय आरोग्याबद्दल किंवा मधुमेह प्रतिबंधक माहितीबद्दल काय मदत करू शकतो?`,
          placeholder: "DiaCare AI सहाय्यकाला विचारा...",
          disclaimer: "हे साधन केवळ शैक्षणिक माहिती प्रदान करते आणि वैद्यकीय सल्ल्याचा पर्याय नाही.",
          quickActions: [
            { text: "मूल्यांकन सुरू करा", prompt: "How to start diabetes risk assessment in DiaCare?" },
            { text: "माझे निकाल स्पष्ट करा", prompt: "Explain My Results and diabetes levels." },
            { text: "मधुमेहाची लक्षणे", prompt: "What are the common symptoms of diabetes?" },
            { text: "निरोगी आहार", prompt: "Provide healthy diet suggestions for prediabetes." },
            { text: "व्यायाम योजना", prompt: "Suggest an exercise and fitness plan for active glucose control." },
            { text: "रिपोर्ट डाउनलोड मदत", prompt: "How do I download the PDF health assessment report?" }
          ]
        };
      case "en":
      default:
        return {
          title: "DiaCare AI Assistant",
          status: "Live & Secure",
          greeting: `Hello ${userProfile?.name || "Patient"}! I am your DiaCare AI Assistant. How can I help you understand your metabolic parameters, generate clinical PDF reports, or explain diabetes indicators today?`,
          placeholder: "Ask DiaCare AI assistant...",
          disclaimer: "This tool provides educational information and is not a substitute for medical advice.",
          quickActions: [
            { text: "Start Assessment", prompt: "How to start diabetes risk assessment in DiaCare?" },
            { text: "Explain My Results", prompt: "Explain My Results and diabetes levels." },
            { text: "Diabetes Symptoms", prompt: "What are the common symptoms of diabetes?" },
            { text: "Healthy Diet", prompt: "Provide healthy diet suggestions for prediabetes." },
            { text: "Exercise Plan", prompt: "Suggest an exercise and fitness plan for active glucose control." },
            { text: "Download Report Help", prompt: "How do I download the PDF health assessment report?" }
          ]
        };
    }
  };

  const labels = getBotLabels();

  // Load initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "greet",
          role: "model",
          content: labels.greeting,
          timestamp: new Date()
        }
      ]);
    }
  }, [language, userProfile]);

  // Handle badge alert when minimized and receiving response
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setHasNewMessageBadge(true);
    }
  }, [messages.length, isOpen]);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasNewMessageBadge(false);
    }
  }, [isOpen, messages, loading]);

  // Send message function
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() || loading) return;

    // Redirect helper matching navigation questions
    const lowercasePrompt = textToSend.toLowerCase();
    if (lowercasePrompt.includes("start assessment") || lowercasePrompt.includes("start evaluation") || lowercasePrompt.includes("मूल्यांकन शुरू") || lowercasePrompt.includes("मूल्यांकन सुरू")) {
      setCurrentPage("prediction");
      setIsOpen(false);
      return;
    }

    const userMsg: Message = {
      id: "msg_" + Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      // Gather current user context to construct deep metadata payload
      const calculatedHealthScore = currentPredictionResult 
        ? Math.max(95 - Math.round(currentPredictionResult.riskPercentage / 2.5), 10) 
        : undefined;

      const contextPayload = {
        userName: userProfile?.name || user?.displayName || "Verified DiaCare Patient",
        hasAssessment: !!currentPredictionResult,
        riskLevel: currentPredictionResult?.riskLevel,
        riskPercentage: currentPredictionResult?.riskPercentage,
        healthScore: calculatedHealthScore,
        insights: currentPredictionResult?.insights,
        language: language
      };

      // Format previous history for memory matching Express expectations
      const chatHistory = messages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory,
          context: contextPayload
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: "bot_" + Date.now().toString(),
            role: "model",
            content: data.response,
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error(data.message || "Endpoint returned an unexpected error response");
      }
    } catch (err: any) {
      console.error("[DiaCare Chat Client Error]", err);
      setMessages((prev) => [
        ...prev,
        {
          id: "bot_err_" + Date.now().toString(),
          role: "model",
          content: `An issue occurred while consulting DiaCare AI: ${err.message || String(err)}. Please try again soon. \n\nDisclaimer: This tool provides educational information and is not a substitute for medical advice.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    if (window.confirm("Are you sure you want to clear your chat history with DiaCare AI Assistant?")) {
      setMessages([
        {
          id: "greet_reset",
          role: "model",
          content: labels.greeting,
          timestamp: new Date()
        }
      ]);
    }
  };

  // Safe client-side regex-powered markdown formatter for high visual polish
  const parseBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-extrabold text-cyan-400">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    
    return lines.map((line, idx) => {
      const lineContent = line.trim();
      if (!lineContent) return <div key={idx} className="h-2" />;

      // Bullet List Match
      const isBullet = lineContent.startsWith("-") || lineContent.startsWith("*") || lineContent.startsWith("•");
      if (isBullet) {
        const cleanText = lineContent.replace(/^[\-\*\•]\s*/, "");
        return (
          <li key={idx} className="ml-4 list-disc text-[12px] text-slate-200 mb-1 leading-relaxed font-sans">
            {parseBoldText(cleanText)}
          </li>
        );
      }

      // Numbered List Match
      const isNumbered = /^\d+\.\s*/.test(lineContent);
      if (isNumbered) {
        const cleanText = lineContent.replace(/^\d+\.\s*/, "");
        return (
          <li key={idx} className="ml-4 list-decimal text-[12px] text-slate-200 mb-1 leading-relaxed font-sans">
            {parseBoldText(cleanText)}
          </li>
        );
      }

      // Paragraph block
      return (
        <p key={idx} className="text-[12px] text-slate-200 mb-1.5 leading-relaxed font-sans">
          {parseBoldText(lineContent)}
        </p>
      );
    });
  };

  return (
    <div id="diacare-ai-chatbot-root" className="fixed bottom-6 right-6 z-[999]">
      <AnimatePresence>
        {/* Chat Window Panel */}
        {isOpen && (
          <motion.div
            id="diacare-chatbot-drawer"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute bottom-16 right-0 w-[calc(100vw-3rem)] sm:w-[400px] h-[550px] bg-[#0b0f19]/95 border border-cyan-500/20 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl flex flex-col justify-between"
          >
            {/* Header Area */}
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-4 border-b border-cyan-500/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="relative">
                  <div className="bg-cyan-500/15 p-2 rounded-xl text-cyan-400 border border-cyan-500/30">
                    <Bot className="h-5 w-5 animate-pulse" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold tracking-wider text-slate-100 flex items-center space-x-1">
                    <span>{labels.title}</span>
                    <Sparkles className="h-3 w-3 text-cyan-400" />
                  </h4>
                  <div className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1 uppercase tracking-widest mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>{labels.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Clear chat history"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Diagnostic Mini Panel if assessment exists */}
            {currentPredictionResult && (
              <div className="bg-cyan-950/20 border-b border-cyan-500/10 px-4 py-2 flex items-center justify-between text-[11px] text-cyan-300">
                <div className="flex items-center space-x-1.5 font-mono">
                  <HeartPulse className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                  <span>Latest: {currentPredictionResult.riskLevel} RISK</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-400 font-mono">
                  <span>Score: {currentPredictionResult.riskPercentage}%</span>
                </div>
              </div>
            )}

            {/* Conversation Window */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 ${
                      m.role === "user"
                        ? "bg-cyan-600 text-white font-sans text-xs shadow-md shadow-cyan-900/10"
                        : "bg-slate-900/80 text-slate-200 border border-slate-800 shadow-sm"
                    }`}
                  >
                    {m.role === "model" ? (
                      <div className="space-y-1.5 prose-sm max-w-none text-left">
                        {renderFormattedText(m.content)}
                      </div>
                    ) : (
                      <p className="text-xs leading-relaxed font-sans text-right">{m.content}</p>
                    )}
                    <span className="block text-[8px] text-slate-400/80 font-mono text-right mt-1.5">
                      {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing Animation */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 max-w-[85%] flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions area */}
            <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/80 overflow-x-auto whitespace-nowrap flex space-x-2 scrollbar-none">
              {labels.quickActions.map((action, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(action.prompt)}
                  className="bg-slate-900 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400 text-[10px] font-medium tracking-wide px-3 py-1.5 rounded-full transition-all shrink-0 cursor-pointer"
                >
                  {action.text}
                </button>
              ))}
            </div>

            {/* Disclaimer & Typing Input */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col space-y-3">
              {/* Educational Disclaimer Panel */}
              <div className="text-[9px] text-slate-400 flex items-start space-x-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800/40">
                <ShieldAlert className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-tight font-sans text-left">
                  {labels.disclaimer}
                </p>
              </div>

              {/* Input section */}
              <div className="flex items-center space-x-2">
                <input
                  id="chatbot-text-input"
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={labels.placeholder}
                  disabled={loading}
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || loading}
                  className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 disabled:hover:bg-cyan-500 p-2 rounded-xl text-slate-950 transition-all font-bold cursor-pointer shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sparkles Mini Launcher Launcher */}
      <motion.button
        id="diacare-chatbot-launcher"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 p-4 rounded-full shadow-2xl transition-all cursor-pointer z-[999] border-2 border-slate-950 flex items-center justify-center group"
      >
        <MessageSquare className="h-6 w-6 text-slate-950 group-hover:rotate-6 transition-transform" />
        
        {/* Active blinking badge if notifications / user context loaded */}
        <AnimatePresence>
          {hasNewMessageBadge && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 block h-3.5 w-3.5 rounded-full bg-amber-500 border-2 border-slate-950"
            />
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
