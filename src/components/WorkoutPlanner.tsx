import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Dumbbell, Sparkles, Flame, Clock, CheckCircle2, ChevronRight, RefreshCw } from "lucide-react";
import axios from "axios";

// Standard clinical-grade backup exercise routines focusing on upregulating GLUT-4 glucose transporters
const backupWorkouts = {
  BEGINNER: {
    durationMinutes: 30,
    cooldown: { title: "Light Static Stretching", duration: "5 minutes" },
    exercises: [
      { name: "Brisk Incline Walking", repsSets: "20 minutes", description: "Maintain a steady rate at 4.5 km/hr, incline level 4." },
      { name: "Bodyweight Air Squats", repsSets: "3 sets of 12 reps", description: "Keep feet shoulder-width, thrust hips back smoothly." },
      { name: "Dumbbell Seated Press", repsSets: "2 sets of 10-12 reps", description: "Select low weights (4kg). Inhale on drop, press to full lock." },
    ],
  },
  INTERMEDIATE: {
    durationMinutes: 45,
    cooldown: { title: "Deep Breathing & Foam Roll", duration: "8 minutes" },
    exercises: [
      { name: "Resistance Band Rowing", repsSets: "4 sets of 15 reps", description: "Target shoulder scapula squeeze to maximize glycogen capture." },
      { name: "Goblet Squats", repsSets: "3 sets of 12 reps", description: "Hold a 10kg dumbbell vertically at chest level, drive up from heels." },
      { name: "Stationary Cycling Intervals", repsSets: "15 minutes", description: "Alternate 1 minute peak sprint with 2 minutes low intensity." },
    ],
  },
  ADVANCED: {
    durationMinutes: 60,
    cooldown: { title: "Full Body Yoga Asanas", duration: "10 minutes" },
    exercises: [
      { name: "High-Intensity Functional Circuits", repsSets: "25 minutes", description: "Combine burpees, kettlebell swings, and mountain climbers." },
      { name: "Barbell Romanian Deadlifts", repsSets: "4 sets of 10 reps", description: "Focus on hamstring eccentric contraction, keep spine rigid." },
      { name: "Overhead Barbell Squats", repsSets: "3 sets of 8 reps", description: "Engages primary nervous stabilizers, elevating metabolic rate." },
    ],
  },
};

export const WorkoutPlanner: React.FC = () => {
  const { predictions, userProfile, t } = useApp();
  const [level, setLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [aiWorkout, setAiWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const userRiskLevel = predictions[0]?.riskLevel || "MODERATE";
  const userAge = userProfile?.age || predictions[0]?.metrics?.age || 35;

  const fetchAIWorkoutPlan = async () => {
    setLoading(true);
    setAiWorkout(null);

    try {
      const response = await axios.post("/api/recommendations", {
        riskLevel: userRiskLevel,
        age: userAge,
        weightCategory: predictions[0]?.metrics?.bmi > 25 ? "Overweight" : "Normal",
        dietType: "VEGETARIAN",
        fitnessLevel: level,
      });

      if (response.data && response.data.workoutPlan) {
        setAiWorkout(response.data.workoutPlan);
      } else {
        setAiWorkout(backupWorkouts[level]);
      }
    } catch (err: any) {
      console.warn("AI recommendation generation failed, loading static workout protocols.", err);
      setAiWorkout(backupWorkouts[level]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIWorkoutPlan();
  }, [level]);

  const activePlan = aiWorkout || backupWorkouts[level];

  return (
    <div className="relative min-h-[85vh] p-4 md:p-8 bg-[#050816] font-sans text-left">
      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Header section with toggle levels */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center space-x-2">
              <Dumbbell className="h-6 w-6 text-cyan-300 animate-spin" style={{ animationDuration: "6s" }} />
              <span>{t("workoutTitle")}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {t("workoutSubtitle")}
            </p>
          </div>

          {/* Level Switch tabs */}
          <div className="flex space-x-2 p-1.5 bg-white/5 border border-white/10 rounded-xl self-start overflow-x-auto">
            {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  level === lvl
                    ? "bg-cyan-500 text-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {lvl === "BEGINNER" ? t("beginner") : lvl === "INTERMEDIATE" ? t("intermediate") : t("advanced")}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center p-12 space-x-3 text-cyan-300 font-mono text-xs">
            <RefreshCw className="h-5 w-5 animate-spin text-cyan-300" />
            <span>Computing muscle glucose oxidation exercises...</span>
          </div>
        )}

        {/* Exercises display list */}
        {!loading && activePlan && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Exercises Listing */}
            <div className="md:col-span-8 space-y-4">
              {(activePlan.exercises || []).map((ex: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-cyan-300/30 transition-all text-left"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-300 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="font-bold text-white text-sm">{ex.name}</h3>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg pl-7">
                      {ex.description}
                    </p>
                  </div>
                  <div className="pl-7 sm:pl-0">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[10px] text-cyan-300 font-bold whitespace-nowrap">
                      {ex.repsSets}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Workouts summary metrics */}
            <div className="md:col-span-4 space-y-6">
              
              <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-5 text-left">
                <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <h4 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-widest">
                     Session Metrics
                  </h4>
                </div>

                <div className="space-y-4 font-sans text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-slate-400">Total Duration:</span>
                    <span className="font-bold text-white font-mono">{activePlan.durationMinutes} {t("minutes")}</span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-slate-400">Critical Cooldown Recovery:</span>
                    <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-1">
                      <div className="font-bold text-purple-300 text-xs">{activePlan.cooldown?.title}</div>
                      <div className="text-[10px] text-slate-400">Duration: {activePlan.cooldown?.duration}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Physiotherapy guide alert */}
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-[10px] text-slate-400 leading-normal text-left">
                <span className="font-bold text-cyan-300">💡 Metabolic Fact:</span> Resistance workouts engage larger muscle skeletal frames. Stimulating GLUT-4 transporters boosts glucose consumption directly without loading additional insulin demands.
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
