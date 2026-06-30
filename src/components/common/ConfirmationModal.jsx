/*
=========================================
Confirmation Modal
-----------------------------------------
Purpose:
Reusable confirmation modal with dark SaaS styling.
=========================================
*/

import { X } from "lucide-react";

function ConfirmationModal({
  isOpen,
  title,
  message,
  onCancel,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Delete",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4">
      <div className="w-full max-w-lg rounded-[2rem] border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
              Confirm action
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-white">
              {title}
            </h3>
          </div>

          <button
            onClick={onCancel}
            className="rounded-2xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-6">
          <p className="text-sm leading-7 text-slate-400">
            {message}
          </p>

          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm text-slate-500">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-800 px-6 py-5">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-800 bg-slate-950 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-cyan-500 hover:text-white"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
