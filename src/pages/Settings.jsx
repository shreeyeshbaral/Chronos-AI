/*
=========================================
Settings Page
=========================================
*/

import { useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import toast from "react-hot-toast";

import DashboardLayout from "../layouts/DashboardLayout";
import { useTheme } from "../context/ThemeContext";

import {
  User,
  Save,
  Mail,
  Shield,
} from "lucide-react";

function Settings() {
  const auth = getAuth();
  const user = auth.currentUser;
  const { theme, selectTheme } = useTheme();

  const [name, setName] = useState(
    user?.displayName || ""
  );

  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user) return;

    try {
      setSaving(true);

      await updateProfile(user, {
        displayName: name,
      });

      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>

      <div className="space-y-8">

        {/* Top Header Card */}
        <div className="rounded-[2rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 p-8 shadow-md dark:shadow-2xl dark:shadow-slate-950/40">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-500 font-semibold">Settings</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900 dark:text-white">Customize your Chronos profile</h1>
              <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
                Update your display name, review account info, and manage your workspace appearance.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500 text-2xl font-bold text-slate-950">
                  {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Signed in as</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.displayName || "Unnamed User"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          {/* Profile Card */}
          <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <User className="text-cyan-500" />
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Profile</h2>
            </div>

            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Update the name shown across Chronos and your task history.</p>

            <div className="space-y-4">
              <label className="block text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Display Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                placeholder="Enter display name"
              />
            </div>

            <div className="mt-8">
              <button
                disabled={saving}
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 text-slate-950 px-6 py-4 font-semibold transition hover:bg-cyan-400 disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {/* Account Info Card */}
            <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <Mail className="text-cyan-500" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Account Info</h2>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 p-4">
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{user?.email || "Not available"}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 p-4">
                  <p className="text-sm text-slate-500">User ID</p>
                  <p className="mt-1 break-all text-base font-semibold text-slate-900 dark:text-white">{user?.uid || "Not available"}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 p-4">
                  <p className="text-sm text-slate-500">Created</p>
                  <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{user?.metadata?.creationTime || "Unknown"}</p>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <Shield className="text-cyan-500" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Security</h2>
              </div>

              <p className="text-slate-600 dark:text-slate-400">
                Your account is authenticated securely using Firebase Authentication.
              </p>
            </div>

            {/* Theme Card */}
            <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <Shield className="text-cyan-500" />
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Theme</h2>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Choose how Chronos AI appears on your device. Changes apply instantly.
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  onClick={() => selectTheme("Light")}
                  className={`rounded-3xl border px-4 py-4 text-left transition ${
                    theme === "Light"
                      ? "border-cyan-500 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm"
                      : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Light</p>
                  <p className="mt-2 text-base">Classic</p>
                </button>
                <button
                  onClick={() => selectTheme("Dark")}
                  className={`rounded-3xl border px-4 py-4 text-left transition ${
                    theme === "Dark"
                      ? "border-cyan-500 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm"
                      : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Dark</p>
                  <p className="mt-2 text-base">Modern</p>
                </button>
                <button
                  onClick={() => selectTheme("System")}
                  className={`rounded-3xl border px-4 py-4 text-left transition ${
                    theme === "System"
                      ? "border-cyan-500 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm"
                      : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Auto</p>
                  <p className="mt-2 text-base">System</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}

export default Settings;