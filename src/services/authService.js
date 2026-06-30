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
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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

// ============================
// Email and Password Auth
// ============================

export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    // If user does not exist, automatically sign them up
    if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential" || error.code === "auth/invalid-email") {
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return result.user;
      } catch (signUpError) {
        console.error("Email Sign-Up Error:", signUpError);
        throw signUpError;
      }
    }
    console.error("Email Sign-In Error:", error);
    throw error;
  }
}