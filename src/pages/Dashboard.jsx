/*
=========================================
Dashboard Page
-----------------------------------------
Purpose:
Main dashboard shown after login.

Features:
- Greeting
- Live Firestore Tasks
- Statistics
- Delete Task
- Complete Task
- Add Task Modal
- AI Progress Tracking
=========================================
*/

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useNeuroTheme } from "../context/NeuroThemeContext";
import { askGemini } from "../ai/gemini";

import Greeting from "../components/dashboard/Greeting";
import StatCard from "../components/dashboard/StatCard";
import TaskCard from "../components/dashboard/TaskCard";
import TaskModal from "../components/dashboard/TaskModal";
import ProgressModal from "../components/dashboard/ProgressModal";
import Topbar from "../components/dashboard/Topbar";

import {
  deleteTask,
  toggleTaskCompletion,
  updateTask,
} from "../services/taskService";

import {
  CheckCircle2,
  Clock3,
  AlarmClock,
  TrendingUp,
  ClipboardList,
  Sparkles,
  AlertTriangle,
  Info,
  Sliders,
  X,
  Zap,
} from "lucide-react";

function Dashboard() {
  // ============================
  // State
  // ============================

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("Latest");
  const [progressTask, setProgressTask] = useState(null);

  // AI Prioritization states
  const [prioritizing, setPrioritizing] = useState(false);
  const [proposedPriorities, setProposedPriorities] = useState(null);
  const [savingPriorities, setSavingPriorities] = useState(false);

  const { user, tasks, setTasks } = useAuth();
  const taskSource = useMemo(() => tasks ?? [], [tasks]);

  const { mode: neuroMode } = useNeuroTheme();
  const isADHD = neuroMode === "ADHD";
  const isAutism = neuroMode === "Autism";

  // Context-Aware Reminders Alert Engine
  const alerts = useMemo(() => {
    const list = [];
    const todayStr = new Date().toISOString().split("T")[0];
    
    // Check overdue tasks
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const overdueCount = taskSource.filter((t) => {
      if (!t.deadline || t.completed) return false;
      const d = new Date(t.deadline);
      return d < todayStart;
    }).length;

    if (overdueCount > 0) {
      list.push({
        id: "overdue",
        type: "error",
        text: `🚨 Overdue Tasks: You have ${overdueCount} task${overdueCount > 1 ? "s" : ""} past their deadline. Consider rescheduling them to minimize stress.`,
      });
    }

    // Check high priority due today
    const dueTodayHigh = taskSource.filter(
      (t) => !t.completed && t.priority === "High" && t.deadline === todayStr
    ).length;

    if (dueTodayHigh > 0) {
      list.push({
        id: "due-today-high",
        type: "warning",
        text: `🎯 Today's Focus: You have ${dueTodayHigh} High Priority task${dueTodayHigh > 1 ? "s" : ""} due today. Let's start with these!`,
      });
    }

    // Neurotheme recommendations
    if (neuroMode === "ADHD") {
      list.push({
        id: "adhd-focus",
        type: "info",
        text: "🧠 ADHD Mindful Alert: Keep animations off. Try launching the 25-minute Focus Session below for your top priority task.",
      });
    } else if (neuroMode === "Autism") {
      list.push({
        id: "autism-calm",
        type: "info",
        text: "💚 Calm Sensory Check: Visual clutter is reduced. Take a 5-minute quiet break for every 2 tasks completed today.",
      });
    } else if (neuroMode === "Migraine") {
      list.push({
        id: "migraine-relief",
        type: "info",
        text: "👁️ Blue-Light & Eyesight check: Warm filters active. Follow the 20-20-20 rule to rest your eyes (look 20 feet away for 20 seconds).",
      });
    } else if (neuroMode === "Dyslexia") {
      list.push({
        id: "dyslexia-read",
        type: "info",
        text: "📖 Readability Tip: Cream background and high readability fonts are enabled to streamline visual scan-paths.",
      });
    }

    return list;
  }, [taskSource, neuroMode]);

  // ADHD Focus Timer state & effect
  const [focusTime, setFocusTime] = useState(1500); // 25 mins
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      setFocusTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          toast.success("Focus session completed! Great job focusing.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning]);

  const highestPriorityTask = useMemo(() => {
    return taskSource.find((task) => task.priority === "High" && !task.completed);
  }, [taskSource]);

  const formatTimerTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleStartTimer = () => setTimerRunning(true);
  const handlePauseTimer = () => setTimerRunning(false);
  const handleResetTimer = () => {
    setTimerRunning(false);
    setFocusTime(1500);
  };

  // ============================
  // AI Prioritization Logic
  // ============================

  async function handleAIPrioritize() {
    const pendingTasks = taskSource.filter((t) => !t.completed);
    if (pendingTasks.length === 0) {
      toast.error("You have no pending tasks to prioritize!");
      return;
    }

    try {
      setPrioritizing(true);
      setProposedPriorities(null);

      const tasksPayload = pendingTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description || "",
        deadline: t.deadline || "",
        currentPriority: t.priority || "Medium",
      }));

      const prompt = `You are a productivity expert AI.
Prioritize the following tasks based on their importance, deadlines, and urgency. Adjust priorities ("High", "Medium", "Low") to ensure the user stays focused but not overwhelmed.
Current Active Neuro-accessibility Mode: "${neuroMode || "Default"}" (Use this to prioritize tasks that require focus if in ADHD mode, or suggest a steady pace if in Autism mode).

Tasks list:
${JSON.stringify(tasksPayload, null, 2)}

Respond ONLY with a valid JSON array of objects, with no markdown code fences, in this exact format:
[
  {
    "id": "task_id_here",
    "proposedPriority": "High/Medium/Low",
    "reason": "Short 1-sentence justification why"
  },
  ...
]`;

      const responseText = await askGemini(prompt);
      let jsonStr = responseText.trim();
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();

      const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (arrayMatch) jsonStr = arrayMatch[0];

      const suggestions = JSON.parse(jsonStr);

      // Map task details back to suggestion list
      const mappedSuggestions = suggestions.map((s) => {
        const originalTask = pendingTasks.find((t) => t.id === s.id);
        return {
          id: s.id,
          title: originalTask ? originalTask.title : "Unknown Task",
          currentPriority: originalTask ? (originalTask.priority || "Medium") : "Medium",
          proposedPriority: s.proposedPriority,
          reason: s.reason,
        };
      });

      setProposedPriorities(mappedSuggestions);
      toast.success("AI Priorities compiled!");
    } catch (error) {
      console.error("AI Prioritize error:", error);
      toast.error("AI Prioritizer failed to parse suggestions.");
    } finally {
      setPrioritizing(false);
    }
  }

  async function handleApplyPriorities() {
    if (!proposedPriorities || proposedPriorities.length === 0) return;

    try {
      setSavingPriorities(true);
      const updatePromises = proposedPriorities.map((item) =>
        updateTask(item.id, { priority: item.proposedPriority })
      );
      await Promise.all(updatePromises);
      toast.success("AI priorities applied successfully!");
      setProposedPriorities(null);
    } catch (error) {
      toast.error("Failed to apply new priorities.");
    } finally {
      setSavingPriorities(false);
    }
  }

  // ============================
  // Delete Task
  // ============================

  async function handleDelete(taskId) {
    try {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      await deleteTask(taskId);
      toast.success("Task deleted successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete task.");
    }
  }

  // ============================
  // Toggle Completion
  // ============================

  async function handleToggle(taskId, completed) {
    try {
      await toggleTaskCompletion(taskId, !completed);
    } catch (error) {
      console.error(error);
    }
  }

  function handleEditTask(task) {
    setEditTask(task);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
    setEditTask(null);
  }

  // ============================
  // Progress Modal
  // ============================

  function handleUpdateProgress(task) {
    setProgressTask(task);
  }

  function handleCloseProgress() {
    setProgressTask(null);
  }

  // ============================
  // Statistics
  // ============================

  const completedTasks = useMemo(
    () => taskSource.filter((task) => task.completed).length,
    [taskSource]
  );

  const pendingTasks = taskSource.length - completedTasks;

  const productivity = useMemo(() => {
    if (!taskSource.length) return 0;
    return Math.round((completedTasks / taskSource.length) * 100);
  }, [completedTasks, taskSource]);

  const avgProgress = useMemo(() => {
    if (!taskSource.length) return 0;
    const total = taskSource.reduce((sum, t) => sum + (t.progress || 0), 0);
    return Math.round(total / taskSource.length);
  }, [taskSource]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return taskSource;

    return taskSource.filter((task) => {
      const title = task.title?.toLowerCase() || "";
      const description = task.description?.toLowerCase() || "";
      return title.includes(query) || description.includes(query);
    });
  }, [search, taskSource]);

  const sortedTasks = useMemo(() => {
    const tasksToSort = [...filteredTasks];

    if (sortOption === "Latest") {
      return tasksToSort.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
    }

    if (sortOption === "Oldest") {
      return tasksToSort.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? 0;
        return aTime - bTime;
      });
    }

    if (sortOption === "Deadline") {
      return tasksToSort.sort((a, b) => {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.localeCompare(b.deadline);
      });
    }

    if (sortOption === "High Priority") {
      const order = { High: 0, Medium: 1, Low: 2 };
      return tasksToSort.sort((a, b) => {
        const aPriority = order[a.priority] ?? 3;
        const bPriority = order[b.priority] ?? 3;
        if (aPriority !== bPriority) return aPriority - bPriority;
        const aTime = a.createdAt?.toMillis?.() ?? 0;
        const bTime = b.createdAt?.toMillis?.() ?? 0;
        return bTime - aTime;
      });
    }

    return tasksToSort;
  }, [filteredTasks, sortOption]);

  // ============================
  // UI
  // ============================

  return (
    <DashboardLayout>

      <Topbar search={search} setSearch={setSearch} />

      <Greeting
        userName={user?.displayName || "User"}
      />

      {/* Context-Aware Reminders Alert Center */}
      {alerts.length > 0 && (
        <div className="mb-8 mt-6 space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl border px-5 py-4 flex items-center justify-between shadow-sm animate-fadeIn ${
                alert.type === "error"
                  ? "border-red-500/25 bg-red-500/5 text-red-400"
                  : alert.type === "warning"
                  ? "border-yellow-500/25 bg-amber-500/5 text-yellow-500"
                  : "border-cyan-500/25 bg-cyan-500/5 text-cyan-400"
              }`}
            >
              <div className="flex items-center gap-3">
                {alert.type === "error" || alert.type === "warning" ? (
                  <AlertTriangle size={18} />
                ) : (
                  <Info size={18} />
                )}
                <span className="text-xs sm:text-sm font-medium">{alert.text}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

        <StatCard
          title="Productivity"
          value={`${productivity}%`}
          icon={TrendingUp}
        />

        <StatCard
          title="Total Tasks"
          value={taskSource.length}
          icon={CheckCircle2}
        />

        <StatCard
          title="Completed"
          value={completedTasks}
          icon={Clock3}
        />

        <StatCard
          title="Pending"
          value={pendingTasks}
          icon={AlarmClock}
        />

        <StatCard
          title="Avg Progress"
          value={`${avgProgress}%`}
          icon={Sparkles}
        />

      </section>

      {isADHD && (
        <div className="mt-8 rounded-3xl border border-yellow-400 bg-amber-500/5 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_15px_rgba(250,204,21,0.15)] animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-yellow-500/10 p-4 text-yellow-500">
              <AlarmClock size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">🧠 ADHD Focus Session</h3>
              <p className="mt-1 text-sm text-slate-650 dark:text-slate-400">
                {highestPriorityTask
                  ? `Focusing on high priority task: "${highestPriorityTask.title}"`
                  : "No high priority tasks left. Add one to focus!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-black font-mono tracking-wider text-slate-900 dark:text-white">
              {formatTimerTime(focusTime)}
            </span>
            <div className="flex gap-2">
              {!timerRunning ? (
                <button
                  onClick={handleStartTimer}
                  disabled={focusTime === 0}
                  className="rounded-xl bg-yellow-500 text-slate-950 px-4 py-2 text-xs font-bold hover:bg-yellow-400 disabled:opacity-50 transition"
                >
                  Start Focus
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="rounded-xl bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-white px-4 py-2 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
                >
                  Pause
                </button>
              )}
              <button
                onClick={handleResetTimer}
                className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 px-4 py-2 text-xs font-bold transition hover:border-slate-350 dark:hover:border-slate-750"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="mt-12">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

          <div>
            <h2 className="text-3xl font-bold">
              My Tasks
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm">
              <span className="text-slate-400">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-500"
              >
                <option>Latest</option>
                <option>Oldest</option>
                <option>Deadline</option>
                <option>High Priority</option>
              </select>
            </label>

            <button
              onClick={handleAIPrioritize}
              disabled={prioritizing}
              className="
                rounded-xl
                border
                border-cyan-500/30
                bg-cyan-500/5
                text-cyan-400
                px-5
                py-3
                font-semibold
                transition
                hover:bg-cyan-500
                hover:text-slate-950
                cursor-pointer
                disabled:opacity-50
                flex
                items-center
                gap-1.5
              "
            >
              <Sparkles size={16} />
              {prioritizing ? "Prioritizing..." : "AI Prioritize"}
            </button>

            <button
              onClick={() => {
                setEditTask(null);
                setIsModalOpen(true);
              }}
              className="
                rounded-xl
                bg-cyan-500
                px-5
                py-3
                font-semibold
                transition
                hover:bg-cyan-600
              "
            >
              + Add Task
            </button>
          </div>

        </div>

        {taskSource.length === 0 ? (

          <div className="animate-fadeIn rounded-[2rem] border border-slate-800 bg-slate-950 p-12 text-center shadow-2xl shadow-slate-950/40 transition-opacity duration-700">

            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-cyan-400 shadow-lg shadow-cyan-500/20">
              <ClipboardList size={42} />
            </div>

            <h3 className="text-4xl font-bold text-white">
              No Tasks Yet
            </h3>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
              Start organizing your day with Chronos AI.
            </p>

            <button
              onClick={() => {
                setEditTask(null);
                setIsModalOpen(true);
              }}
              className="mt-10 inline-flex w-full justify-center rounded-2xl bg-cyan-500 px-7 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 sm:w-auto"
            >
              + Create Your First Task
            </button>

          </div>

        ) : sortedTasks.length === 0 ? (

          <div className="rounded-3xl border border-slate-800 bg-slate-900 py-20 text-center">

            <h3 className="text-2xl font-semibold">
              No tasks match your search.
            </h3>

            <p className="mt-3 text-slate-400">
              Try a different title or description.
            </p>

          </div>

        ) : (

          <div className="space-y-5">

            {sortedTasks.map((task) => (

              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                priority={task.priority}
                deadline={task.deadline}
                completed={task.completed}
                progress={task.progress || 0}
                progressReason={task.progressReason}
                onDelete={handleDelete}
                onToggleComplete={handleToggle}
                onEdit={handleEditTask}
                onUpdateProgress={handleUpdateProgress}
              />

            ))}

          </div>

        )}

      </section>

      <TaskModal
        key={`${isModalOpen}-${editTask?.id || "new"}`}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editTask={editTask}
      />

      <ProgressModal
        key={progressTask?.id}
        isOpen={!!progressTask}
        onClose={handleCloseProgress}
        task={progressTask}
      />

      {/* AI Prioritization Proposal Modal */}
      {proposedPriorities && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-5 select-none">
          <div className="w-[95vw] md:w-full md:max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Sparkles className="text-cyan-500 animate-pulse" size={22} />
                AI Task Prioritization Suggestions
              </h2>
              <button
                onClick={() => setProposedPriorities(null)}
                className="rounded-lg p-2 hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 max-h-[50vh] overflow-y-auto space-y-4">
              <p className="text-xs text-slate-400 mb-2">
                Gemini has analyzed your task deadlines and descriptions to recommend priority adjustments. Review recommendations below:
              </p>
              {proposedPriorities.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-850 bg-slate-950/40 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                    <p className="mt-1 text-xs text-slate-500">{item.reason}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">{item.currentPriority}</span>
                      <ArrowRight size={12} className="text-slate-650" />
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        item.proposedPriority === "High" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        item.proposedPriority === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {item.proposedPriority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-850 p-6">
              <button
                onClick={() => setProposedPriorities(null)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-5 py-3 hover:bg-slate-850 text-xs font-semibold cursor-pointer"
              >
                Discard Suggestions
              </button>
              <button
                disabled={savingPriorities}
                onClick={handleApplyPriorities}
                className="rounded-xl bg-cyan-500 text-slate-950 px-6 py-3 font-bold text-xs hover:bg-cyan-400 transition cursor-pointer disabled:opacity-50"
              >
                {savingPriorities ? "Applying..." : "Apply AI Suggestions"}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
    
  );
}

export default Dashboard;