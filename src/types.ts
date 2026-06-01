export type Language = "en" | "hi" | "mr";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  language: Language;
  createdAt: string;
  photoURL?: string;
  lastLogin?: string;
}

export interface RiskAssessmentAnswers {
  // Lifestyle group
  exerciseFrequency: string; // "never" | "occasional" | "regular"
  dietQuality: string; // "poor" | "average" | "excellent"
  sleepHours: string; // "poor" | "average" | "good"
  unusualThirst: boolean;
  frequentUrination: boolean;

  // Family group
  familyDiabetes: string; // "none" | "one_parent" | "both_parents" | "siblings"

  // Symptoms group
  suddenWeightLoss: boolean;
  chronicFatigue: boolean;
  blurredVision: boolean;
  slowHealing: boolean;

  // Additional questions
  tobaccoAlcoholUse?: string; // "none" | "moderate" | "heavy"
  stressLevel?: string; // "low" | "moderate" | "high"
  ageGroup?: string; // "under35" | "35to45" | "above45"
  gestationalHistory?: string; // "no" | "yes"
  tinglingSensations?: boolean;
  darkSkinPatches?: boolean;
  frequentInfections?: boolean;
  increasedHunger?: boolean;
}

export interface AssessmentRecord {
  assessmentId: string;
  answers: RiskAssessmentAnswers;
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  completedAt: string;
}

export interface PredictionMetrics {
  pregnancies: number;
  glucose: number;
  bloodPressure: number;
  skinThickness: number;
  insulin: number;
  bmi: number;
  pedigree: number;
  age: number;
}

export interface PredictionRecord {
  predictionId: string;
  metrics: PredictionMetrics;
  riskPercentage: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH";
  insights: string;
  createdAt: string;
}

export interface ReportRecord {
  reportId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  insights: string;
  uploadedAt: string;
  pdfUrl?: string;
}
