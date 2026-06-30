/*
=========================================
Task Card Component
-----------------------------------------
Purpose:
Displays a single task with AI progress.

Features:
- Complete Task
- Delete Task
- Edit Ready
- AI Progress Bar
- Update Progress Button
=========================================
*/

import { useState } from "react";
import {
  CalendarDays,
  Flag,
  Pencil,
  Trash2,
  CircleCheck,
  Sparkles,
  Brain,
} from "lucide-react";
import ConfirmationModal from "../common/ConfirmationModal";
import { useNeuroTheme } from "../../context/NeuroThemeContext";

function TaskCard({
  id,
  title,
  description,
  deadline,
  priority,
  completed = false,
  progress = 0,
  progressReason,
  onDelete,
  onToggleComplete,
  onEdit,
  onUpdateProgress,
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { mode: neuroMode } = useNeuroTheme();
  const isADHD = neuroMode === "ADHD";

  const priorityStyles = {
    High: "bg-red-500/15 text-red-400 border border-red-500/30",
    Medium: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
    Low: "bg-green-500/15 text-green-400 border border-green-500/30",
  };

  async function handleDelete() {
    await onDelete?.(id);
    setIsConfirmOpen(false);
  }

  // Choose progress bar color based on percentage
  const progressGradient =
    progress >= 80
      ? "from-green-500 to-emerald-400"
      : progress >= 50
      ? "from-cyan-500 to-purple-500"
      : progress >= 25
      ? "from-yellow-500 to-orange-400"
      : "from-slate-600 to-slate-500";

  const isHighPriority = priority === "High";

  const containerStyles = isADHD
    ? (isHighPriority && !completed
        ? "border-yellow-400 dark:border-yellow-400 bg-amber-500/5 shadow-[0_0_15px_rgba(250,204,21,0.25)] scale-[1.01]"
        : "border-slate-200 dark:border-slate-800 opacity-40 hover:opacity-70 transition-all duration-300")
    : (completed
        ? "border-green-500/50 opacity-75"
        : "border-slate-200 dark:border-slate-800 hover:border-cyan-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10");

  return (
    <div
      className={`
        group
        rounded-3xl
        border
        p-6
        bg-white
        dark:bg-slate-900/90
        backdrop-blur-lg
        transition-all
        duration-300
        shadow-sm
        ${containerStyles}
      `}
    >
      {/* Header */}

      <div className="flex items-start justify-between gap-4">

        <div
          className={`
            inline-flex
            items-center
            gap-2
            rounded-full
            px-3
            py-1
            text-sm
            font-medium

            ${
              priorityStyles[priority] ||
              "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
            }
          `}
        >
          <Flag size={14} />

          {priority}
        </div>

        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">

          <CalendarDays size={16} />

          {deadline || "No deadline"}

        </div>

      </div>

      {/* Title */}

      <h2
        className={`
          mt-6
          text-2xl
          font-bold
          break-words

          ${
            completed
              ? "line-through text-slate-500"
              : "text-slate-900 dark:text-white"
          }
        `}
      >
        {title}
      </h2>

      {/* Description */}

      <p
        className={`
          mt-3
          whitespace-pre-wrap
          break-words

          ${
            completed
              ? "line-through text-slate-600"
              : "text-slate-600 dark:text-slate-400"
          }
        `}
      >
        {description || "No description"}
      </p>

      {/* Progress Section */}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/50 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Brain size={12} className="text-purple-400" />
            Progress
          </span>
          <span
            className={`text-sm font-bold leading-none ${
              progress >= 80
                ? "text-green-400"
                : progress >= 50
                ? "text-cyan-400"
                : progress >= 25
                ? "text-yellow-400"
                : "text-slate-400"
            }`}
          >
            {progress}%
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressGradient} transition-all duration-1000 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {progressReason && (
          <p className="mt-2.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400 italic">
            <span className="text-purple-400 not-italic">AI:</span>{" "}
            {progressReason}
          </p>
        )}
      </div>

      {/* Footer */}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

        <button
          onClick={() => onToggleComplete?.(id, completed)}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            px-4
            py-2
            transition
            hover:bg-green-500/10
            text-green-400
          "
        >
          <CircleCheck size={18} />

          {completed ? "Completed" : "Mark Complete"}
        </button>

        <div className="flex items-center gap-2">

          <button
            onClick={() => onUpdateProgress?.({
              id,
              title,
              description,
              deadline,
              priority,
              completed,
              progress,
              progressReason,
            })}
            className="
              rounded-xl
              p-3
              text-purple-400
              hover:bg-purple-500/10
              transition
            "
            title="Update Progress"
          >
            <Sparkles size={18} />
          </button>

          <button
            onClick={() =>
              onEdit?.({
                id,
                title,
                description,
                deadline,
                priority,
                completed,
              })
            }
            className="
              rounded-xl
              p-3
              text-cyan-400
              hover:bg-cyan-500/10
              transition
            "
            title="Edit Task"
          >
            <Pencil size={18} />
          </button>

          <button
            onClick={() => setIsConfirmOpen(true)}
            className="
              rounded-xl
              p-3
              text-red-400
              hover:bg-red-500/10
              transition
            "
            title="Delete Task"
          >
            <Trash2 size={18} />
          </button>

        </div>

      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        title="Delete task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default TaskCard;