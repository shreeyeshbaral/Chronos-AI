/*
=========================================
Dashboard Layout
-----------------------------------------
Purpose:
Provides a consistent layout for all
authenticated pages.

Pages using this layout:
- Dashboard
- Calendar
- AI Assistant
- Settings
=========================================
*/

// ============================
// Imports
// ============================

import Sidebar from "../components/dashboard/Sidebar";

// ============================
// Component
// ============================

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}

export default DashboardLayout;