import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { HeartHandshake, Sparkles, Flame, Apple, CheckCircle2, ChevronRight, RefreshCw, AlertCircle } from "lucide-react";
import axios from "axios";

// Default Backup Static Plans mapped to Diabetes Diet guidelines
const backupPlan = {
  VEGETARIAN: {
    breakfast: {
      title: "Sprout Grain Salad & Steel Cut Oats",
      ingredients: ["1/2 cup steel-cut oats", "1 tbsp chia seeds", "Mixed organic sprouts", "Unsweetened almond milk"],
      kcal: 290,
      benefits: "High soluble fiber profile minimizes insulin spikes on morning rise.",
    },
    lunch: {
      title: "Broken Wheat (Daliya) Pulao & Tofu",
      ingredients: ["Daliya 1 cup", "Organic baked tofu 100g", "Spinach, capsicum, green peas", "Buttermilk 1 glass"],
      kcal: 420,
      benefits: "Slow digester complex carbs sustain plasma energy levels.",
    },
    snacks: {
      title: "Roasted Beetroot Hummus & Raw Flax Crackers",
      ingredients: ["Beetroot hummus 2 tbsp", "Cucumber and carrot wedges", "Handful of dry roasted walnuts"],
      kcal: 140,
      benefits: "Monounsaturated fats boost mitochondrial envelope durability.",
    },
    dinner: {
      title: "Stuffed Bitter Gourd (Karela) & Soya Soup",
      ingredients: ["Karela stuffed with roasted chana spice", "1 high-protein soya soup bowl", "Mixed fresh garden greens salad"],
      kcal: 310,
      benefits: "Charantin and polypeptide-P compounds assist insulin receptors naturally.",
    },
  },
  NON_VEGETARIAN: {
    breakfast: {
      title: "Avocado Toast & Egg White Skillet",
      ingredients: ["Egg whites 3 nos", "1 slice multi-grain brown sourdough", "Fresh mashed avocado 1/2 size"],
      kcal: 320,
      benefits: "High protein and monounsaturated lipids optimize breakfast biochemistry.",
    },
    lunch: {
      title: "Herb Grilled Salmon & Quinoa Pilaf",
      ingredients: ["Atlantic salmon fillet 120g", "Quinoa 1/2 cup", "Steamed asparagus & lemon dress"],
      kcal: 460,
      benefits: "Omega-3 fatty acids actively mitigate cardio-vascular metabolic stresses.",
    },
    snacks: {
      title: "Turkey Breast Jerky & Pumpkin Seeds",
      ingredients: ["Lean turkey breast slices 50g", "Raw pumpkin seeds 1 tbsp", "Warm unsweetened green tea"],
      kcal: 160,
      benefits: "High zinc content aids pancreatic beta cell synthesis protocols.",
    },
    dinner: {
      title: "Slow Cooked Chicken Breast & Sauteed Zucchini",
      ingredients: ["Skinless chicken breast 150g", "Sauteed zucchini & mushrooms", "Warm clear bone broth 1 cup"],
      kcal: 350,
      benefits: "Lean amino acids optimize sleeping muscle recovery without glycogen surges.",
    },
  },
};

export const DietPlanner: React.FC = () => {
  const { predictions, userProfile, t } = useApp();
  const [dietType, setDietType] = useState<"VEGETARIAN" | "NON_VEGETARIAN">("VEGETARIAN");
  const [aiPlan, setAiPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const userRiskLevel = predictions[0]?.riskLevel || "MODERATE";
  const userAge = userProfile?.age || predictions[0]?.metrics?.age || 35;

  const fetchAIDietPlan = async () => {
    setLoading(true);
    setErrorMsg("");
    setAiPlan(null);

    try {
      const response = await axios.post("/api/recommendations", {
        riskLevel: userRiskLevel,
        age: userAge,
        weightCategory: predictions[0]?.metrics?.bmi > 25 ? "Overweight" : "Normal",
        dietType,
        fitnessLevel: "BEGINNER",
      });

      if (response.data && response.data.dietPlan) {
        setAiPlan(response.data.dietPlan);
      } else {
        setAiPlan(backupPlan[dietType]);
      }
    } catch (err: any) {
      console.warn("AI recommendation generation failed, loading high-grade fallback diet protocols.", err);
      // Fallback to beautiful static plans
      setAiPlan(backupPlan[dietType]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIDietPlan();
  }, [dietType]);

  const activePlan = aiPlan || backupPlan[dietType];

  return (
    <div className="relative min-h-[85vh] p-4 md:p-8 bg-[#050816] font-sans text-left">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Header segment */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center space-x-2">
              <HeartHandshake className="h-6 w-6 text-cyan-300 animate-pulse" />
              <span>{t("dietTitle")}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {t("dietSubtitle")}
            </p>
          </div>

          {/* Toggle switcher */}
          <div className="flex space-x-2 p-1.5 bg-white/5 border border-white/10 rounded-xl self-start">
            <button
              onClick={() => setDietType("VEGETARIAN")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dietType === "VEGETARIAN"
                  ? "bg-cyan-500 text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Vegetarian
            </button>
            <button
              onClick={() => setDietType("NON_VEGETARIAN")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dietType === "NON_VEGETARIAN"
                  ? "bg-cyan-500 text-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Non-Vegetarian
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center p-12 space-x-3 text-cyan-300 font-mono text-xs">
            <RefreshCw className="h-5 w-5 animate-spin text-cyan-300" />
            <span>Generating customizable dietitian schedules...</span>
          </div>
        )}

        {/* Nutritional meal grids */}
        {!loading && activePlan && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Breakfast card */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 hover:border-cyan-300/30 transition-all text-left flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-widest block border-b border-white/10 pb-2">
                    {t("breakfast")}
                  </span>
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm tracking-tight">{activePlan.breakfast?.title}</h3>
                    <div className="flex items-center space-x-1 text-slate-400 text-[10px] font-mono font-bold">
                       <Flame className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                      <span>{activePlan.breakfast?.kcal || 300} Kcal</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold block">Key Ingredients:</span>
                    <div className="flex flex-wrap gap-1">
                      {(activePlan.breakfast?.ingredients || []).map((ing: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-sm bg-white/5 text-cyan-300 border border-white/10 font-bold">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-3 border-t border-white/10 mt-4 leading-relaxed">
                   Benefits: {activePlan.breakfast?.benefits}
                </p>
              </div>

              {/* Lunch card */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 hover:border-cyan-300/30 transition-all text-left flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-widest block border-b border-white/10 pb-2">
                    {t("lunch")}
                  </span>
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm tracking-tight">{activePlan.lunch?.title}</h3>
                    <div className="flex items-center space-x-1 text-slate-400 text-[10px] font-mono font-bold">
                       <Flame className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                      <span>{activePlan.lunch?.kcal || 450} Kcal</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold block">Key Ingredients:</span>
                    <div className="flex flex-wrap gap-1">
                      {(activePlan.lunch?.ingredients || []).map((ing: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-sm bg-white/5 text-cyan-300 border border-white/10 font-bold">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-3 border-t border-white/10 mt-4 leading-relaxed">
                   Benefits: {activePlan.lunch?.benefits}
                </p>
              </div>

              {/* Snacks card */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 hover:border-cyan-300/30 transition-all text-left flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-widest block border-b border-white/10 pb-2">
                    {t("snacks")}
                  </span>
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm tracking-tight">{activePlan.snacks?.title}</h3>
                    <div className="flex items-center space-x-1 text-slate-400 text-[10px] font-mono font-bold">
                       <Flame className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                      <span>{activePlan.snacks?.kcal || 150} Kcal</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold block">Key Ingredients:</span>
                    <div className="flex flex-wrap gap-1">
                      {(activePlan.snacks?.ingredients || []).map((ing: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-sm bg-white/5 text-cyan-300 border border-white/10 font-bold">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-3 border-t border-white/10 mt-4 leading-relaxed">
                   Benefits: {activePlan.snacks?.benefits}
                </p>
              </div>

              {/* Dinner card */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 hover:border-cyan-300/30 transition-all text-left flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-widest block border-b border-white/10 pb-2">
                    {t("dinner")}
                  </span>
                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm tracking-tight">{activePlan.dinner?.title}</h3>
                    <div className="flex items-center space-x-1 text-slate-400 text-[10px] font-mono font-bold">
                       <Flame className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                      <span>{activePlan.dinner?.kcal || 350} Kcal</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold block">Key Ingredients:</span>
                    <div className="flex flex-wrap gap-1">
                      {(activePlan.dinner?.ingredients || []).map((ing: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-sm bg-white/5 text-cyan-300 border border-white/10 font-bold">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic pt-3 border-t border-white/10 mt-4 leading-relaxed">
                   Benefits: {activePlan.dinner?.benefits}
                </p>
              </div>

            </div>

            {/* General tips segment at bottom */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-2 text-left md:col-span-2">
                 <h4 className="font-sans font-bold text-sm text-cyan-300">Glycemic Load Management Tips</h4>
                 <p className="text-xs text-slate-400 leading-relaxed">
                    Diabetic diets center around lowering speed of glucose loading on digestion. Always load fibrous cruciferous salads first before consuming grain carbs to slow glycemic index rises securely.
                 </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-cyan-300 font-mono tracking-tight space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span>Hydration Target:</span>
                  <span className="font-bold">3.5 Litres</span>
                </div>
                <div className="flex justify-between">
                  <span>Protein Target:</span>
                  <span className="font-bold">1.2g per kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Fiber Target:</span>
                  <span className="font-bold">35g+ Daily</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
