/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";

const NeuroThemeContext = createContext();

export function NeuroThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("chronos-neuro-mode") || "Default";
  });

  // Apply data-neuro-mode attribute to document element
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-neuro-mode", mode);
  }, [mode]);

  // Load saved preference from Firestore upon authentication
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "userSettings", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().neuroMode) {
            const savedMode = docSnap.data().neuroMode;
            setMode(savedMode);
            localStorage.setItem("chronos-neuro-mode", savedMode);
          }
        } catch (error) {
          console.error("Error loading neuro mode from Firestore:", error);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const selectMode = async (newMode) => {
    setMode(newMode);
    localStorage.setItem("chronos-neuro-mode", newMode);

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const docRef = doc(db, "userSettings", currentUser.uid);
        await setDoc(
          docRef,
          {
            neuroMode: newMode,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error saving neuro mode to Firestore:", error);
      }
    }
  };

  return (
    <NeuroThemeContext.Provider value={{ mode, selectMode }}>
      {children}
    </NeuroThemeContext.Provider>
  );
}

export function useNeuroTheme() {
  return useContext(NeuroThemeContext);
}
