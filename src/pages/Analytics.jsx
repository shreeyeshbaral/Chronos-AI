/*
=========================================
Analytics Page
-----------------------------------------
Purpose:
Premium analytics dashboard showing
task statistics, insights, and trends.

Features:
- Real-time Firestore data
- Interactive Recharts visualizations
- KPI cards
- Insights & recommendations
- Recent activity timeline
- Progress rings
- Focus score calculation
=========================================
*/

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { askGemini } from "../ai/gemini";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Flame,
  Activity,
  Calendar,
  Zap,
  Sparkles,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";

// ============================
// KPI Card Component
// ============================

function KPICard({ title, value, icon: Icon, trend, color = "cyan" }) {
  const colorClasses = {
    cyan: "text-cyan-500 dark:text-cyan-400 bg-cyan-500/10",
    blue: "text-blue-500 dark:text-blue-400 bg-blue-500/10",
    green: "text-green-500 dark:text-green-400 bg-green-500/10",
    red: "text-red-500 dark:text-red-400 bg-red-500/10",
    purple: "text-purple-500 dark:text-purple-400 bg-purple-500/10",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-6 backdrop-blur shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400" style={{ lineHeight: 1.4, letterSpacing: 0 }}>{title}</p>
          <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white" style={{ lineHeight: 1, letterSpacing: 0 }}>{value}</p>
          {trend && (
            <p className={`mt-2 text-sm font-medium ${trend > 0 ? "text-green-500 dark:text-green-400" : "text-red-555 dark:text-red-400"}`} style={{ lineHeight: 1.4 }}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        <div className={`${colorClasses[color]} rounded-2xl p-4 flex-shrink-0`} style={{ lineHeight: 1 }}>
          <Icon size={32} />
        </div>
      </div>
    </div>
  );
}

// ============================
// Progress Ring Component
// ============================

function ProgressRing({ title, percentage, color = "cyan" }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    cyan: { stroke: "#06b6d4", bg: "#06b6d4" },
    green: { stroke: "#10b981", bg: "#10b981" },
    purple: { stroke: "#a855f7", bg: "#a855f7" },
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-6 backdrop-blur shadow-sm">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400" style={{ lineHeight: 1.4, letterSpacing: 0 }}>{title}</p>

      <div className="mt-4 flex flex-col items-center">
        <div className="relative h-32 w-32">
          <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90 transform">
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="currentColor"
              className="text-slate-200 dark:text-slate-800"
              strokeWidth="8"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke={colorMap[color].stroke}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-slate-900 dark:text-white" style={{ lineHeight: 1, letterSpacing: 0 }}>{Math.round(percentage)}%</span>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-650 dark:text-slate-400" style={{ lineHeight: 1.4, letterSpacing: 0 }}>
          {percentage < 30 && "Needs attention"}
          {percentage >= 30 && percentage < 60 && "Keep improving"}
          {percentage >= 60 && percentage < 80 && "Good progress"}
          {percentage >= 80 && "Excellent work!"}
        </p>
      </div>
    </div>
  );
}

// ============================
// Insights Component
// ============================

function Insights({ tasks, pendingTasks, productivity }) {
  const overdueTasks = tasks.filter((task) => {
    if (!task.deadline || task.completed) return false;
    const deadline = new Date(task.deadline);
    return deadline < new Date();
  }).length;

  const highPriorityTasks = tasks.filter((task) => task.priority === "High").length;

  const completedThisWeek = tasks.filter((task) => {
    if (!task.completed || !task.updatedAt) return false;
    const taskDate = task.updatedAt.toDate?.() || new Date(task.updatedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return taskDate > weekAgo;
  }).length;

  const insights = [];

  if (productivity >= 80) {
    insights.push({
      icon: Flame,
      color: "text-orange-400",
      text: `🔥 Excellent productivity at ${productivity}%! Keep up the momentum.`,
    });
  } else if (productivity >= 50) {
    insights.push({
      icon: Zap,
      color: "text-yellow-400",
      text: `⚡ Good progress! Productivity is ${productivity}%. Focus on pending tasks.`,
    });
  } else if (productivity > 0) {
    insights.push({
      icon: AlertCircle,
      color: "text-red-400",
      text: `⚠️ Low productivity (${productivity}%). Time to prioritize tasks!`,
    });
  }

  if (overdueTasks > 0) {
    insights.push({
      icon: AlertCircle,
      color: "text-red-400",
      text: `🚨 ${overdueTasks} task${overdueTasks > 1 ? "s" : ""} overdue. Address immediately!`,
    });
  }

  if (highPriorityTasks > 0 && highPriorityTasks <= 3) {
    insights.push({
      icon: AlertCircle,
      color: "text-red-400",
      text: `🎯 ${highPriorityTasks} high-priority task${highPriorityTasks > 1 ? "s" : ""} need attention.`,
    });
  }

  if (pendingTasks <= 3 && pendingTasks > 0) {
    insights.push({
      icon: CheckCircle2,
      color: "text-green-400",
      text: `✨ Only ${pendingTasks} task${pendingTasks > 1 ? "s" : ""} left. You're almost done!`,
    });
  }

  if (completedThisWeek > 0) {
    insights.push({
      icon: TrendingUp,
      color: "text-green-400",
      text: `📈 You completed ${completedThisWeek} tasks this week. Amazing consistency!`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      icon: CheckCircle2,
      color: "text-blue-400",
      text: "💡 Start adding tasks to see personalized insights.",
    });
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => (
        <div
          key={index}
          className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-4 backdrop-blur shadow-sm"
        >
          <p className={`text-sm ${insight.color}`}>{insight.text}</p>
        </div>
      ))}
    </div>
  );
}

// ============================
// Recent Activity Component
// ============================

function RecentActivity({ tasks }) {
  const activities = tasks
    .filter((task) => task.createdAt || task.updatedAt)
    .sort((a, b) => {
      const aTime = (a.updatedAt || a.createdAt)?.toMillis?.() ?? 0;
      const bTime = (b.updatedAt || b.createdAt)?.toMillis?.() ?? 0;
      return bTime - aTime;
    })
    .slice(0, 5)
    .map((task) => {
      const time = (task.updatedAt || task.createdAt)?.toDate?.() || new Date();
      const isCompleted = task.completed;

      return {
        id: task.id,
        title: task.title,
        type: isCompleted ? "completed" : "created",
        time,
        icon: isCompleted ? CheckCircle2 : Calendar,
      };
    });

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
        </div>
      ) : (
        activities.map((activity) => {
          const Icon = activity.icon;
          const timeString = activity.time.toLocaleDateString();

          return (
            <div
              key={activity.id}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-4 backdrop-blur shadow-sm animate-fadeIn"
            >
              <div className={`mt-1 rounded-lg p-2 ${activity.type === "completed" ? "bg-green-500/10 dark:bg-green-500/20" : "bg-blue-500/10 dark:bg-blue-500/20"}`}>
                <Icon size={18} className={activity.type === "completed" ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"} />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Task {activity.type === "completed" ? "completed" : "created"}
                </p>
                <p className="text-sm text-slate-650 dark:text-slate-400">{activity.title}</p>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-450">{timeString}</p>
            </div>
          );
        })
      )}
    </div>
  );
}

// ============================
// Skeleton Loaders
// ============================

function SkeletonKPICard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 w-20 rounded bg-slate-800" />
          <div className="mt-3 h-10 w-32 rounded bg-slate-800" />
        </div>
        <div className="h-16 w-16 rounded-2xl bg-slate-800" />
      </div>
    </div>
  );
}

// ============================
// Skeleton Chart
// ============================

function SkeletonChart() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="h-4 w-32 rounded bg-slate-800" />
      <div className="mt-6 h-64 rounded bg-slate-800" />
    </div>
  );
}

// ============================
// Main Analytics Component
// ============================

function Analytics() {
  const { tasks, tasksLoading: loading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [deepRecommendations, setDeepRecommendations] = useState([]);
  const [analyzingPatterns, setAnalyzingPatterns] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ============================
  // Calculations
  // ============================

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const pendingTasks = useMemo(() => tasks.length - completedTasks, [tasks, completedTasks]);

  const productivity = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((completedTasks / tasks.length) * 100);
  }, [completedTasks, tasks.length]);

  const highPriorityTasks = useMemo(
    () => tasks.filter((task) => task.priority === "High" && !task.completed).length,
    [tasks]
  );

  const overdueTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.deadline || task.completed) return false;
      const deadline = new Date(task.deadline);
      return deadline < new Date();
    }).length;
  }, [tasks]);

  const avgProgress = useMemo(() => {
    if (!tasks.length) return 0;
    const total = tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
    return Math.round(total / tasks.length);
  }, [tasks]);

  async function handleRunDeepAIAnalysis() {
    if (tasks.length === 0) {
      toast.error("No data to analyze yet!");
      return;
    }

    try {
      setAnalyzingPatterns(true);
      const prompt = `You are a professional behavioral psychologist and executive productivity advisor.
Analyze the user's workload performance metrics:
- Total Tasks: ${tasks.length}
- Completed: ${completedTasks}
- Pending: ${pendingTasks}
- Productivity: ${productivity}%
- Overdue: ${overdueTasks}
- High Priority Pending: ${highPriorityTasks}
- Average Task Progress: ${avgProgress}%

Provide exactly 3 actionable, deep productivity recommendations that will make them more efficient. Make them concrete, referencing the metrics (e.g. if overdue count is high, or high priority tasks are pending).
Keep each recommendation to a maximum of 2 sentences.

Respond ONLY with a valid JSON array of objects, with no markdown code fences:
[
  {
    "type": "success/warning/info/error",
    "emoji": "💡",
    "text": "Recommendation text..."
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
      setDeepRecommendations(suggestions);
      toast.success("Deep AI Analysis completed!");
    } catch (error) {
      console.error(error);
      toast.error("Deep AI Analysis was unable to compile suggestions.");
    } finally {
      setAnalyzingPatterns(false);
    }
  }

  // Chart Data: Completed vs Pending
  const pieChartData = [
    { name: "Completed", value: completedTasks, fill: "#06b6d4" },
    { name: "Pending", value: pendingTasks, fill: "#64748b" },
  ];

  // Chart Data: Tasks by Priority
  const priorityData = useMemo(() => {
    const high = tasks.filter((t) => t.priority === "High").length;
    const medium = tasks.filter((t) => t.priority === "Medium").length;
    const low = tasks.filter((t) => t.priority === "Low").length;
    return [
      { priority: "High", count: high },
      { priority: "Medium", count: medium },
      { priority: "Low", count: low },
    ];
  }, [tasks]);

  // Chart Data: Progress Distribution
  const progressDistData = useMemo(() => {
    const ranges = ["0-25%", "26-50%", "51-75%", "76-100%"];
    const counts = [0, 0, 0, 0];
    const colors = ["#ef4444", "#f59e0b", "#06b6d4", "#10b981"];

    tasks.forEach((t) => {
      const p = t.progress || 0;
      if (p <= 25) counts[0]++;
      else if (p <= 50) counts[1]++;
      else if (p <= 75) counts[2]++;
      else counts[3]++;
    });

    return ranges.map((range, i) => ({
      range,
      count: counts[i],
      fill: colors[i],
    }));
  }, [tasks]);

  // Chart Data: Tasks Created Over Time (Last 7 days)
  const tasksOverTimeData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const count = tasks.filter((task) => {
        const taskDate = (task.createdAt?.toDate?.() || new Date(task.createdAt))
          .toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return taskDate === dateStr;
      }).length;

      last7Days.push({ date: dateStr, tasks: count });
    }
    return last7Days;
  }, [tasks]);

  // Chart Data: Productivity Trend (Last 7 days)
  const productivityTrendData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const dayTasks = tasks.filter((task) => {
        const taskDate = (task.createdAt?.toDate?.() || new Date(task.createdAt))
          .toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return taskDate === dateStr;
      });

      const dayCompleted = dayTasks.filter((t) => t.completed).length;
      const dayProductivity = dayTasks.length > 0 ? Math.round((dayCompleted / dayTasks.length) * 100) : 0;

      last7Days.push({ date: dateStr, productivity: dayProductivity });
    }
    return last7Days;
  }, [tasks]);

  // ============================
  // Empty State
  // ============================

  if (!loading && tasks.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 py-24">
          <div className="rounded-full bg-cyan-500/10 p-6">
            <Activity size={60} className="text-cyan-400" />
          </div>

          <h2 className="mt-8 text-3xl font-bold">No Data to Analyze</h2>

          <p className="mt-3 text-slate-400">
            Start creating tasks to see analytics and insights.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // ============================
  // Render
  // ============================

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Analytics</h1>
        <p className="mt-2 text-slate-400">
          Track your productivity and task metrics in real-time.
        </p>
      </div>

      {/* KPI Cards */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold">Key Metrics</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {loading ? (
            <>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <SkeletonKPICard key={i} />
              ))}
            </>
          ) : (
            <>
              <KPICard
                title="Total Tasks"
                value={tasks.length}
                icon={Calendar}
                color="blue"
              />
              <KPICard
                title="Completed"
                value={completedTasks}
                icon={CheckCircle2}
                color="green"
              />
              <KPICard
                title="Pending"
                value={pendingTasks}
                icon={Clock}
                color="cyan"
              />
              <KPICard
                title="Productivity"
                value={`${productivity}%`}
                icon={TrendingUp}
                color="purple"
              />
              <KPICard
                title="High Priority"
                value={highPriorityTasks}
                icon={AlertCircle}
                color="red"
              />
              <KPICard
                title="Overdue"
                value={overdueTasks}
                icon={Flame}
                color="red"
              />
              <KPICard
                title="Avg Progress"
                value={`${avgProgress}%`}
                icon={Sparkles}
                color="purple"
              />
            </>
          )}
        </div>
      </section>

      {/* Charts Grid */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Visualizations</h2>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pie Chart */}
          {loading ? (
            <SkeletonChart />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-6 backdrop-blur shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-white">Completion Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart margin={isMobile ? { top: 10, right: 10, left: 10, bottom: 10 } : { top: 10, right: 30, left: 30, bottom: 10 }}>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={!isMobile}
                    label={isMobile ? ({ value }) => `${value}` : ({ name, value }) => `${name}: ${value}`}
                    outerRadius={isMobile ? 80 : 100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-main)",
                      borderRadius: "12px",
                    }}
                    labelStyle={{ color: "var(--text-main)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bar Chart */}
          {loading ? (
            <SkeletonChart />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-6 backdrop-blur shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-white">Tasks by Priority</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData} margin={isMobile ? { top: 10, right: 10, left: -25, bottom: 0 } : { top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  <XAxis dataKey="priority" stroke="currentColor" className="text-slate-400 dark:text-slate-500" tick={{ fontSize: 11 }} />
                  <YAxis stroke="currentColor" className="text-slate-400 dark:text-slate-500" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-main)",
                      borderRadius: "12px",
                    }}
                    labelStyle={{ color: "var(--text-main)" }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Line Chart */}
          {loading ? (
            <SkeletonChart />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-6 backdrop-blur shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-white">Tasks Created (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tasksOverTimeData} margin={isMobile ? { top: 10, right: 10, left: -25, bottom: 0 } : { top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  <XAxis dataKey="date" stroke="currentColor" className="text-slate-400 dark:text-slate-500" tick={{ fontSize: 11 }} />
                  <YAxis stroke="currentColor" className="text-slate-400 dark:text-slate-500" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-main)",
                      borderRadius: "12px",
                    }}
                    labelStyle={{ color: "var(--text-main)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tasks"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: "#06b6d4", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Area Chart */}
          {loading ? (
            <SkeletonChart />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-6 backdrop-blur shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-white">Productivity Trend (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={productivityTrendData} margin={isMobile ? { top: 10, right: 10, left: -25, bottom: 0 } : { top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  <XAxis dataKey="date" stroke="currentColor" className="text-slate-400 dark:text-slate-500" tick={{ fontSize: 11 }} />
                  <YAxis stroke="currentColor" className="text-slate-400 dark:text-slate-500" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-main)",
                      borderRadius: "12px",
                    }}
                    labelStyle={{ color: "var(--text-main)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="productivity"
                    stroke="#06b6d4"
                    fillOpacity={1}
                    fill="url(#colorProductivity)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Progress Distribution */}
          {loading ? (
            <SkeletonChart />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-6 backdrop-blur lg:col-span-2 shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-white">AI Progress Distribution</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">How tasks are distributed by AI-estimated progress</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressDistData} margin={isMobile ? { top: 10, right: 10, left: -25, bottom: 0 } : { top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                  <XAxis dataKey="range" stroke="currentColor" className="text-slate-400 dark:text-slate-500" tick={{ fontSize: 11 }} />
                  <YAxis stroke="currentColor" className="text-slate-400 dark:text-slate-500" allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-main)",
                      borderRadius: "12px",
                    }}
                    labelStyle={{ color: "var(--text-main)" }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {progressDistData.map((entry, index) => (
                      <Cell key={`progress-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* Progress Rings & Insights */}
      <section className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Progress Rings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6 lg:col-span-1">
          {loading ? (
            <>
              <SkeletonChart />
              <SkeletonChart />
              <SkeletonChart />
            </>
          ) : (
            <>
              <ProgressRing
                title="Completion Rate"
                percentage={productivity}
                color="cyan"
              />
              <ProgressRing
                title="Avg Progress"
                percentage={avgProgress}
                color="purple"
              />
              <ProgressRing
                title="Weekly Goal"
                percentage={Math.min(productivity, 100)}
                color="green"
              />
            </>
          )}
        </div>

        {/* Insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-6 backdrop-blur shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Insights & Recommendations</h2>
              <button
                onClick={handleRunDeepAIAnalysis}
                disabled={analyzingPatterns}
                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500 text-slate-950 px-4 py-2.5 text-xs font-bold hover:bg-cyan-400 disabled:opacity-50 transition cursor-pointer"
              >
                <Sparkles size={14} />
                {analyzingPatterns ? "Analyzing Patterns..." : "Run Deep AI Analysis"}
              </button>
            </div>

            {loading ? (
              <div className="h-28 bg-slate-800 animate-pulse rounded-2xl" />
            ) : (
              <div className="space-y-4">
                <Insights
                  tasks={tasks}
                  pendingTasks={pendingTasks}
                  productivity={productivity}
                />

                {deepRecommendations.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-cyan-500 mb-4 flex items-center gap-1.5">
                      <Sparkles size={16} />
                      AI Performance Review
                    </h3>
                    {deepRecommendations.map((item, index) => {
                      const colorMap = {
                        success: "text-emerald-450 bg-emerald-500/10 border-emerald-500/20",
                        warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
                        error: "text-red-400 bg-red-500/10 border-red-500/20",
                        info: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                      };
                      const colorClass = colorMap[item.type] || colorMap.info;
                      return (
                        <div
                          key={index}
                          className={`rounded-2xl border p-4 flex gap-3 ${colorClass}`}
                        >
                          <span className="text-lg flex-shrink-0">{item.emoji || "💡"}</span>
                          <p className="text-xs leading-relaxed font-medium">{item.text}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="mb-6 text-2xl font-bold">Recent Activity</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50 p-4"
              >
                <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-850" />
              </div>
            ))}
          </div>
        ) : (
          <RecentActivity tasks={tasks} />
        )}
      </section>
    </DashboardLayout>
  );
}

export default Analytics;
