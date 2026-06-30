/*
=========================================
Protected Route
-----------------------------------------
Purpose:
Prevents unauthenticated users
from accessing protected pages.
=========================================
*/

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {

  // Current logged-in user and auth loading state
  const { user, loading } = useAuth();

  // Show loading spinner while auth is checking
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow access
  return children;

}

export default ProtectedRoute;