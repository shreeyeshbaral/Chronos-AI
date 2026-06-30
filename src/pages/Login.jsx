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

// Google Authentication function
import { signInWithGoogle } from "../services/authService";

// ============================
// Component
// ============================

function Login() {

  // React Router navigation hook
  const navigate = useNavigate();

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
      alert("Google Sign-In Failed");
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

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          className="
            w-full
            mt-10
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

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-slate-700"></div>
          <span className="px-4 text-slate-500 text-sm">OR</span>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>

        {/* Email (Coming Next) */}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
        />

        {/* Password (Coming Next) */}
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none focus:border-blue-500"
        />

        {/* Email Login Button */}
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Sign In
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