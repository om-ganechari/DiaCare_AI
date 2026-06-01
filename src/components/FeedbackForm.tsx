import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Star, MessageSquareCode, CheckCircle2, AlertTriangle } from "lucide-react";

export const FeedbackForm: React.FC = () => {
  const { addFeedback, t } = useApp();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      await addFeedback(rating, comment);
      setStatus({ type: "success", message: t("feedbackSuccess") });
      setComment("");
      setRating(5);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "error", message: t("feedbackError") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="feedback-form-container" className="w-full max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden text-left font-sans">
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[60px]" />
      
      <div className="space-y-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/10">
            <MessageSquareCode className="h-5 w-5" />
          </div>
          <div>
            <h3 id="feedback-title" className="text-xl font-bold text-white tracking-tight">
              {t("giveFeedbackTitle")}
            </h3>
            <p className="text-xs text-slate-400">
              {t("giveFeedbackDesc")}
            </p>
          </div>
        </div>

        <form id="opinion-submission-form" onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Rating stars row */}
          <div className="space-y-2">
            <label id="rating-stars-label" className="block text-xs font-mono font-bold text-slate-300 uppercase">
              {t("ratingLabel")}
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  id={`feedback-star-btn-${star}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (hoverRating ?? rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-600 fill-transparent"
                    }`}
                  />
                </button>
              ))}
              <span id="star-value-indicator" className="text-sm font-mono font-bold text-cyan-300 ml-2">
                {hoverRating ?? rating} / 5
              </span>
            </div>
          </div>

          {/* Comment text-area field */}
          <div className="space-y-2">
            <label id="suggestion-comments-label" className="block text-xs font-mono font-bold text-slate-300 uppercase">
              {t("commentLabel")}
            </label>
            <textarea
              id="feedback-comment-textarea"
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("sedentaryPlaceholder")}
              className="w-full text-sm rounded-xl bg-black/40 border border-white/10 p-3 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-sans placeholder-slate-500"
            />
          </div>

          {/* Status Display Alerts */}
          {status && (
            <div
              id="feedback-status-element"
              className={`p-4 rounded-xl border flex items-start space-x-3 ${
                status.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <span className="text-xs font-semibold leading-relaxed">{status.message}</span>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              id="submit-opinion-btn"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-sans text-xs font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg"
            >
              {loading ? (
                <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
              ) : (
                t("submitFeedbackBtn")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
