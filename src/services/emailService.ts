import emailjs from "@emailjs/browser";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export interface EmailParams {
  user_name: string;
  user_email: string;
  prediction: string;
  risk_level: string;
  health_score: number;
  date: string;
  pdf_report?: string; // Optional base64 encoded PDF report string
}

// Provided EmailJS configuration coordinates:
const EMAILJS_SERVICE_ID = "service_t22rlbu";
const EMAILJS_PUBLIC_KEY = "B3CCC53_B1bdnhuFY";

// Configurable Template ID variables (can be modified easily as requested)
export const EMAILJS_TEMPLATE_DEFAULT = "template_zqtnx0i";
export const EMAILJS_TEMPLATE_ASSESSMENT_COMPLETE = "template_assessment_complete";
export const EMAILJS_TEMPLATE_PREDICTION_REPORT = "template_prediction_report";

/**
 * Validates whether an email format conforms to standard specifications.
 */
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Stores email report transaction audit log inside Firestore under the 'reports' collection.
 */
export async function storeEmailStatusInFirestore(params: {
  uid: string;
  email: string;
  reportSent: boolean;
  templateId?: string;
}): Promise<void> {
  const recordId = "rpt_mail_" + Date.now().toString();
  const reportPayload = {
    uid: params.uid,
    email: params.email,
    reportSent: params.reportSent,
    templateId: params.templateId || "default",
    reportDate: new Date().toISOString(),
  };

  console.log(`[Firestore Audit] Writing email delivery log to Firestore collections:`, reportPayload);

  // 1. Maintain root /reports collection compliance:
  try {
    const rootDocRef = doc(db, "reports", recordId);
    await setDoc(rootDocRef, reportPayload);
    console.log(`[Firestore Audit] Successfully saved to root collection 'reports/${recordId}'`);
  } catch (err: any) {
    console.warn(`[Firestore Audit] Root collection write not completed (rules permission check):`, err.message || err);
  }

  // 2. Also write to users subcollection to support in-app user records rendering:
  try {
    const subDocRef = doc(db, "users", params.uid, "reports", recordId);
    await setDoc(subDocRef, {
      reportId: recordId,
      fileName: `Email Report - ${params.reportSent ? "SUCCESS" : "FAILED"}`,
      fileType: "application/pdf_link",
      fileSize: 0,
      insights: `Risk notification template [${params.templateId || "default"}] dispatched to ${params.email}. Status: ${params.reportSent ? "Sent" : "Dispatch Error"}`,
      uploadedAt: new Date().toISOString(),
    });
    console.log(`[Firestore Audit] Saved to subcollection 'users/${params.uid}/reports/${recordId}'`);
  } catch (err: any) {
    console.warn(`[Firestore Audit] Subcollection write failed:`, err.message || err);
  }
}

/**
 * Reusable function to dispatch Assessment Reports using template_assessment_complete
 * Includes dynamic parameters mapped to support different email layouts.
 */
export async function sendAssessmentEmail(params: EmailParams & { answers?: any; lifestyle_score?: number }): Promise<{ success: boolean; text?: string; error?: string }> {
  console.log("%c[EmailJS Assessment Dispatch] Initiated", "color: #c084fc; font-weight: bold;");
  
  const recipientEmail = params.user_email ? params.user_email.trim() : "";

  if (!recipientEmail || recipientEmail === "" || !validateEmail(recipientEmail)) {
    return { success: false, error: "Invalid recipient email address" };
  }

  // Map specialized layout variables for the lifestyle / self-assessment survey complete template
  const templateParams = {
    user_Email: recipientEmail,
    email: recipientEmail,
    name: params.user_name,
    user_name: params.user_name,
    // Custom Layout Parameters
    email_layout: "assessment_complete_theme",
    assessment_title: "DiaCare AI Lifestyle Metabolic Assessment Complete",
    assessment_type: "Lifestyle & Demographics Evaluation",
    lifestyle_score: params.lifestyle_score !== undefined ? params.lifestyle_score : params.health_score,
    exercise_frequency: params.answers?.exerciseFrequency || "N/A",
    diet_quality: params.answers?.dietQuality || "N/A",
    sleep_pattern: params.answers?.sleepHours || "N/A",
    stress_level: params.answers?.stressLevel || "N/A",
    family_history: params.answers?.familyDiabetes || "N/A",
    risk_level: params.risk_level,
    health_score: params.health_score,
    prediction_summary: params.prediction,
    assessment_date: params.date,
    date: params.date,
    pdf_report: params.pdf_report || "",
    disclaimer: "This tool provides educational information and is not a substitute for medical advice."
  };

  console.log("[EmailJS Assessment Layout Metrics]", templateParams);

  const currentUid = auth.currentUser?.uid || "anonymous_user";

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ASSESSMENT_COMPLETE,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    console.log("[EmailJS Assessment Success]", response);
    
    await storeEmailStatusInFirestore({
      uid: currentUid,
      email: recipientEmail,
      reportSent: true,
      templateId: EMAILJS_TEMPLATE_ASSESSMENT_COMPLETE
    });

    return { success: true, text: response.text };
  } catch (error: any) {
    console.error("[EmailJS Assessment Failed]", error);
    
    await storeEmailStatusInFirestore({
      uid: currentUid,
      email: recipientEmail,
      reportSent: false,
      templateId: EMAILJS_TEMPLATE_ASSESSMENT_COMPLETE
    });

    return { success: false, error: error?.text || error?.message || String(error) };
  }
}

/**
 * Reusable function to dispatch Prediction Reports using template_prediction_report
 * Includes dynamic parameters mapped to support different email layouts.
 */
export async function sendPredictionEmail(params: EmailParams & { metrics?: any; risk_percentage?: number; insights?: string }): Promise<{ success: boolean; text?: string; error?: string }> {
  console.log("%c[EmailJS Prediction Dispatch] Initiated", "color: #22d3ee; font-weight: bold;");

  const recipientEmail = params.user_email ? params.user_email.trim() : "";

  if (!recipientEmail || recipientEmail === "" || !validateEmail(recipientEmail)) {
    return { success: false, error: "Invalid recipient email address" };
  }

  // Map specialized layout variables for the metabolic numeric parameters prediction template
  const templateParams = {
    user_Email: recipientEmail,
    email: recipientEmail,
    name: params.user_name,
    user_name: params.user_name,
    // Custom Layout Parameters
    email_layout: "prediction_report_theme",
    report_title: "DiaCare AI Metabolic Intelligence Prediction Report",
    glucose_level: params.metrics?.glucose !== undefined ? `${params.metrics.glucose} mg/dL` : "N/A",
    insulin_level: params.metrics?.insulin !== undefined ? `${params.metrics.insulin} uIU/mL` : "N/A",
    blood_pressure: params.metrics?.bloodPressure !== undefined ? `${params.metrics.bloodPressure} mmHg` : "N/A",
    bmi: params.metrics?.bmi !== undefined ? `${params.metrics.bmi} kg/m²` : "N/A",
    age: params.metrics?.age !== undefined ? `${params.metrics.age} years` : "N/A",
    risk_level: params.risk_level,
    risk_percentage: params.risk_percentage !== undefined ? params.risk_percentage : params.health_score,
    health_score: params.health_score,
    insights: params.insights || params.prediction,
    prediction_details: params.prediction,
    report_date: params.date,
    date: params.date,
    pdf_report: params.pdf_report || "",
    disclaimer: "This tool provides educational information and is not a substitute for medical advice."
  };

  console.log("[EmailJS Prediction Layout Metrics]", templateParams);

  const currentUid = auth.currentUser?.uid || "anonymous_user";

  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_PREDICTION_REPORT,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    console.log("[EmailJS Prediction Success]", response);

    await storeEmailStatusInFirestore({
      uid: currentUid,
      email: recipientEmail,
      reportSent: true,
      templateId: EMAILJS_TEMPLATE_PREDICTION_REPORT
    });

    return { success: true, text: response.text };
  } catch (error: any) {
    console.error("[EmailJS Prediction Failed]", error);

    await storeEmailStatusInFirestore({
      uid: currentUid,
      email: recipientEmail,
      reportSent: false,
      templateId: EMAILJS_TEMPLATE_PREDICTION_REPORT
    });

    return { success: false, error: error?.text || error?.message || String(error) };
  }
}

/**
 * Reusable function to trigger clean, professional email report dispatches via EmailJS. Includes
 * automated diagnostic logging and a single automatic retry-on-failure safety construct.
 */
export async function sendAssessmentReport(params: EmailParams): Promise<{ success: boolean; text?: string; error?: string }> {
  console.log("%c[EmailJS Dispatcher] Initialized Connection Attempt", "color: #22d3ee; font-weight: bold;");
  
  const recipientEmail = params.user_email ? params.user_email.trim() : "";

  // Early robust validation to prevent dispatching with an empty or malformed address
  if (!recipientEmail || recipientEmail === "") {
    console.error("[EmailJS Early Validation Fail] Recipient address is empty.");
    return {
      success: false,
      error: "The recipients address is empty"
    };
  }

  if (!validateEmail(recipientEmail)) {
    console.error("[EmailJS Early Validation Fail] Recipient address format is invalid:", recipientEmail);
    return {
      success: false,
      error: "Invalid email format"
    };
  }
  
  console.log("[EmailJS Details] Targets -> API public_key active, TemplateID active.");
  
  const templateParams = {
    user_Email: recipientEmail,
    email: recipientEmail,
    name: params.user_name,
    user_name: params.user_name,
    prediction: params.prediction,
    risk_level: params.risk_level,
    health_score: params.health_score,
    date: params.date,
    pdf_report: params.pdf_report || "",
  };

  console.log("Recipient:", recipientEmail);
  console.log(templateParams);

  const sendWithWrapper = async () => {
    return await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_DEFAULT,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
  };

  const currentUid = auth.currentUser?.uid || "anonymous_user";

  try {
    // Attempt 1:
    const response = await sendWithWrapper();
    console.log("%c[EmailJS System] Email delivered successfully on first attempt!", "color: #10b981; font-weight: bold;", response);
    
    // Mandatory logger for EmailJS response (Requirement 6)
    console.log("[EmailJS Response SUCCESS Log] First attempt response:", response);

    // Store success state in firestore:
    await storeEmailStatusInFirestore({
      uid: currentUid,
      email: params.user_email,
      reportSent: true,
      templateId: EMAILJS_TEMPLATE_DEFAULT
    });

    return { success: true, text: response.text };
  } catch (error: any) {
    console.warn("%c[EmailJS Attempt 1 Fail] Dispatched encountered network error:", "color: #f59e0b;", error);
    
    // Mandatory logger for EmailJS error (Requirement 6)
    console.error("[EmailJS Error Log] First attempt failed:", error);

    console.log("[EmailJS Retry Logic] Automatically retrying delivery once now...");

    try {
      // Attempt 2 (Auto-retry):
      const retryResponse = await sendWithWrapper();
      console.log("%c[EmailJS System] Email delivered successfully on retry attempt!", "color: #10b981; font-weight: bold;", retryResponse);

      // Mandatory logger for EmailJS response (Requirement 6)
      console.log("[EmailJS Response SUCCESS Log] Retry attempt response:", retryResponse);

      await storeEmailStatusInFirestore({
        uid: currentUid,
        email: params.user_email,
        reportSent: true,
        templateId: EMAILJS_TEMPLATE_DEFAULT
      });

      return { success: true, text: retryResponse.text };
    } catch (retryError: any) {
      console.error("%c[EmailJS Disaster Fail] Dispatch failed permanently on all attempts:", "color: #ef4444; font-weight: bold;", retryError);

      // Mandatory logger for EmailJS error (Requirement 6)
      console.error("[EmailJS Error Log] Final attempt failed:", retryError);

      await storeEmailStatusInFirestore({
        uid: currentUid,
        email: params.user_email,
        reportSent: false,
        templateId: EMAILJS_TEMPLATE_DEFAULT
      });

      return {
        success: false,
        error: retryError?.text || retryError?.message || String(retryError),
      };
    }
  }
}
