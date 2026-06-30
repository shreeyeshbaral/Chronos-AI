import DashboardLayout from "../layouts/DashboardLayout";
import { useNeuroTheme } from "../context/NeuroThemeContext";

import {
  Brain,
  Zap,
  Sparkles,
  Heart,
  EyeOff,
  BookOpen,
} from "lucide-react";

const neuroModes = [
  {
    key: "Default",
    name: "Default Mode",
    description: "Chronos AI classic dark theme interface. Sharp cyan accents with deep space gradients.",
    icon: Sparkles,
    preview: {
      bg: "#020617",
      card: "#0F172A",
      border: "#1E293B",
      primary: "#06B6D4",
      text: "#FFFFFF",
      textMuted: "#94A3B8",
    },
  },
  {
    key: "ADHD",
    name: "ADHD Focus Mode",
    description: "High-contrast layouts, minimized animations, and amber alerts to hold and center attention.",
    icon: Zap,
    preview: {
      bg: "#0F172A",
      card: "#1E293B",
      border: "#334155",
      primary: "#FBBF24",
      text: "#FFFFFF",
      textMuted: "#CBD5E1",
    },
  },
  {
    key: "Autism",
    name: "Autism Calm Mode",
    description: "Symmetrical layouts, soft pastel green palettes, and low contrast items to reduce sensory fatigue.",
    icon: Heart,
    preview: {
      bg: "#EAF7F7",
      card: "#D7F3E3",
      border: "#BCE2CF",
      primary: "#2A9D8F",
      text: "#264653",
      textMuted: "#52796F",
    },
  },
  {
    key: "Migraine",
    name: "Migraine Relief Mode",
    description: "Warm dark colors, larger text, soft shadow overlays, and low blue-light emission features.",
    icon: EyeOff,
    preview: {
      bg: "#2C2A27",
      card: "#3A3733",
      border: "#4A4641",
      primary: "#B08968",
      text: "#F2E9E4",
      textMuted: "#D5C7BC",
    },
  },
  {
    key: "Dyslexia",
    name: "Dyslexia Friendly Mode",
    description: "OpenDyslexic/Lexend reading font, wide line heights, expanded spacing, and cream backgrounds.",
    icon: BookOpen,
    preview: {
      bg: "#FFFDF5",
      card: "#FAF6EB",
      border: "#E8E0CB",
      primary: "#2563EB",
      text: "#111827",
      textMuted: "#374151",
    },
  },
];

const glowStyles = {
  Default: "border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.4)]",
  ADHD: "border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.4)]",
  Autism: "border-teal-500 shadow-[0_0_25px_rgba(42,157,143,0.4)]",
  Migraine: "border-amber-600 shadow-[0_0_25px_rgba(176,137,104,0.4)]",
  Dyslexia: "border-blue-600 shadow-[0_0_25px_rgba(37,99,235,0.4)]",
};

function AdaptiveWorkspace() {
  const { mode: activeMode, selectMode } = useNeuroTheme();

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-10 animate-fadeIn">
        <h1 className="text-4xl font-extrabold flex items-center gap-3">
          <Brain className="text-cyan-500 animate-pulse" size={38} />
          Adaptive Workspace
        </h1>
        <p className="mt-2 text-slate-400 max-w-2xl text-sm leading-relaxed">
          Welcome to the world's first neuro-adaptive environment manager. Toggle accessibility interfaces designed around ADHD focus, sensory calm, migraine strain relief, and dyslexia readability parameters.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {neuroModes.map((item) => {
          const Icon = item.icon;
          const isActive = activeMode === item.key;

          return (
            <div
              key={item.key}
              className={`rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 transform hover:scale-[1.01] ${
                isActive
                  ? glowStyles[item.key]
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-cyan-500/10 p-3.5 text-cyan-500 dark:text-cyan-400">
                    <Icon size={24} />
                  </div>
                  {isActive && (
                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                      Active
                    </span>
                  )}
                </div>

                <h3 className="mt-6 text-xl font-bold text-white">
                  {item.name}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  {item.description}
                </p>

                {/* Interactive Live Mock Preview */}
                <div
                  className="mt-6 rounded-xl p-3 border space-y-2 text-left shadow-inner transition"
                  style={{
                    backgroundColor: item.preview.bg,
                    borderColor: item.preview.border,
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className="text-[9px] font-black tracking-tight"
                      style={{ color: item.preview.text }}
                    >
                      Chronos AI
                    </span>
                    <span className="h-1.5 w-6 rounded" style={{ backgroundColor: item.preview.primary }} />
                  </div>
                  <div
                    className="rounded-lg p-2 border"
                    style={{
                      backgroundColor: item.preview.card,
                      borderColor: item.preview.border,
                    }}
                  >
                    <div className="h-1.5 w-12 rounded mb-1" style={{ backgroundColor: item.preview.text }} />
                    <div className="h-1 w-20 rounded" style={{ backgroundColor: item.preview.textMuted }} />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => selectMode(item.key)}
                  className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
                    isActive
                      ? "bg-cyan-500 text-slate-950 font-extrabold cursor-default shadow-md activated-btn"
                      : "bg-slate-800 text-slate-200 hover:bg-cyan-500 hover:text-slate-950 activate-mode-btn"
                  }`}
                >
                  {isActive ? "Activated" : "Activate Mode"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

export default AdaptiveWorkspace;
