/*
=========================================
AI Planner Page
-----------------------------------------
Purpose:
Deconstructs large user goals into roadmaps.
Deploys roadmaps to tasks, tracks progress
automatically, and provides code boilerplates,
checklists, and strategy guidelines for steps.
=========================================
*/

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  generateGoalPlan,
  deployGoalPlan,
  subscribeToGoalPlans,
  deleteGoalPlan,
  getSubtaskAssistMaterial,
} from "../services/aiPlanner";
import {
  Milestone,
  Sparkles,
  ChevronRight,
  Plus,
  Play,
  ArrowRight,
  CheckCircle,
  Clock,
  Code,
  Trash2,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";

function Planner() {
  const { user, tasks } = useAuth();
  
  // Active plans list
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // New plan creation state
  const [goal, setGoal] = useState("");
  const [timeframe, setTimeframe] = useState("1 week");
  const [loading, setLoading] = useState(false);
  const [tempRoadmap, setTempRoadmap] = useState(null);

  // AI execution assistant state
  const [assistStep, setAssistStep] = useState(null);
  const [assistMaterial, setAssistMaterial] = useState("");
  const [loadingAssist, setLoadingAssist] = useState(false);

  // Subscribe to plans
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToGoalPlans(user.uid, (data) => {
      setPlans(data);
      // Auto select first plan if none selected
      if (data.length > 0 && !selectedPlan) {
        setSelectedPlan(data[0]);
      }
    });
    return unsub;
  }, [user, selectedPlan]);

  // Track subtask completion from Firestore tasks collection
  const planSubtaskStatuses = useEffect(() => {
    if (!selectedPlan || !tasks) return;
    
    // Find all tasks related to this planId
    const planTasks = tasks.filter((t) => t.planId === selectedPlan.id);
    
    // Check if subtasks are complete based on corresponding task completion
    const updatedSteps = selectedPlan.steps.map((step) => {
      // Find task with matching stepNumber
      const matchingTask = planTasks.find((t) => t.stepNumber === step.stepNumber);
      return {
        ...step,
        completed: matchingTask ? matchingTask.completed : step.completed,
        taskId: matchingTask ? matchingTask.id : null,
      };
    });

    // Only update if there is a real difference to avoid infinite renders
    const stepsChanged = JSON.stringify(updatedSteps) !== JSON.stringify(selectedPlan.steps);
    if (stepsChanged) {
      setSelectedPlan((prev) => ({ ...prev, steps: updatedSteps }));
    }
  }, [tasks, selectedPlan]);

  // Calculate overall plan progress
  const planProgress = (plan) => {
    if (!plan || !plan.steps.length) return 0;
    const completed = plan.steps.filter((s) => s.completed).length;
    return Math.round((completed / plan.steps.length) * 100);
  };

  // Trigger Gemini plan generation
  async function handleCreateDraftPlan(e) {
    e.preventDefault();
    if (!goal.trim()) return;

    try {
      setLoading(true);
      setTempRoadmap(null);
      const planSteps = await generateGoalPlan(goal, timeframe);
      setTempRoadmap(planSteps);
      toast.success("AI roadmap generated! Review details below.");
    } catch (error) {
      toast.error("Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  }

  // Confirm plan and deploy to Firestore tasks collection
  async function handleDeployPlan() {
    if (!tempRoadmap || !goal.trim()) return;

    try {
      setLoading(true);
      const planId = await deployGoalPlan(goal, tempRoadmap);
      setTempRoadmap(null);
      setGoal("");
      toast.success("Plan deployed! Tasks created on your dashboard.");
    } catch (error) {
      toast.error("Failed to deploy plan.");
    } finally {
      setLoading(false);
    }
  }

  // Delete plan
  async function handleDeletePlan(planId) {
    if (!window.confirm("Are you sure you want to delete this plan? This will also remove all associated tasks on your dashboard.")) return;
    try {
      await deleteGoalPlan(planId, true);
      setSelectedPlan(null);
      toast.success("Plan deleted.");
    } catch (error) {
      toast.error("Failed to delete plan.");
    }
  }

  // Fetch AI execute guidelines for a specific step
  async function handleRequestAssist(step) {
    setAssistStep(step);
    setAssistMaterial("");
    setLoadingAssist(true);

    try {
      const material = await getSubtaskAssistMaterial(
        selectedPlan ? selectedPlan.goalTitle : goal,
        step.title,
        step.description
      );
      setAssistMaterial(material);
    } catch (error) {
      setAssistMaterial("Unable to load instructions. Please try again.");
    } finally {
      setLoadingAssist(false);
    }
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-10 animate-fadeIn">
        <h1 className="text-4xl font-extrabold flex items-center gap-3">
          <Milestone className="text-cyan-500 animate-pulse" size={38} />
          Autonomous AI Planner
        </h1>
        <p className="mt-2 text-slate-400 max-w-2xl text-sm leading-relaxed">
          Deconstruct high-level goals into chronological checklists. Deploy plans directly to your task manager and invoke the AI assistant for code starter templates, strategies, and blueprints.
        </p>
      </div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-4">
        {/* Left Side: Plans List & New Plan Trigger */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur shadow-sm">
            <h2 className="text-lg font-bold text-white mb-4">Active AI Plans</h2>
            {plans.length === 0 ? (
              <p className="text-xs text-slate-500">No active plans. Generate a roadmap below!</p>
            ) : (
              <div className="space-y-3">
                {plans.map((p) => {
                  const progress = planProgress(p);
                  const isSelected = selectedPlan?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedPlan(p);
                        setTempRoadmap(null);
                        setAssistStep(null);
                      }}
                      className={`group rounded-2xl border p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-500/5 shadow-md"
                          : "border-slate-800 bg-slate-950/20 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className={`font-semibold text-sm truncate ${isSelected ? "text-cyan-400" : "text-white"}`}>
                          {p.goalTitle}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlan(p.id);
                          }}
                          className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                          title="Delete Plan"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      
                      {/* Simple Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* New Plan Creator Form */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur shadow-sm">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-1.5">
              <Sparkles className="text-cyan-500" size={18} />
              New Goal Roadmap
            </h2>
            <form onSubmit={handleCreateDraftPlan} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-550 mb-2 font-semibold">Goal Description</label>
                <textarea
                  rows={3}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Deploy a Dockerized Next.js website with SSL certificates on AWS EC2"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs text-white outline-none focus:border-cyan-500 transition resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-550 mb-2 font-semibold">Timeline</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs text-white outline-none focus:border-cyan-500 transition"
                >
                  <option value="3 days">3 Days</option>
                  <option value="5 days">5 Days</option>
                  <option value="1 week">1 Week</option>
                  <option value="2 weeks">2 Weeks</option>
                  <option value="1 month">1 Month</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !goal.trim()}
                className="w-full rounded-xl bg-cyan-500 text-slate-950 font-bold py-3 text-xs hover:bg-cyan-400 transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading && !tempRoadmap ? (
                  <span>Deconstructing...</span>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Deconstruct Goal
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Center/Right: Roadmap Display & Execution Guidelines */}
        <div className="lg:col-span-3 space-y-6">
          {/* Draft Plan Review */}
          {tempRoadmap && (
            <div className="rounded-3xl border border-yellow-500/30 bg-amber-500/5 p-6 backdrop-blur shadow-sm animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                    Draft Roadmap
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-3">Verify Deconstructed Roadmap</h2>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTempRoadmap(null)}
                    className="rounded-xl border border-slate-700 bg-slate-850 px-4 py-2.5 text-xs text-slate-350 hover:bg-slate-800 transition cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleDeployPlan}
                    disabled={loading}
                    className="rounded-xl bg-cyan-500 text-slate-950 px-5 py-2.5 text-xs font-bold hover:bg-cyan-400 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} />
                    Deploy to Task Board
                  </button>
                </div>
              </div>

              {/* Steps checklist */}
              <div className="space-y-4">
                {tempRoadmap.map((step) => (
                  <div key={step.stepNumber} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-white text-base">{step.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-slate-800 text-slate-450 px-2 py-0.5 rounded">
                            {step.estimatedDuration}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            step.priority === "High" ? "bg-red-500/10 text-red-400" :
                            step.priority === "Medium" ? "bg-amber-500/10 text-amber-400" :
                            "bg-blue-500/10 text-blue-400"
                          }`}>
                            {step.priority}
                          </span>
                        </div>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-450">{step.description}</p>
                      <button
                        onClick={() => handleRequestAssist(step)}
                        className="mt-3 text-[10.5px] font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Code size={12} />
                        Get Executable Blueprint
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Selected Plan Detail */}
          {selectedPlan && !tempRoadmap && (
            <div className="grid gap-6 grid-cols-1 xl:grid-cols-5">
              {/* Steps Roadmap */}
              <div className="xl:col-span-3 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur shadow-sm space-y-6">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                      Deployed Roadmap
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-3">{selectedPlan.goalTitle}</h2>
                  </div>
                  <button
                    onClick={() => handleDeletePlan(selectedPlan.id)}
                    className="rounded-xl border border-red-500/25 bg-red-500/5 hover:bg-red-500/15 p-2 text-red-400 transition cursor-pointer"
                    title="Delete Plan"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="relative pl-6 space-y-8 border-l border-slate-800/80 ml-4">
                  {selectedPlan.steps.map((step) => {
                    const isCompleted = step.completed;
                    return (
                      <div key={step.stepNumber} className="relative">
                        {/* Bullet Circle marker */}
                        <div className={`absolute -left-[35px] top-1.5 h-6.5 w-6.5 rounded-full flex items-center justify-center border font-bold text-[10.5px] ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                            : "bg-slate-950 border-slate-800 text-slate-450"
                        }`}>
                          {isCompleted ? "✓" : step.stepNumber}
                        </div>

                        <div className={`rounded-2xl border p-5 transition-all ${
                          isCompleted
                            ? "border-emerald-500/20 bg-emerald-500/2"
                            : "border-slate-850 bg-slate-950/20 hover:border-slate-800"
                        }`}>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`font-semibold text-sm ${isCompleted ? "text-slate-400 line-through" : "text-white"}`}>
                              {step.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded">
                                {step.estimatedDuration}
                              </span>
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                                step.priority === "High" ? "bg-red-500/10 text-red-400" :
                                step.priority === "Medium" ? "bg-amber-500/10 text-amber-400" :
                                "bg-blue-500/10 text-blue-400"
                              }`}>
                                {step.priority}
                              </span>
                            </div>
                          </div>
                          <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{step.description}</p>
                          
                          <div className="mt-4 flex gap-3">
                            <button
                              onClick={() => handleRequestAssist(step)}
                              className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Code size={11} />
                              AI Execution Assist
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Execution assistance panel */}
              <div className="xl:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur shadow-sm h-fit">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-1.5">
                  <BookOpen className="text-cyan-500" size={18} />
                  AI Assist Terminal
                </h3>
                
                {!assistStep ? (
                  <div className="py-16 text-center text-slate-500">
                    <Code size={40} className="mx-auto mb-3 opacity-30 animate-pulse" />
                    <p className="text-xs">Select "AI Execution Assist" on a roadmap step to generate code boilerplates and checklist instructions.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-cyan-400">{assistStep.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase">Step {assistStep.stepNumber} Assistance</p>
                    </div>

                    <div className="border-t border-slate-800 my-4" />

                    {loadingAssist ? (
                      <div className="py-12 space-y-4">
                        <div className="h-4 w-3/4 rounded bg-slate-800 animate-pulse" />
                        <div className="h-4 w-5/6 rounded bg-slate-800 animate-pulse" />
                        <div className="h-4 w-2/3 rounded bg-slate-800 animate-pulse" />
                        <div className="h-4 w-1/2 rounded bg-slate-800 animate-pulse" />
                        <p className="text-center text-[10px] text-slate-550">AI Coach is compiling resources...</p>
                      </div>
                    ) : (
                      <div className="text-xs leading-relaxed text-slate-300 max-h-[500px] overflow-y-auto pr-1 select-text">
                        {/* Custom markdown render styling for assist terminal */}
                        <div
                          className="prose prose-invert prose-xs whitespace-pre-wrap font-sans"
                          dangerouslySetInnerHTML={{
                            __html: assistMaterial
                              .replace(/&/g, "&amp;")
                              .replace(/</g, "&lt;")
                              .replace(/>/g, "&gt;")
                              .replace(/```([\s\S]*?)```/g, (_, code) => {
                                return `<pre class="rounded-xl bg-slate-950 p-3 text-[10.5px] text-cyan-200 overflow-x-auto my-3 border border-slate-850 font-mono"><code>${code}</code></pre>`;
                              })
                              .replace(/`([^`\n]+)`/g, '<code class="rounded bg-slate-950 px-1 py-0.5 font-mono text-cyan-400">$1</code>')
                              .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
                              .replace(/\*(.+?)\*/g, '<em class="italic text-slate-400">$1</em>')
                              .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold text-white mt-4">$1</h3>')
                              .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-cyan-400 mt-5">$1</h2>')
                              .replace(/^# (.+)$/gm, '<h1 class="text-lg font-black text-white mt-6">$1</h1>')
                              .replace(/(?:^|\n)[*-] (.+?)(?=\n|$)/g, '<div class="flex items-start gap-2 mt-1.5"><span class="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-cyan-500"></span><span>$1</span></div>')
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {!tempRoadmap && !selectedPlan && (
            <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 py-24 text-center">
              <Milestone size={60} className="mx-auto text-cyan-500 animate-bounce" />
              <h2 className="mt-6 text-2xl font-semibold text-slate-900 dark:text-white">No plans active</h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400">Describe a goal on the left to start compiling your first AI roadmap.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Planner;
