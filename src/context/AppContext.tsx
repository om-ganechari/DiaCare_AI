import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  getDocFromServer,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  Language,
  UserProfile,
  AssessmentRecord,
  PredictionRecord,
  ReportRecord,
  PredictionMetrics,
  RiskAssessmentAnswers,
} from "../types";
import { translations } from "../translations";

// --- Operation Type and Error Handling according to Skills Guidelines ---
enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error Check:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export type Page =
  | "landing"
  | "login"
  | "signup"
  | "dashboard"
  | "assessment"
  | "prediction"
  | "upload"
  | "results"
  | "diet"
  | "workout"
  | "profile"
  | "forgot";

interface AppContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  language: Language;
  currentPage: Page;
  assessments: AssessmentRecord[];
  predictions: PredictionRecord[];
  reports: ReportRecord[];
  currentPredictionResult: PredictionRecord | null;
  emailStatus: { type: "success" | "error"; message: string } | null;
  setEmailStatus: (status: { type: "success" | "error"; message: string } | null) => void;
  setLanguage: (lang: Language) => void;
  setCurrentPage: (page: Page) => void;
  t: (key: string) => string;
  loginWithGoogle: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, fullName: string, age?: number, gender?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileDemographics: (fullName: string, age?: number, gender?: string) => Promise<void>;
  addAssessment: (answers: RiskAssessmentAnswers, riskScore: number, riskLevel: "LOW" | "MODERATE" | "HIGH") => Promise<void>;
  addPrediction: (metrics: PredictionMetrics, riskPercentage: number, riskLevel: "LOW" | "MODERATE" | "HIGH", insights: string) => Promise<void>;
  addReport: (fileName: string, fileType: string, fileSize: number, insights: string) => Promise<void>;
  addFeedback: (rating: number, comment: string) => Promise<void>;
  testFirestoreConnection: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguageState] = useState<Language>("en");
  const [currentPage, setCurrentPage] = useState<Page>("landing");

  // Clinical records state lists
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [currentPredictionResult, setCurrentPredictionResult] = useState<PredictionRecord | null>(null);
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Translate utility helper function
  const t = (key: string): string => {
    return translations[language][key] || translations["en"][key] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (user) {
      // Sync language to firestore profile asynchronously
      const path = `users/${user.uid}`;
      setDoc(doc(db, "users", user.uid), { language: lang }, { merge: true })
        .then(() => {
          setUserProfile((prev) => prev ? { ...prev, language: lang } : null);
        })
        .catch((err) => {
          console.warn("Language firestore update skipped", err);
        });
    }
  };

  // Mandatory Connection Validation according to firebase skill
  const testFirestoreConnection = async () => {
    const testPath = "test/connection";
    try {
      await getDocFromServer(doc(db, "test", "connection"));
    } catch (error) {
      if (error instanceof Error && error.message.includes("the client is offline")) {
        console.error("Please check your Firebase configuration. The client appears offline.");
      }
    }
  };

  // Fetch clinical historical records for authenticated user profile
  const fetchUserRecords = async (userId: string) => {
    const listPathAssessments = `users/${userId}/assessments`;
    try {
      const assessmentSnap = await getDocs(collection(db, "users", userId, "assessments"));
      const resolvedAssessmentsList: AssessmentRecord[] = [];
      assessmentSnap.forEach((docSnap) => {
        resolvedAssessmentsList.push(docSnap.data() as AssessmentRecord);
      });
      // Sort newest completed assessments first
      resolvedAssessmentsList.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      setAssessments(resolvedAssessmentsList);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, listPathAssessments);
    }

    const listPathPredictions = `users/${userId}/predictions`;
    try {
      const predictionSnap = await getDocs(collection(db, "users", userId, "predictions"));
      const resolvedPredictionsList: PredictionRecord[] = [];
      predictionSnap.forEach((docSnap) => {
        resolvedPredictionsList.push(docSnap.data() as PredictionRecord);
      });
      resolvedPredictionsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPredictions(resolvedPredictionsList);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, listPathPredictions);
    }

    const listPathReports = `users/${userId}/reports`;
    try {
      const reportsSnap = await getDocs(collection(db, "users", userId, "reports"));
      const resolvedReportsList: ReportRecord[] = [];
      reportsSnap.forEach((docSnap) => {
        resolvedReportsList.push(docSnap.data() as ReportRecord);
      });
      resolvedReportsList.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      setReports(resolvedReportsList);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, listPathReports);
    }
  };

  // Sign out method
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
    setAssessments([]);
    setPredictions([]);
    setReports([]);
    setCurrentPredictionResult(null);
    setCurrentPage("landing");
  };

  // Google Secure Authentication using pop-up strategy recommended for IFrame preview environments
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    setUser(cred.user);

    // Bootstrap profile records for new Google User signup
    const profilePath = `users/${cred.user.uid}`;
    try {
      const docRef = doc(db, "users", cred.user.uid);
      const docSnap = await getDoc(docRef);
      const nowString = new Date().toISOString();

      if (!docSnap.exists()) {
        const uProfile: UserProfile = {
          uid: cred.user.uid,
          name: cred.user.displayName || "Clinical User",
          email: cred.user.email || "",
          language: "en",
          createdAt: nowString,
          lastLogin: nowString,
          photoURL: cred.user.photoURL || "",
        };
        await setDoc(docRef, uProfile);
        setUserProfile(uProfile);
      } else {
        const existingData = docSnap.data();
        const updateObj = {
          lastLogin: nowString,
          photoURL: cred.user.photoURL || existingData.photoURL || ""
        };
        await setDoc(docRef, updateObj, { merge: true });
        setUserProfile({
          ...(existingData as UserProfile),
          ...updateObj
        });
      }
      await fetchUserRecords(cred.user.uid);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, profilePath);
    }
  };

  // Sign In safely via standard firebase password Auth flow
  const login = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    setUser(cred.user);
    
    // Save/update lastLogin in Firestore
    const profileRef = doc(db, "users", cred.user.uid);
    const profilePath = `users/${cred.user.uid}`;
    try {
      const nowString = new Date().toISOString();
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        const existingData = profileSnap.data();
        const updateObj = {
          lastLogin: nowString,
          photoURL: cred.user.photoURL || existingData.photoURL || ""
        };
        await setDoc(profileRef, updateObj, { merge: true });
        setUserProfile({
          ...(existingData as UserProfile),
          ...updateObj
        });
      } else {
        const uProfile: UserProfile = {
          uid: cred.user.uid,
          name: cred.user.displayName || email.split("@")[0],
          email: cred.user.email || email,
          language: language,
          createdAt: nowString,
          lastLogin: nowString,
          photoURL: cred.user.photoURL || "",
        };
        await setDoc(profileRef, uProfile);
        setUserProfile(uProfile);
      }
      await fetchUserRecords(cred.user.uid);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, profilePath);
    }
  };

  // Create Profile Register standard firebase Auth flow
  const register = async (
    email: string,
    pass: string,
    fullName: string,
    age?: number,
    gender?: string
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const uUid = cred.user.uid;
    const profilePath = `users/${uUid}`;
    const nowString = new Date().toISOString();

    const profileData: UserProfile = {
      uid: uUid,
      name: fullName,
      email: cred.user.email || email,
      age: age || undefined,
      gender: gender || undefined,
      language: language,
      createdAt: nowString,
      lastLogin: nowString,
      photoURL: cred.user.photoURL || "",
    };

    try {
      await setDoc(doc(db, "users", uUid), profileData);
      setUserProfile(profileData);
      setUser(cred.user);
      await fetchUserRecords(uUid);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, profilePath);
    }
  };

  // Reset clinical profile account password
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Edit user profile bio or demographics info
  const updateProfileDemographics = async (
    fullName: string,
    age?: number,
    gender?: string
  ) => {
    if (!user) return;
    const profilePath = `users/${user.uid}`;
    const updateData = {
      name: fullName,
      age: age || null,
      gender: gender || null,
    };

    try {
      await setDoc(doc(db, "users", user.uid), updateData, { merge: true });
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              name: fullName,
              age: age || prev.age,
              gender: gender || prev.gender,
            }
          : null
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, profilePath);
    }
  };

  // Record an online lifestyle audit survey
  const addAssessment = async (
    answers: RiskAssessmentAnswers,
    riskScore: number,
    riskLevel: "LOW" | "MODERATE" | "HIGH"
  ) => {
    if (!user) return;
    const recordId = "asm_" + Date.now().toString();
    const path = `users/${user.uid}/assessments/${recordId}`;

    const newRecord: AssessmentRecord = {
      assessmentId: recordId,
      answers,
      riskScore,
      riskLevel,
      completedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "users", user.uid, "assessments", recordId), newRecord);
      setAssessments((prev) => [newRecord, ...prev]);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  // Store client metadata and deep AI diagnostic reports
  const addPrediction = async (
    metrics: PredictionMetrics,
    riskPercentage: number,
    riskLevel: "LOW" | "MODERATE" | "HIGH",
    insights: string
  ) => {
    if (!user) return;
    const recordId = "prd_" + Date.now().toString();
    const path = `users/${user.uid}/predictions/${recordId}`;

    const newRecord: PredictionRecord = {
      predictionId: recordId,
      metrics,
      riskPercentage,
      riskLevel,
      insights,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "users", user.uid, "predictions", recordId), newRecord);
      setPredictions((prev) => [newRecord, ...prev]);
      setCurrentPredictionResult(newRecord);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  // Save parsed result reports to DB
  const addReport = async (
    fileName: string,
    fileType: string,
    fileSize: number,
    insights: string,
    pdfUrl?: string
  ) => {
    if (!user) return;
    const recordId = "rpt_" + Date.now().toString();
    const path = `users/${user.uid}/reports/${recordId}`;

    const newRecord: ReportRecord = {
      reportId: recordId,
      fileName,
      fileType,
      fileSize,
      insights,
      uploadedAt: new Date().toISOString(),
      pdfUrl,
    };

    try {
      await setDoc(doc(db, "users", user.uid, "reports", recordId), newRecord);
      setReports((prev) => [newRecord, ...prev]);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  // Submit secure diagnostic sentiment/feedback to firestore root
  const addFeedback = async (rating: number, comment: string) => {
    const feedbackId = "fb_" + Date.now().toString();
    const path = `feedback/${feedbackId}`;

    const newFeedback = {
      feedbackId,
      userId: user?.uid || "anonymous",
      userName: userProfile?.name || user?.displayName || "Reviewer",
      rating,
      comment,
      submittedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "feedback", feedbackId), newFeedback);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  // React state initialization monitoring authentication transitions
  useEffect(() => {
    testFirestoreConnection();

    // Setup active state change listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        // Get user configuration profile from DB
        const profileRef = doc(db, "users", firebaseUser.uid);
        const profilePath = `users/${firebaseUser.uid}`;
        try {
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const prof = profileSnap.data() as UserProfile;
            setUserProfile(prof);
            if (prof.language) {
              setLanguageState(prof.language);
            }
          } else {
            // New user registration or bypass scenario
            const uProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || "Patient Overview",
              email: firebaseUser.email || "",
              language: "en",
              createdAt: new Date().toISOString(),
            };
            setUserProfile(uProfile);
          }
          // Fetch diagnostic clinical record trees
          await fetchUserRecords(firebaseUser.uid);
        } catch (err) {
          console.warn("Firestore profile fetch bypassed.", err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        userProfile,
        loading,
        language,
        currentPage,
        assessments,
        predictions,
        reports,
        currentPredictionResult,
        setLanguage,
        setCurrentPage,
        t,
        loginWithGoogle,
        login,
        register,
        resetPassword,
        logout,
        updateProfileDemographics,
        addAssessment,
        addPrediction,
        addReport,
        addFeedback,
        testFirestoreConnection,
        emailStatus,
        setEmailStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used inside the AppProvider frame.");
  }
  return context;
};
