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

import Greeting from "../components/dashboard/Greeting";
import StatCard from "../components/dashboard/StatCard";
import TaskCard from "../components/dashboard/TaskCard";
import TaskModal from "../components/dashboard/TaskModal";
import ProgressModal from "../components/dashboard/ProgressModal";
import Topbar from "../components/dashboard/Topbar";

import {
  deleteTask,
  toggleTaskCompletion,
} from "../services/taskService";

import {
  CheckCircle2,
  Clock3,
  AlarmClock,
  TrendingUp,
  ClipboardList,
  Sparkles,
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

  const { user, tasks, setTasks } = useAuth();
  const taskSource = useMemo(() => tasks ?? [], [tasks]);

  const { mode: neuroMode } = useNeuroTheme();
  const isADHD = neuroMode === "ADHD";
  const isAutism = neuroMode === "Autism";

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

    </DashboardLayout>
    
  );
}

export default Dashboard;