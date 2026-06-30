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
  ChevronLeft,
  ChevronRight,
  Trophy,
  Milestone,
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
    title: "Goals & Habits",
    path: "/habits",
    icon: Trophy,
  },
  {
    title: "AI Planner",
    path: "/planner",
    icon: Milestone,
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

function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
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
      className={`fixed inset-y-0 left-0 z-30 transform bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 md:static md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${collapsed ? "md:w-20 w-72" : "w-72"}`}
    >
      <div className="h-full flex flex-col">
        <div className={`border-b border-slate-200 dark:border-slate-800 p-6 flex items-center ${collapsed ? "flex-col justify-center gap-3" : "justify-between"}`}>
          {!collapsed ? (
            <div>
              <h1 className="text-3xl font-black tracking-tight">
                <span className="text-cyan-500">Chronos</span>
                <span className="text-slate-900 dark:text-white">AI</span>
              </h1>
              <p className="mt-2 text-sm text-slate-500">AI Productivity Workspace</p>
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
              <Brain size={24} />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden md:flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
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
                title={collapsed ? item.title : ""}
                className={`flex items-center gap-4 rounded-xl px-4 py-3 font-medium transition-all ${
                  collapsed ? "md:justify-center md:px-2 px-4" : ""
                } ${
                  active
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white"
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className={collapsed ? "md:hidden block" : "block"}>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 dark:border-slate-800 p-5 sm:p-6">
          {!collapsed && (
            <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Logged In</p>
              <p className="mt-2 truncate font-medium text-slate-800 dark:text-white">
                {auth.currentUser?.displayName || auth.currentUser?.email}
              </p>
            </div>
          )}

          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : ""}
            className={`flex w-full items-center justify-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-red-400 transition hover:bg-red-500/20 cursor-pointer ${
              collapsed ? "md:px-2 px-4" : ""
            }`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span className={collapsed ? "md:hidden block" : "block"}>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;