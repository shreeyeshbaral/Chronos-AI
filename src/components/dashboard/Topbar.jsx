/*
=========================================
Topbar Component
-----------------------------------------
Purpose:
Displays the top navigation bar inside
the dashboard.

Features:
- Search bar
- Current date
- Notification button
- User avatar
=========================================
*/

// ============================
// Imports
// ============================

import {
  Search,
  Bell,
} from "lucide-react";

// ============================
// Component
// ============================

function Topbar() {

  // Get today's date
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="h-20 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-8">

      {/* Search Bar */}
      <div className="relative w-96">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          type="text"
          placeholder="Search tasks..."
          className="
            w-full
            bg-slate-900
            border
            border-slate-800
            rounded-xl

            py-3
            pl-11
            pr-4

            text-white
            placeholder:text-slate-500

            outline-none
            focus:border-cyan-500
            transition
          "
        />

      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">

        {/* Date */}
        <p className="text-slate-400 text-sm">
          {today}
        </p>

        {/* Notification Button */}
        <button
          className="
            p-3
            rounded-xl
            bg-slate-900
            border
            border-slate-800

            hover:border-cyan-500
            transition
          "
        >
          <Bell size={20} />
        </button>

        {/* User Avatar */}
        <div
          className="
            w-11
            h-11

            rounded-full

            bg-gradient-to-r
            from-cyan-500
            to-blue-600

            flex
            items-center
            justify-center

            font-bold
          "
        >
          S
        </div>

      </div>

    </header>
  );
}

export default Topbar;