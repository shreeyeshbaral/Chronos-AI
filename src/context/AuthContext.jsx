/* eslint-disable react-refresh/only-export-components */
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
import { subscribeToTasks } from "../services/taskService";

// Create Context
const AuthContext = createContext();

// Provider
export function AuthProvider({ children }) {

  // Logged-in user
  const [user, setUser] = useState(null);

  // Loading state
  const [loading, setLoading] = useState(true);

  // centralized tasks states
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  useEffect(() => {
    let unsubscribeTasks = null;

    // Listen for auth changes
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (unsubscribeTasks) {
        unsubscribeTasks();
        unsubscribeTasks = null;
      }

      if (currentUser) {
        setTasksLoading(true);
        unsubscribeTasks = subscribeToTasks(
          currentUser.uid,
          (data) => {
            setTasks(data);
            setTasksLoading(false);
          },
          (error) => {
            console.error("Centralized tasks subscription error:", error);
            setTasks([]);
            setTasksLoading(false);
          }
        );
      } else {
        setTasks([]);
        setTasksLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeTasks) {
        unsubscribeTasks();
      }
    };

  }, []);

  return (

    <AuthContext.Provider
      value={{ user, loading, tasks, setTasks, tasksLoading }}
    >

      {children}

    </AuthContext.Provider>

  );

}

// Custom Hook
export function useAuth() {
  return useContext(AuthContext);
}