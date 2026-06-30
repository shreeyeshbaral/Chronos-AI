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
import toast from "react-hot-toast";

// ============================
// Component
// ============================

function Login() {

  // React Router navigation hook
  const navigate = useNavigate();
  const { user } = useAuth();

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
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-xl">

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
          className="
            w-full
            bg-white
            text-black
            py-4
            rounded-xl
            font-semibold
            hover:scale-105
            transition
          "
        >
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