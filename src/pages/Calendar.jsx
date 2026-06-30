/*
=========================================
Calendar Page
-----------------------------------------
Purpose:
Interactive calendar showing task deadlines.
Includes AI-powered auto-scheduling suggestions
and .ics (iCalendar) calendar export.
=========================================
*/

import { useState, useMemo } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { updateTask } from "../services/taskService";
import {
  CalendarDays,
  Clock3,
  Flag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  X,
  ArrowRight,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { askGemini } from "../ai/gemini";

const weekDaysNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Calendar() {
  const { tasks } = useAuth();
  
  // Date Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split("T")[0]
  );

  // AI Scheduling Modal State
  const [scheduling, setScheduling] = useState(false);
  const [proposedSchedule, setProposedSchedule] = useState(null);
  const [applyingSchedule, setApplyingSchedule] = useState(false);

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay(); // day of week (0-6)
  const lastDay = new Date(year, month + 1, 0).getDate(); // days in current month
  const prevLastDay = new Date(year, month, 0).getDate(); // days in prev month

  const calendarCells = useMemo(() => {
    const cells = [];
    
    // Previous month padding cells
    for (let i = firstDayIndex; i > 0; i--) {
      const day = prevLastDay - i + 1;
      const prevDate = new Date(year, month - 1, day);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, "0");
      const d = String(prevDate.getDate()).padStart(2, "0");
      cells.push({
        dayNum: day,
        isCurrentMonth: false,
        dateStr: `${y}-${m}-${d}`,
      });
    }

    // Current month cells
    for (let i = 1; i <= lastDay; i++) {
      const currDate = new Date(year, month, i);
      const y = currDate.getFullYear();
      const m = String(currDate.getMonth() + 1).padStart(2, "0");
      const d = String(currDate.getDate()).padStart(2, "0");
      cells.push({
        dayNum: i,
        isCurrentMonth: true,
        isToday: new Date().toDateString() === currDate.toDateString(),
        dateStr: `${y}-${m}-${d}`,
      });
    }

    // Next month padding cells
    const totalCells = cells.length;
    const remainingCells = 42 - totalCells; // 6 rows of 7 days
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, "0");
      const d = String(nextDate.getDate()).padStart(2, "0");
      cells.push({
        dayNum: i,
        isCurrentMonth: false,
        dateStr: `${y}-${m}-${d}`,
      });
    }

    return cells;
  }, [year, month, firstDayIndex, lastDay, prevLastDay]);

  // Tasks grouped by deadline date string ("YYYY-MM-DD")
  const tasksByDate = useMemo(() => {
    const groups = {};
    tasks.forEach((task) => {
      if (!task.deadline) return;
      const dateStr = task.deadline;
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(task);
    });
    return groups;
  }, [tasks]);

  // Handle Month Changes
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Selected date tasks
  const selectedDateTasks = useMemo(() => {
    return tasksByDate[selectedDateStr] || [];
  }, [tasksByDate, selectedDateStr]);

  // Format Month Year heading
  const monthName = currentDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  // Client-Side iCal .ics Exporter
  const handleExportCalendar = () => {
    const tasksWithDeadline = tasks.filter((t) => t.deadline);
    if (tasksWithDeadline.length === 0) {
      toast.error("You have no tasks with deadlines to export!");
      return;
    }

    let icsContent =
      "BEGIN:VCALENDAR\r\n" +
      "VERSION:2.0\r\n" +
      "PRODID:-//ChronosAI//Task Calendar//EN\r\n" +
      "CALSCALE:GREGORIAN\r\n";

    tasksWithDeadline.forEach((task) => {
      const dateParts = task.deadline.split("-");
      if (dateParts.length !== 3) return;
      
      const yr = dateParts[0];
      const mn = dateParts[1];
      const dy = dateParts[2];
      const startStr = `${yr}${mn}${dy}`;

      icsContent +=
        "BEGIN:VEVENT\r\n" +
        `UID:${task.id}@chronosai.app\r\n` +
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z\r\n` +
        `DTSTART;VALUE=DATE:${startStr}\r\n` +
        `DTEND;VALUE=DATE:${startStr}\r\n` +
        `SUMMARY:${task.title.replace(/[,;]/g, "\\$&")}\r\n` +
        `DESCRIPTION:${(task.description || "").replace(/[\r\n]+/g, " ").replace(/[,;]/g, "\\$&")}\r\n` +
        `STATUS:${task.completed ? "COMPLETED" : "NEEDS-ACTION"}\r\n` +
        "END:VEVENT\r\n";
    });

    icsContent += "END:VCALENDAR\r\n";

    try {
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "chronos_calendar_schedule.ics");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("iCal schedule (.ics) downloaded! Import this in Google Calendar.");
    } catch {
      toast.error("iCal export failed.");
    }
  };

  // AI-Powered Scheduling Optimizations
  async function handleAISchedule() {
    const pendingTasks = tasks.filter((t) => !t.completed);
    if (pendingTasks.length === 0) {
      toast.error("You have no pending tasks to schedule!");
      return;
    }

    try {
      setScheduling(true);
      setProposedSchedule(null);

      const tasksPayload = pendingTasks.map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority || "Medium",
        currentDeadline: t.deadline || "None",
      }));

      const todayStr = new Date().toISOString().split("T")[0];

      const prompt = `You are a scheduling AI assistant.
Optimize the deadlines of the following tasks. Assign an optimal due date (in YYYY-MM-DD format) starting from today (${todayStr}) up to the next 7 days.
Ensure you:
- Distribute tasks evenly (avoid scheduling more than 2 tasks on the same day).
- Put High priority tasks earlier in the week.
- Keep existing deadlines if they make sense, or adjust them if there are overlaps.

Tasks list:
${JSON.stringify(tasksPayload, null, 2)}

Respond ONLY with a valid JSON array of objects, with no markdown fences:
[
  {
    "id": "task_id_here",
    "proposedDeadline": "YYYY-MM-DD",
    "reason": "Brief justification why"
  },
  ...
]`;

      const rawResponse = await askGemini(prompt);
      let jsonStr = rawResponse.trim();
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();

      const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
      if (arrayMatch) jsonStr = arrayMatch[0];

      const suggestions = JSON.parse(jsonStr);

      const mappedSuggestions = suggestions.map((s) => {
        const originalTask = pendingTasks.find((t) => t.id === s.id);
        return {
          id: s.id,
          title: originalTask ? originalTask.title : "Unknown Task",
          currentDeadline: originalTask ? (originalTask.deadline || "None") : "None",
          proposedDeadline: s.proposedDeadline,
          reason: s.reason,
        };
      });

      setProposedSchedule(mappedSuggestions);
      toast.success("AI Scheduler optimized successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to compile scheduling recommendations.");
    } finally {
      setScheduling(false);
    }
  }

  // Apply Proposed AI Schedule
  async function handleApplySchedule() {
    if (!proposedSchedule) return;
    try {
      setApplyingSchedule(true);
      const updatePromises = proposedSchedule.map((s) =>
        updateTask(s.id, { deadline: s.proposedDeadline })
      );
      await Promise.all(updatePromises);
      toast.success("AI Schedule applied to tasks!");
      setProposedSchedule(null);
    } catch (error) {
      toast.error("Failed to apply schedule updates.");
    } finally {
      setApplyingSchedule(false);
    }
  }

  return (
    <DashboardLayout>
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-fadeIn">
        <div>
          <h1 className="text-4xl font-extrabold flex items-center gap-3">
            <CalendarDays className="text-cyan-500 animate-pulse" size={38} />
            Visual Calendar
          </h1>
          <p className="mt-2 text-slate-400 max-w-2xl text-sm leading-relaxed">
            Monitor deadlines in an interactive Month Grid view, auto-distribute workloads with AI Scheduling, and sync with your local tools using iCal exports.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAISchedule}
            disabled={scheduling}
            className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 px-5 py-3 text-xs font-bold transition hover:bg-cyan-500 hover:text-slate-950 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={14} />
            {scheduling ? "Optimizing..." : "AI Auto-Schedule"}
          </button>
          <button
            onClick={handleExportCalendar}
            className="rounded-xl bg-slate-900 border border-slate-800 text-slate-200 px-5 py-3 text-xs font-bold transition hover:border-cyan-500 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={14} />
            Export Schedule (.ics)
          </button>
        </div>
      </div>

      {/* Main Grid & Side Detail Layout */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Month Calendar Grid */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur shadow-sm space-y-6">
          {/* Calendar Header Navigation */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black tracking-tight text-white">{monthName}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:border-cyan-500 hover:text-white transition cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:border-cyan-500 hover:text-white transition cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Month Table */}
          <div>
            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center border-b border-slate-800/80 pb-3">
              {weekDaysNames.map((day) => (
                <div key={day} className="text-xs uppercase tracking-wider font-extrabold text-slate-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 border-t border-l border-slate-800/20 mt-2">
              {calendarCells.map((cell, index) => {
                const dateTasks = tasksByDate[cell.dateStr] || [];
                const isSelected = selectedDateStr === cell.dateStr;

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    className={`aspect-square p-2 border-r border-b border-slate-850 cursor-pointer flex flex-col justify-between transition-all relative ${
                      cell.isCurrentMonth ? "text-slate-200" : "text-slate-600 opacity-30"
                    } ${
                      isSelected
                        ? "bg-cyan-500/10 border border-cyan-500/50 shadow-inner"
                        : "bg-slate-950/20 hover:bg-slate-900/30"
                    }`}
                  >
                    {/* Day Number */}
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-black h-5 w-5 flex items-center justify-center rounded-full ${
                        cell.isToday
                          ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                          : "text-slate-300"
                      }`}>
                        {cell.dayNum}
                      </span>
                    </div>

                    {/* Task Indicators */}
                    <div className="flex flex-wrap gap-1 mt-1.5 h-4 overflow-hidden">
                      {dateTasks.slice(0, 3).map((task) => (
                        <span
                          key={task.id}
                          className={`h-1.5 w-1.5 rounded-full ${
                            task.completed
                              ? "bg-emerald-500"
                              : task.priority === "High"
                              ? "bg-red-500"
                              : task.priority === "Medium"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                          title={task.title}
                        />
                      ))}
                      {dateTasks.length > 3 && (
                        <span className="text-[7.5px] text-cyan-400 font-bold leading-none">
                          +{dateTasks.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Tasks Due on Selected Day */}
        <div className="lg:col-span-1 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur shadow-sm h-fit">
          <div className="border-b border-slate-800 pb-4 mb-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">Selected Date</p>
            <h3 className="text-xl font-bold text-white mt-1">
              {new Date(selectedDateStr + "T00:00:00").toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </h3>
          </div>

          <div className="space-y-4">
            {selectedDateTasks.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <CheckCircle size={36} className="mx-auto mb-3 opacity-30 text-cyan-400" />
                <p className="text-xs">No tasks due on this day!</p>
              </div>
            ) : (
              selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  className={`rounded-2xl border p-4 bg-slate-950/40 hover:border-slate-700 transition ${
                    task.completed ? "border-emerald-500/20" : "border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`font-semibold text-sm ${task.completed ? "text-slate-500 line-through" : "text-white"}`}>
                      {task.title}
                    </h4>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold flex-shrink-0 ${
                      task.completed ? "bg-emerald-500/10 text-emerald-400" :
                      task.priority === "High" ? "bg-red-500/10 text-red-400" :
                      task.priority === "Medium" ? "bg-amber-500/10 text-amber-400" :
                      "bg-blue-500/10 text-blue-400"
                    }`}>
                      {task.completed ? "Completed" : task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2">{task.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* AI Scheduling Modal Overlay */}
      {proposedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-5 select-none animate-fadeIn">
          <div className="w-[95vw] md:w-full md:max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 p-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Sparkles className="text-cyan-500 animate-pulse" size={22} />
                AI Schedule Optimization Suggestions
              </h2>
              <button
                onClick={() => setProposedSchedule(null)}
                className="rounded-lg p-2 hover:bg-slate-800 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 max-h-[50vh] overflow-y-auto space-y-4">
              <p className="text-xs text-slate-400 mb-2">
                Gemini has calculated optimal deadlines starting from today to balance your load. Review schedule below:
              </p>
              {proposedSchedule.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-850 bg-slate-950/40 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                    <p className="mt-1 text-xs text-slate-500">{item.reason}</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">{item.currentDeadline}</span>
                      <ArrowRight size={12} className="text-slate-650" />
                      <span className="font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 border border-cyan-500/20 rounded-xl">
                        {item.proposedDeadline}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-850 p-6">
              <button
                onClick={() => setProposedSchedule(null)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-5 py-3 hover:bg-slate-850 text-xs font-semibold cursor-pointer"
              >
                Discard Schedule
              </button>
              <button
                disabled={applyingSchedule}
                onClick={handleApplySchedule}
                className="rounded-xl bg-cyan-500 text-slate-950 px-6 py-3 font-bold text-xs hover:bg-cyan-400 transition cursor-pointer disabled:opacity-50"
              >
                {applyingSchedule ? "Scheduling..." : "Apply AI Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Calendar;