/*
=========================================
Progress Modal
-----------------------------------------
Purpose:
AI-powered progress tracking modal.
User describes work done, Gemini
estimates completion percentage.
=========================================
*/

import { useState, useRef, useEffect } from "react";
import { X, Sparkles, Save, RotateCcw, Brain } from "lucide-react";
import toast from "react-hot-toast";

import { analyzeProgress } from "../../services/progressService";
import { updateTaskProgress } from "../../services/taskService";

function ProgressModal({ isOpen, onClose, task }) {
  const [userUpdate, setUserUpdate] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const modalRef = useRef(null);
  const textareaRef = useRef(null);

  // -------------------------
  // ESC closes modal
  // -------------------------

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape" && !analyzing && !saving) {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, analyzing, saving]);

  // -------------------------
  // Close on backdrop click
  // -------------------------

  function handleBackdropClick(e) {
    if (modalRef.current === e.target && !analyzing && !saving) {
      onClose();
    }
  }

  // -------------------------
  // Analyze with Gemini
  // -------------------------

  async function handleAnalyze() {
    if (!userUpdate.trim()) {
      toast.error("Please describe what you've completed.");
      return;
    }

    try {
      setAnalyzing(true);
      const analysis = await analyzeProgress(task, userUpdate);
      setResult(analysis);
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze progress. Try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  // -------------------------
  // Save Progress
  // -------------------------

  async function handleSave() {
    if (!result) return;

    try {
      setSaving(true);
      const isCompleted = result.progress >= 100;
      await updateTaskProgress(task.id, result.progress, result.reason, isCompleted);

      if (isCompleted) {
        toast.success("🎉 Task marked as complete!");
      } else {
        toast.success("Progress updated successfully.");
      }

      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save progress.");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen || !task) return null;

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/70 backdrop-blur-md p-5
      "
    >
      <div
        className="
          w-full max-w-2xl rounded-3xl border border-slate-700
          bg-slate-900 shadow-2xl
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-7">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/10 p-2.5">
              <Brain size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-purple-400">
                AI Progress Analysis
              </p>
              <h2 className="mt-1 text-lg font-bold text-white truncate max-w-[400px]">
                {task.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={analyzing || saving}
            className="rounded-lg p-2 hover:bg-slate-800 transition disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-6 p-7">
          {/* Current Progress */}
          {(task.progress != null && task.progress > 0) && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-widest text-slate-500">
                  Current Progress
                </span>
                <span className="text-sm font-bold text-cyan-400">
                  {task.progress}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-700"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* User Input */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <Sparkles size={16} className="text-purple-400" />
              What have you completed so far?
            </label>
            <textarea
              ref={textareaRef}
              rows={4}
              value={userUpdate}
              onChange={(e) => setUserUpdate(e.target.value)}
              placeholder="e.g., I finished the login page, signup page, Google authentication and Firebase integration..."
              disabled={analyzing || saving}
              className="
                w-full rounded-xl border border-slate-700 bg-slate-800
                px-4 py-3 outline-none transition focus:border-purple-500
                placeholder:text-slate-600 disabled:opacity-50
              "
            />
          </div>

          {/* Analyze Button */}
          {!result && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !userUpdate.trim()}
              className="
                w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600
                px-6 py-3.5 font-semibold text-white
                transition hover:from-purple-500 hover:to-cyan-500
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {analyzing ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Gemini is analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze with AI
                </>
              )}
            </button>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Progress Bar */}
              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-300">
                    AI-Estimated Progress
                  </span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    {result.progress}%
                  </span>
                </div>

                <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                    style={{ width: `${result.progress}%` }}
                  />
                </div>

                {/* AI Reasoning */}
                <div className="mt-4 rounded-xl bg-slate-900/80 border border-slate-800 p-3.5">
                  <p className="text-xs uppercase tracking-widest text-purple-400 mb-1.5">
                    AI Analysis
                  </p>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {result.reason}
                  </p>
                </div>

                {result.progress >= 100 && (
                  <div className="mt-3 rounded-xl bg-green-500/10 border border-green-500/20 p-3">
                    <p className="text-sm text-green-400">
                      🎉 This task will be automatically marked as completed!
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setResult(null);
                    setUserUpdate("");
                  }}
                  disabled={saving}
                  className="
                    flex-1 rounded-xl border border-slate-700 bg-slate-800
                    px-5 py-3 text-sm font-medium text-slate-300
                    transition hover:border-purple-500 hover:text-white
                    disabled:opacity-50 flex items-center justify-center gap-2
                  "
                >
                  <RotateCcw size={16} />
                  Re-analyze
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="
                    flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500
                    px-5 py-3 text-sm font-semibold text-white
                    transition hover:from-cyan-400 hover:to-purple-400
                    disabled:opacity-50 flex items-center justify-center gap-2
                  "
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Progress
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProgressModal;
