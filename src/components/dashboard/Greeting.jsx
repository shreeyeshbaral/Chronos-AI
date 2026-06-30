/*
=========================================
Greeting Component
-----------------------------------------
Purpose:
Displays a dynamic greeting based on
the current time.

Features:
- Dynamic Greeting
- Motivational Subtitle
- Current Date
=========================================
*/

import { CalendarDays } from "lucide-react";
import { useNeuroTheme } from "../../context/NeuroThemeContext";

const nameGradients = {
  Default: "bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent",
  ADHD: "bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent",
  Autism: "bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent",
  Migraine: "bg-gradient-to-r from-amber-700 to-orange-400 bg-clip-text text-transparent",
  Dyslexia: "bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent",
};

function Greeting({ userName = "User" }) {
  const { mode } = useNeuroTheme();
  const hour = new Date().getHours();

  let greeting = "Good Evening";
  let message = "Finish strong and stay focused.";

  if (hour < 12) {
    greeting = "Good Morning";
    message = "A fresh day, a fresh opportunity.";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
    message = "Keep the momentum going.";
  }

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const nameGradient = nameGradients[mode] || nameGradients.Default;

  return (
    <section className="mb-10">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-5xl font-bold tracking-tight leading-tight">

            {greeting},{" "}

            <span className={nameGradient}>
              {userName}
            </span>

            👋

          </h1>

          <p className="mt-4 text-lg text-slate-400">
            {message}
          </p>

        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3">

          <CalendarDays
            size={20}
            className="text-cyan-400"
          />

          <div>

            <p className="text-xs uppercase tracking-widest text-slate-500">
              Today
            </p>

            <p className="text-sm font-medium text-slate-200">
              {today}
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Greeting;