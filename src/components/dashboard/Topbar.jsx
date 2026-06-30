/*
=========================================
Topbar Component
=========================================
*/

import { getAuth } from "firebase/auth";
import {
  Search,
  Bell,
} from "lucide-react";

function Topbar({ search, setSearch }) {
  const auth = getAuth();
  const user = auth.currentUser;

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
    <header className="flex flex-col gap-4 border-b border-slate-800 bg-slate-950 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-6">
      <div className="relative w-full max-w-full md:max-w-md">

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
            outline-none
            transition
            focus:border-cyan-500
          "
        />

      </div>

      <div className="flex flex-wrap items-center gap-4 justify-between w-full md:w-auto">
        <p className="hidden text-sm text-slate-400 lg:block">{today}</p>

        <button className="rounded-xl border border-slate-800 bg-slate-900 p-3 transition hover:border-cyan-500">
          <Bell size={20} />
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 font-bold">
          {avatar}
        </div>
      </div>

    </header>
  );
}

export default Topbar;