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

import { useState, useEffect, createContext, useContext } from "react";
import { useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/dashboard/Sidebar";

export const SidebarContext = createContext(null);
export const useSidebar = () => useContext(SidebarContext);

function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";

  // Automatically collapse sidebar on tablet widths (768px - 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarContext.Provider value={{ mobileOpen, setMobileOpen, collapsed, setCollapsed }}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white transition-colors duration-200">
        <div className="flex">
          <Sidebar
            isOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
          />

          {/* Mobile Sidebar Backdrop Overlay */}
          {mobileOpen && (
            <div
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300"
            />
          )}

          <main className="flex-1 min-h-screen overflow-y-auto w-full">
            {/* Unified mobile header (except on Dashboard where Topbar handles it) */}
            {!isDashboard && (
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
            )}

            <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

export default DashboardLayout;