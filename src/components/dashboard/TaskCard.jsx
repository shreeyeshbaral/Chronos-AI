/*
=========================================
Task Card Component
-----------------------------------------
Purpose:
Displays a single task.

Features:
- Complete Task
- Delete Task
- Edit Ready
=========================================
*/

import {
  CalendarDays,
  Flag,
  Pencil,
  Trash2,
  CircleCheck,
} from "lucide-react";

function TaskCard({
  id,
  title,
  description,
  deadline,
  priority,
  completed = false,
  onDelete,
  onToggleComplete,
  onEdit,
}) {
  const priorityStyles = {
    High: "bg-red-500/15 text-red-400 border border-red-500/30",
    Medium: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
    Low: "bg-green-500/15 text-green-400 border border-green-500/30",
  };

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this task permanently?"
    );

    if (!confirmed) return;

    await onDelete?.(id);
  }

  return (
    <div
      className={`
        group
        rounded-3xl
        border
        p-6
        bg-slate-900/90
        backdrop-blur-lg
        transition-all
        duration-300

        ${
          completed
            ? "border-green-500/50 opacity-75"
            : "border-slate-800 hover:border-cyan-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10"
        }
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

        <div className="flex items-center gap-2 text-slate-400 text-sm">

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
              : "text-white"
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
              : "text-slate-400"
          }
        `}
      >
        {description || "No description"}
      </p>

      {/* Footer */}

      <div className="mt-8 flex items-center justify-between">

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
            onClick={() => onEdit?.(id)}
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
            onClick={handleDelete}
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
    </div>
  );
}

export default TaskCard;