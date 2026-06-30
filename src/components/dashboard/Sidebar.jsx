/*
=========================================
Sidebar Component
=========================================
*/

import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

import { auth } from "../../firebase/firebaseConfig";

import {
  LayoutDashboard,
  Calendar,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  Brain,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Calendar",
    path: "/calendar",
    icon: Calendar,
  },
  {
    title: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    title: "AI Assistant",
    path: "/assistant",
    icon: Bot,
  },
  {
    title: "Adaptive Workspace",
    path: "/adaptive-workspace",
    icon: Brain,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login");
      onClose?.();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition duration-300 md:static md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="border-b border-slate-200 dark:border-slate-800 p-6 sm:p-8">
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-cyan-500">Chronos</span>
            <span className="text-slate-900 dark:text-white">AI</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">AI Productivity Workspace</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.title}
                to={item.path}
                onClick={() => onClose?.()}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 font-medium transition-all ${
                  active
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                <Icon size={20} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">Logged In</p>
            <p className="mt-2 truncate font-medium text-slate-800 dark:text-white">
              {auth.currentUser?.displayName || auth.currentUser?.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-red-400 transition hover:bg-red-500/20"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;