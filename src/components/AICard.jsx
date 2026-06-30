import { Zap, TrendingUp } from "lucide-react";

function AICard() {
  return (
    <div className="relative mt-16 max-w-2xl">
      {/* Gradient background effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur opacity-75" />

      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/20 rounded-xl p-2">
            <Zap size={24} className="text-cyan-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">
            AI-Powered Insights
          </h3>
        </div>

        {/* Content */}
        <p className="mt-4 text-slate-300 leading-7">
          Chronos AI analyzes your tasks in real-time to provide smart suggestions, predict deadline risks, and help you stay ahead of your workload.
        </p>

        {/* Features Grid */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
            <p className="text-xs text-slate-400 font-medium">Smart Scheduling</p>
            <p className="mt-2 text-sm text-cyan-400 font-semibold">Auto-Prioritize</p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
            <p className="text-xs text-slate-400 font-medium">Risk Detection</p>
            <p className="mt-2 text-sm text-orange-400 font-semibold">Predict Delays</p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950/50 p-3">
            <p className="text-xs text-slate-400 font-medium">Optimization</p>
            <p className="mt-2 text-sm text-green-400 font-semibold">Max Focus</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex items-center gap-2 text-sm text-slate-400">
          <TrendingUp size={16} className="text-cyan-400" />
          <span>Sign in to unlock AI suggestions for your tasks</span>
        </div>

      </div>
    </div>
  );
}

export default AICard;