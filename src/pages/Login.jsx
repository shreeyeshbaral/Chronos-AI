/*
=========================================
Login Page
-----------------------------------------
Purpose:
Allows users to sign in to Chronos AI.

Supports:
- Google Sign In
- Email/Password (Coming Next)
=========================================
*/

// ============================
// Imports
// ============================

// React Router utilities
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Google Authentication function
import { signInWithGoogle, signInWithEmail } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNeuroTheme } from "../context/NeuroThemeContext";
import toast from "react-hot-toast";

// ============================
// Component
// ============================

function Login() {

  // React Router navigation hook
  const navigate = useNavigate();
  const { user } = useAuth();
  const { mode } = useNeuroTheme();

  // Email and Password States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Handles Google Sign-In
  async function handleGoogleLogin() {
    try {

      // Opens Google authentication popup
      const user = await signInWithGoogle();

      console.log("Logged in user:", user);

      // Redirect to dashboard after successful login
      navigate("/dashboard");

    } catch (error) {
      console.error("Google Sign-In Failed:", error);
      toast.error("Google Sign-In Failed");
    }
  }

  // Handles Email & Password Login / Registration
  async function handleEmailLogin(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const user = await signInWithEmail(email, password);
      console.log("Logged in user with email:", user);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to sign in with email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl">

        {/* Logo */}
        <h1 className="text-4xl font-bold text-white text-center">
          Chronos AI
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-center mt-4">
          Sign in to continue your productivity journey.
        </p>

        {/* Email and Password Form */}
        <form onSubmit={handleEmailLogin} className="mt-10">
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full mb-4 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500 disabled:opacity-50"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full mb-4 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500 disabled:opacity-50"
          />

          {/* Email Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span className="px-4 text-slate-500 text-sm">OR</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          className={
            mode === "ADHD"
              ? "bg-slate-900 text-white border border-amber-500 hover:bg-slate-800 hover:scale-105 focus:ring-2 focus:ring-amber-500/50 active:bg-slate-950 disabled:opacity-50 py-4 px-6 font-semibold rounded-xl transition flex items-center justify-center cursor-pointer w-full gap-3"
              : mode === "Autism"
              ? "bg-[#EAF7F7] text-[#1C333D] border border-[#BCE2CF] hover:bg-[#D7F3E3] hover:scale-105 focus:ring-2 focus:ring-[#1F7D72]/50 active:bg-[#BCE2CF] disabled:opacity-50 py-4 px-6 font-semibold rounded-xl transition flex items-center justify-center cursor-pointer w-full gap-3"
              : mode === "Migraine"
              ? "bg-[#2C2A27] text-[#F2E9E4] border border-[#4A4641] hover:bg-[#3A3733] hover:scale-105 focus:ring-2 focus:ring-[#B08968]/50 active:bg-[#1E1C1A] disabled:opacity-40 py-4 px-6 font-semibold rounded-xl transition flex items-center justify-center opacity-85 hover:opacity-100 cursor-pointer w-full gap-3 filter brightness-90"
              : mode === "Dyslexia"
              ? "bg-[#FAF6EB] text-[#0F172A] border-2 border-blue-600 hover:bg-[#FFFDF5] hover:scale-105 focus:ring-2 focus:ring-blue-600/50 active:bg-[#E8E0CB] disabled:opacity-50 py-5 px-8 text-lg font-bold rounded-xl transition flex items-center justify-center cursor-pointer w-full gap-3"
              : "bg-[#FFFFFF] text-black border border-slate-300 hover:bg-slate-50 hover:scale-105 focus:ring-2 focus:ring-slate-400/50 active:bg-slate-100 disabled:opacity-50 py-4 px-6 font-semibold rounded-xl transition flex items-center justify-center cursor-pointer w-full gap-3"
          }
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        {/* Back Button */}
        <Link
          to="/"
          className="block text-center mt-6 text-blue-400 hover:text-blue-300"
        >
          ← Back to Home
        </Link>

      </div>

    </div>
  );
}

// ============================
// Export
// ============================

export default Login;