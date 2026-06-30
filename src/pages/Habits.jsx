/*
=========================================
Goals & Habits Page
-----------------------------------------
Purpose:
Allows users to create, delete, and check off
habits. Highlights streaks, completion rates,
and lists AI recommendations.
=========================================
*/

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  createHabit,
  deleteHabit,
  toggleHabitCompletion,
  subscribeToHabits,
  subscribeToHabitLogs,
  calculateStreak,
} from "../services/habitService";
import {
  Trophy,
  Plus,
  Trash2,
  Sparkles,
  Flame,
  CheckCircle,
  Activity,
  Heart,
  BookOpen,
  Calendar,
  Zap,
  Target,
} from "lucide-react";
import toast from "react-hot-toast";
import { askGemini } from "../ai/gemini";

const categories = [
  { name: "Productivity", icon: Zap, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { name: "Health & Fitness", icon: Heart, color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  { name: "Mindfulness", icon: Activity, color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
  { name: "Learning", icon: BookOpen, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { name: "Other", icon: Target, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
];

function Habits() {
  const { user, tasks } = useAuth();
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  
  // Form State
  const [habitTitle, setHabitTitle] = useState("");
  const [habitCategory, setHabitCategory] = useState("Productivity");
  const [submitting, setSubmitting] = useState(false);

  // AI Recommendation State
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Subscribe to Habits & Logs
  useEffect(() => {
    if (!user) return;
    const unsubHabits = subscribeToHabits(user.uid, setHabits);
    const unsubLogs = subscribeToHabitLogs(user.uid, setHabitLogs);
    return () => {
      unsubHabits();
      unsubLogs();
    };
  }, [user]);

  // Calculate current week dates (Mon-Sun)
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // adjust for Sunday
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      
      days.push({
        name: date.toLocaleDateString(undefined, { weekday: "short" }),
        dateStr: `${year}-${month}-${day}`,
        dayOfMonth: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
      });
    }
    return days;
  }, []);

  // Streaks for each habit
  const habitStreaks = useMemo(() => {
    const streaks = {};
    habits.forEach((habit) => {
      streaks[habit.id] = calculateStreak(habitLogs, habit.id);
    });
    return streaks;
  }, [habits, habitLogs]);

  // KPIs
  const totalStreaks = useMemo(() => {
    let max = 0;
    Object.values(habitStreaks).forEach((streak) => {
      if (streak.currentStreak > max) max = streak.currentStreak;
    });
    return max;
  }, [habitStreaks]);

  const completionRate = useMemo(() => {
    if (!habits.length) return 0;
    
    // Number of completions in the current week
    const weekDateStrings = weekDays.map((d) => d.dateStr);
    const weekLogs = habitLogs.filter((log) => weekDateStrings.includes(log.date));
    
    const maxCompletions = habits.length * 7;
    return Math.round((weekLogs.length / maxCompletions) * 100);
  }, [habits, habitLogs, weekDays]);

  // Handle checking/unchecking completion
  async function handleToggleLog(habitId, dateStr, isCompleted) {
    try {
      await toggleHabitCompletion(habitId, dateStr, !isCompleted);
    } catch (error) {
      toast.error("Failed to update habit log.");
    }
  }

  // Handle adding custom habit
  async function handleAddHabit(e) {
    e.preventDefault();
    if (!habitTitle.trim()) return;

    try {
      setSubmitting(true);
      await createHabit(habitTitle, habitCategory);
      setHabitTitle("");
      toast.success("Habit created successfully!");
    } catch (error) {
      toast.error("Failed to create habit.");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle deleting habit
  async function handleDelete(habitId) {
    if (!window.confirm("Are you sure you want to delete this habit and all its logs?")) return;
    try {
      await deleteHabit(habitId);
      toast.success("Habit deleted.");
    } catch (error) {
      toast.error("Failed to delete habit.");
    }
  }

  // Generate AI Coach suggestions based on tasks
  async function handleGetAiSuggestions() {
    try {
      setLoadingSuggestions(true);
      const pendingTasksList = tasks
        .filter((t) => !t.completed)
        .map((t) => `- ${t.title} (Priority: ${t.priority || "Medium"}, Due: ${t.deadline || "No deadline"})`)
        .slice(0, 10)
        .join("\n");

      const prompt = `You are a productivity habit therapist.
We have a user with the following active tasks:
${pendingTasksList || "No active tasks."}

Suggest exactly 3 actionable habits that would help this user stay focused, energized, or manage their workload. Keep their titles brief (1-3 words).
Format your response ONLY as a JSON array of objects, with no explanation or markdown:
[
  {
    "title": "Habit Name",
    "category": "Productivity",
    "reason": "Why this habit helps their current tasks specifically"
  },
  ...
]`;

      const rawResponse = await askGemini(prompt);
      let jsonStr = rawResponse.trim();
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();

      const objectMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (objectMatch) jsonStr = objectMatch[0];

      const parsed = JSON.parse(jsonStr);
      setAiSuggestions(parsed);
      toast.success("AI Habit recommendations loaded!");
    } catch (error) {
      console.error(error);
      toast.error("AI Coach was unable to generate recommendations.");
    } finally {
      setLoadingSuggestions(false);
    }
  }

  // Add an AI recommended habit
  async function handleAdoptSuggestedHabit(suggestion) {
    try {
      await createHabit(suggestion.title, suggestion.category);
      setAiSuggestions((prev) => prev.filter((s) => s.title !== suggestion.title));
      toast.success(`Adopted "${suggestion.title}"!`);
    } catch (error) {
      toast.error("Failed to add recommended habit.");
    }
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-10 animate-fadeIn">
        <h1 className="text-4xl font-extrabold flex items-center gap-3">
          <Trophy className="text-yellow-500 animate-pulse" size={38} />
          Goals & Habits
        </h1>
        <p className="mt-2 text-slate-400 max-w-2xl text-sm leading-relaxed">
          Create positive routines, view completion streaks, and consult the AI coach to customize habits tailored to your task load.
        </p>
      </div>

      {/* KPI Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-wider text-slate-500">Active Habits</p>
            <p className="mt-2 text-4xl font-extrabold text-white">{habits.length}</p>
          </div>
          <div className="rounded-2xl bg-cyan-500/10 p-4 text-cyan-400">
            <CheckCircle size={28} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-wider text-slate-500">Longest Streak</p>
            <p className="mt-2 text-4xl font-extrabold text-orange-400 flex items-center gap-1.5">
              {totalStreaks}
              <Flame size={24} className="fill-orange-400/20" />
            </p>
          </div>
          <div className="rounded-2xl bg-orange-500/10 p-4 text-orange-400">
            <Flame size={28} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm uppercase tracking-wider text-slate-500">Weekly Progress</p>
            <p className="mt-2 text-4xl font-extrabold text-emerald-400">{completionRate}%</p>
          </div>
          <div className="rounded-2xl bg-emerald-500/10 p-4 text-emerald-400">
            <Activity size={28} />
          </div>
        </div>
      </section>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Habit Checklist Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur shadow-sm">
            <h2 className="text-2xl font-bold text-white mb-6">Weekly Habits Grid</h2>
            
            {habits.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                <p>No habits tracked yet. Create one or ask the AI Coach to start!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="py-3 pr-4 font-semibold text-slate-400 text-sm">Habit</th>
                      <th className="py-3 px-2 font-semibold text-slate-400 text-sm text-center">Streak</th>
                      {weekDays.map((day) => (
                        <th key={day.dateStr} className="py-3 px-2 text-center font-semibold text-sm">
                          <div className={`flex flex-col items-center rounded-xl p-1.5 min-w-[45px] ${day.isToday ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "text-slate-400"}`}>
                            <span className="text-[10px] uppercase font-bold">{day.name}</span>
                            <span className="text-sm font-black mt-0.5">{day.dayOfMonth}</span>
                          </div>
                        </th>
                      ))}
                      <th className="py-3 pl-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {habits.map((habit) => {
                      const activeStreak = habitStreaks[habit.id] || { currentStreak: 0, longestStreak: 0 };
                      const categoryData = categories.find((c) => c.name === habit.category) || categories[4];
                      const Icon = categoryData.icon;

                      return (
                        <tr key={habit.id} className="hover:bg-slate-900/20 transition-all">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className={`rounded-xl p-2.5 border ${categoryData.color}`}>
                                <Icon size={16} />
                              </div>
                              <div>
                                <p className="font-semibold text-white text-base">{habit.title}</p>
                                <p className="text-[10px] text-slate-500 uppercase mt-0.5">{habit.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-xl px-2.5 py-1 text-orange-400 font-bold text-xs">
                              <Flame size={14} className="fill-orange-400/20" />
                              {activeStreak.currentStreak}d
                            </div>
                          </td>
                          {weekDays.map((day) => {
                            const isCompleted = habitLogs.some(
                              (log) => log.habitId === habit.id && log.date === day.dateStr
                            );
                            return (
                              <td key={day.dateStr} className="py-4 px-2 text-center">
                                <button
                                  onClick={() => handleToggleLog(habit.id, day.dateStr, isCompleted)}
                                  className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                    isCompleted
                                      ? "bg-cyan-500 border-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                                      : "border-slate-800 bg-slate-950/40 text-transparent hover:border-cyan-500/50 hover:text-cyan-500/25"
                                  }`}
                                >
                                  ✓
                                </button>
                              </td>
                            );
                          })}
                          <td className="py-4 pl-4 text-right">
                            <button
                              onClick={() => handleDelete(habit.id)}
                              className="rounded-lg p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                              title="Delete Habit"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Side form and recommendations */}
        <div className="space-y-6">
          {/* Create Habit Form */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur shadow-sm">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="text-cyan-500" size={20} />
              Add Habit
            </h2>
            <form onSubmit={handleAddHabit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Habit Title</label>
                <input
                  type="text"
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  placeholder="e.g. Read for 30 minutes"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-2 font-semibold">Category</label>
                <select
                  value={habitCategory}
                  onChange={(e) => setHabitCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-cyan-500 transition"
                >
                  <option>Productivity</option>
                  <option>Health & Fitness</option>
                  <option>Mindfulness</option>
                  <option>Learning</option>
                  <option>Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting || !habitTitle.trim()}
                className="w-full rounded-xl bg-cyan-500 text-slate-950 font-bold py-3 text-sm hover:bg-cyan-400 transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "Creating..." : "Add Habit"}
              </button>
            </form>
          </div>

          {/* AI Habit recommendations */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 h-28 w-28 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="text-cyan-500 animate-pulse" size={20} />
              AI Habit Coach
            </h2>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Analyzes your pending tasks and deadlines to suggest supportive habits.
            </p>

            {aiSuggestions.length === 0 ? (
              <button
                onClick={handleGetAiSuggestions}
                disabled={loadingSuggestions}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/5 py-3.5 text-xs font-bold text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition cursor-pointer disabled:opacity-50"
              >
                {loadingSuggestions ? (
                  <span>Analyzing Taskload...</span>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Get Recommendations
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                {aiSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.title}
                    className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:border-slate-700 transition"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h4 className="font-semibold text-sm text-white">{suggestion.title}</h4>
                        <span className="inline-block text-[9px] uppercase font-bold text-cyan-400 mt-1 bg-cyan-500/10 px-2 py-0.5 rounded">
                          {suggestion.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAdoptSuggestedHabit(suggestion)}
                        className="rounded-lg bg-cyan-500 px-2.5 py-1 text-[11px] font-bold text-slate-950 hover:bg-cyan-400 transition cursor-pointer"
                      >
                        + Adopt
                      </button>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-slate-500">
                      {suggestion.reason}
                    </p>
                  </div>
                ))}

                <button
                  onClick={handleGetAiSuggestions}
                  disabled={loadingSuggestions}
                  className="w-full text-center text-xs text-slate-450 hover:text-cyan-400 transition font-medium mt-2"
                >
                  Refresh suggestions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Habits;
