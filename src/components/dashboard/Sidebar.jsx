/*
=========================================
Sidebar Component
-----------------------------------------
Purpose:
Provides navigation between all pages
inside the authenticated dashboard.
=========================================
*/

// ============================
// Imports
// ============================

import { Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Calendar,
  Bot,
  ChartColumn,
  Settings,
  LogOut,
} from "lucide-react";

// ============================
// Navigation Items
// ============================

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
    title: "AI Assistant",
    path: "/assistant",
    icon: Bot,
  },
  {
    title: "Analytics",
    path: "/analytics",
    icon: ChartColumn,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

// ============================
// Component
// ============================

function Sidebar() {

  // Gives us the current URL
  const location = useLocation();

  return (
    <aside className="w-72 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">

      {/* Logo */}
      <div className="p-8 border-b border-slate-800">

        <h1 className="text-3xl font-bold tracking-wide">

          <span className="text-cyan-400">
            Chronos
          </span>

          <span className="text-white">
            AI
          </span>

        </h1>

      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">

        {menuItems.map((item) => {

          const Icon = item.icon;

          const active = location.pathname === item.path;

          return (

            <Link
              key={item.title}
              to={item.path}
              className={`

                flex
                items-center
                gap-4

                px-4
                py-3

                rounded-xl

                transition-all
                duration-300

                ${
                  active
                    ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }

              `}
            >

              <Icon size={20} />

              {item.title}

            </Link>

          );

        })}

      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">

        <button
          className="
            w-full
            flex
            items-center
            gap-3

            px-4
            py-3

            rounded-xl

            text-red-400
            hover:bg-red-500/10
            transition
          "
        >

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </aside>
  );
}

export default Sidebar;