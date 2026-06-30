/*
=========================================
Calendar Page
-----------------------------------------
Purpose:
Displays upcoming task deadlines.
=========================================
*/



import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";



import {
  CalendarDays,
  Clock3,
  Flag,
} from "lucide-react";

function Calendar() {
  const { tasks } = useAuth();

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const getDayKey = (deadline) => {
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const formatDateHeading = (deadline) => {
    const date = new Date(deadline);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (deadline) => {
    const date = new Date(deadline);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const overdueTasks = [];
  const todayTasks = [];
  const deadlineGroups = {};
  const noDeadlineTasks = [];

  tasks.forEach((task) => {
    if (!task.deadline) {
      noDeadlineTasks.push(task);
      return;
    }

    const taskDate = new Date(task.deadline);
    const taskKey = getDayKey(task.deadline);
    const isOverdue = !task.completed && taskDate < todayStart;

    if (taskKey === todayKey) {
      todayTasks.push(task);
      return;
    }

    if (isOverdue) {
      overdueTasks.push(task);
      return;
    }

    if (!deadlineGroups[taskKey]) {
      deadlineGroups[taskKey] = [];
    }
    deadlineGroups[taskKey].push(task);
  });

  const sortedGroupKeys = Object.keys(deadlineGroups).sort((a, b) => a.localeCompare(b));
  const deadlineCount = tasks.filter((task) => task.deadline).length;

  const renderTaskCard = (task) => {
    const dueDate = new Date(task.deadline);
    const isOverdue = !task.completed && dueDate < todayStart;
    const statusLabel = task.completed
      ? "Completed"
      : isOverdue
      ? "Overdue"
      : task.deadline && getDayKey(task.deadline) === todayKey
      ? "Due Today"
      : "Upcoming";

    const statusClasses = task.completed
      ? "bg-emerald-500/10 text-emerald-300"
      : isOverdue
      ? "bg-rose-500/10 text-rose-300"
      : "bg-cyan-500/10 text-cyan-300";

    return (
      <div
        key={task.id}
        className={`relative overflow-hidden rounded-3xl border px-6 py-5 shadow-sm transition ${
          isOverdue
            ? "border-rose-300 bg-rose-50/50 dark:border-rose-500/20 dark:bg-rose-500/5"
            : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{task.title}</h3>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              {task.description || "No description added."}
            </p>
          </div>

          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>
            {statusLabel}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={16} />
            {formatDateHeading(task.deadline)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock3 size={16} />
            {formatTime(task.deadline)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Flag size={16} />
            {task.priority || "Normal"}
          </span>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Calendar</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">A timeline of tasks grouped by deadline.</p>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 py-24 text-center">
          <CalendarDays size={60} className="mx-auto text-cyan-500 dark:text-cyan-400" />
          <h2 className="mt-6 text-2xl font-semibold text-slate-900 dark:text-white">No tasks yet</h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400">Create tasks to see deadlines grouped by date.</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Today's Tasks</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{todayTasks.length}</p>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Tasks due today in your schedule.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Overdue</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{overdueTasks.length}</p>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Tasks that need attention immediately.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Deadlines</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{deadlineCount}</p>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Tasks with assigned deadline dates.</p>
            </div>
          </div>

          <div className="space-y-10">
            {overdueTasks.length > 0 && (
              <div className="rounded-3xl border border-rose-300 bg-rose-50/50 dark:border-rose-500/20 dark:bg-rose-500/5 p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-rose-500 dark:text-rose-300">Overdue</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Missed deadlines</h2>
                  </div>
                  <span className="rounded-full bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-600 dark:text-rose-300">
                    {overdueTasks.length} overdue
                  </span>
                </div>

                <div className="space-y-4">
                  {overdueTasks.map((task) => renderTaskCard(task))}
                </div>
              </div>
            )}

            {todayTasks.length > 0 && (
              <div className="rounded-3xl border border-cyan-200 bg-white dark:border-cyan-500/20 dark:bg-slate-900 p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300">Today</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Today’s timeline</h2>
                  </div>
                  <span className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-600 dark:text-cyan-300">
                    {todayTasks.length} tasks
                  </span>
                </div>

                <div className="space-y-4">
                  {todayTasks.map((task) => renderTaskCard(task))}
                </div>
              </div>
            )}

            {sortedGroupKeys.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
                <div className="mb-8 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Upcoming Timeline</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Grouped by deadline</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {sortedGroupKeys.length} date groups
                  </span>
                </div>

                <div className="space-y-10">
                  {sortedGroupKeys.map((groupKey) => (
                    <div key={groupKey} className="grid gap-6 sm:grid-cols-[180px_1fr] sm:items-start">
                      <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
                        {formatDateHeading(groupKey)}
                      </div>
                      <div className="relative pl-8">
                        <div className="absolute left-2 top-4 h-full w-px bg-slate-200 dark:bg-slate-800/80" />
                        <div className="space-y-4">
                          {deadlineGroups[groupKey]
                            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                            .map((task) => renderTaskCard(task))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {noDeadlineTasks.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">No Deadline</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Tasks without dates</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {noDeadlineTasks.length} tasks
                  </span>
                </div>

                <div className="space-y-4">
                  {noDeadlineTasks.map((task) => (
                    <div key={task.id} className="rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{task.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{task.description || "No description added."}</p>
                        </div>
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          No deadline
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Calendar;