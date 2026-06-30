/*
=========================================
Authentication Service
-----------------------------------------
Purpose:
Handles all authentication logic.
=========================================
*/

// ============================
// Imports
// ============================

import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "../firebase/firebaseConfig";

// ============================
// Google Provider
// ============================

const googleProvider = new GoogleAuthProvider();

// ============================
// Google Sign In
// ============================

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    return result.user;

  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}