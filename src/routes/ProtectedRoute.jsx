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

  // Current logged-in user
  const { user } = useAuth();

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Allow access
  return children;

}

export default ProtectedRoute;