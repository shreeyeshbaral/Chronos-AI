/*
=========================================
Task Modal
-----------------------------------------
Purpose:
Reusable modal for creating tasks.

Future:
- Edit Task support
- Firestore CRUD
- AI-generated tasks
=========================================
*/

import { useEffect, useRef, useState } from "react";
import {
  X,
  Calendar,
  Flag,
  FileText,
  Type,
} from "lucide-react";
import toast from "react-hot-toast";

import { createTask, updateTask } from "../../services/taskService";

function TaskModal({ isOpen, onClose, editTask }) {
  // -------------------------
  // Form State
  // -------------------------

  const [title, setTitle] = useState(editTask?.title || "");
  const [description, setDescription] = useState(editTask?.description || "");
  const [priority, setPriority] = useState(editTask?.priority || "Medium");
  const [deadline, setDeadline] = useState(editTask?.deadline || "");

  const [saving, setSaving] = useState(false);

  const modalRef = useRef(null);
  const titleInput = useRef(null);

  // -------------------------
  // Auto focus
  // -------------------------

  useEffect(() => {
    if (isOpen) {
      titleInput.current?.focus();
    }
  }, [isOpen]);

  // -------------------------
  // ESC closes modal
  // -------------------------

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () =>
      window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // -------------------------
  // Close on outside click
  // -------------------------

  function handleBackdropClick(e) {
    if (modalRef.current === e.target) {
      onClose();
    }
  }

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Task title is required.");
      return;
    }

    try {
      setSaving(true);

      if (editTask?.id) {
        await updateTask(editTask.id, {
          title,
          description,
          priority,
          deadline,
        });

        toast.success("Task updated successfully.");
      } else {
        await createTask({
          title,
          description,
          priority,
          deadline,
        });

        toast.success("Task created successfully.");
      }

      setTitle("");
      setDescription("");
      setPriority("Medium");
      setDeadline("");

      onClose();
    } catch (error) {
      console.error(error);
      toast.error(editTask?.id ? "Failed to update task." : "Failed to create task.");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/70
        backdrop-blur-md
        p-5
      "
    >
      <div
        className="
          w-full
          max-w-2xl
          rounded-3xl
          border
          border-slate-700
          bg-slate-900
          shadow-2xl
          animate-in
          fade-in
          zoom-in
          duration-200
        "
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-800 p-7">

          <h2 className="text-2xl font-bold">
            {editTask?.id ? "Edit Task" : "Create New Task"}
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>

        </div>

        {/* Body */}

        <div className="space-y-6 p-7">

          {/* Title */}

          <div>

            <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <Type size={16} />
              Title
            </label>

            <input
              ref={titleInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Build React Authentication"
              className="
                w-full
                rounded-xl
                border
                border-slate-700
                bg-slate-800
                px-4
                py-3
                outline-none
                transition
                focus:border-cyan-500
              "
            />

          </div>

          {/* Description */}

          <div>

            <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <FileText size={16} />
              Description
            </label>

            <textarea
              rows={5}
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Describe your task..."
              className="
                w-full
                rounded-xl
                border
                border-slate-700
                bg-slate-800
                px-4
                py-3
                outline-none
                transition
                focus:border-cyan-500
              "
            />

          </div>

          {/* Grid */}

          <div className="grid md:grid-cols-2 gap-5">

            <div>

              <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                <Flag size={16} />
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value)
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-800
                  px-4
                  py-3
                "
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>

            </div>

            <div>

              <label className="mb-2 flex items-center gap-2 text-sm text-slate-400">
                <Calendar size={16} />
                Deadline
              </label>

              <input
                type="date"
                value={deadline}
                onChange={(e) =>
                  setDeadline(e.target.value)
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-800
                  px-4
                  py-3
                "
              />

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="flex justify-end gap-3 border-t border-slate-800 p-7">

          <button
            disabled={saving}
            onClick={onClose}
            className="
              rounded-xl
              bg-slate-800
              px-6
              py-3
              hover:bg-slate-700
            "
          >
            Cancel
          </button>

          <button
            disabled={saving}
            onClick={handleSubmit}
            className="
              rounded-xl
              bg-cyan-500
              px-6
              py-3
              font-semibold
              hover:bg-cyan-600
              disabled:opacity-50
            "
          >
            {saving
              ? editTask?.id
                ? "Updating..."
                : "Creating..."
              : editTask?.id
              ? "Update Task"
              : "Create Task"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default TaskModal;