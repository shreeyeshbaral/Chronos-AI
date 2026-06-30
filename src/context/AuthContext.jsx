/*
=========================================
Auth Context
-----------------------------------------
Purpose:
Provides the logged-in Firebase user
to the entire application.
=========================================
*/

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../firebase/firebaseConfig";

// Create Context
const AuthContext = createContext();

// Provider
export function AuthProvider({ children }) {

  // Logged-in user
  const [user, setUser] = useState(null);

  // Loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // Listen for auth changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {

      setUser(currentUser);

      setLoading(false);

    });

    return unsubscribe;

  }, []);

  return (

    <AuthContext.Provider
      value={{ user }}
    >

      {!loading && children}

    </AuthContext.Provider>

  );

}

// Custom Hook
export function useAuth() {
  return useContext(AuthContext);
}