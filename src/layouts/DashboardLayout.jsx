/*
=========================================
Dashboard Layout
-----------------------------------------
Purpose:
Provides a consistent layout for all
authenticated pages.

Pages:
- Dashboard
- Calendar
- Assistant
- Settings
=========================================
*/

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";

function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-200">

      <div className="md:flex">
        <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        <main className="flex-1 overflow-y-auto">
          <div className="md:hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMobileOpen((open) => !open)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-100 transition hover:border-cyan-500 hover:text-white"
                aria-label="Open navigation"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <span className="text-lg font-semibold tracking-tight">Chronos AI</span>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;