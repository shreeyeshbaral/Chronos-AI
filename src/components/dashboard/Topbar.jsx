import { getAuth } from "firebase/auth";
import {
  Search,
  Menu,
} from "lucide-react";
import { useSidebar } from "../../layouts/DashboardLayout";
import { useNeuroTheme } from "../../context/NeuroThemeContext";

const avatarGradients = {
  Default: "bg-gradient-to-r from-cyan-500 to-blue-600",
  ADHD: "bg-gradient-to-r from-amber-500 to-yellow-500",
  Autism: "bg-gradient-to-r from-teal-500 to-emerald-500",
  Migraine: "bg-gradient-to-r from-amber-700 to-orange-500",
  Dyslexia: "bg-gradient-to-r from-blue-600 to-indigo-600",
};

function Topbar({ search, setSearch }) {
  const auth = getAuth();
  const user = auth.currentUser;
  const sidebar = useSidebar();
  const setMobileOpen = sidebar?.setMobileOpen;
  const { mode } = useNeuroTheme();

  const avatarGradient = avatarGradients[mode] || avatarGradients.Default;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const avatar = (
    user?.displayName?.charAt(0) ||
    user?.email?.charAt(0) ||
    "U"
  ).toUpperCase();

  return (
    <header className="flex flex-col gap-4 border-b border-slate-800 bg-slate-950 px-4 py-4 md:px-8 md:py-6 md:flex-row md:items-center md:justify-between">
      {/* Top row containing Hamburger (mobile), Search (fluid), and Avatar (mobile) */}
      <div className="flex items-center gap-3 w-full md:max-w-md flex-1">
        <button
          onClick={() => setMobileOpen?.(true)}
          className="md:hidden inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="
              w-full
              rounded-xl
              border
              border-slate-800
              bg-slate-900
              py-3
              pl-11
              pr-4
              text-slate-100
              placeholder-slate-500
              outline-none
              transition
              focus:border-cyan-500
            "
          />
        </div>

        {/* Mobile Avatar (aligned right of search) */}
        <div className={`md:hidden flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${avatarGradient} font-bold text-white`} style={{ lineHeight: 1, letterSpacing: 0 }}>
          {avatar}
        </div>
      </div>

      {/* Desktop items (hidden on mobile, shown on md and larger) */}
      <div className="hidden md:flex items-center gap-4">
        <p className="text-sm text-slate-400" style={{ lineHeight: 1.4, letterSpacing: 0 }}>{today}</p>

        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${avatarGradient} font-bold text-white`} style={{ lineHeight: 1, letterSpacing: 0 }}>
          {avatar}
        </div>
      </div>
    </header>
  );
}

export default Topbar;