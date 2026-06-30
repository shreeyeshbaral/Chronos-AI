/*
=========================================
Habit Service
-----------------------------------------
Purpose:
Handles all Firestore operations for
goal and habit tracking.
=========================================
*/

import { db, auth } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs,
  writeBatch,
} from "firebase/firestore";

const habitCollection = collection(db, "habits");
const logCollection = collection(db, "habitLogs");

// Create a new habit
export async function createHabit(title, category = "General", frequency = "daily") {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in.");

  const docRef = await addDoc(habitCollection, {
    userId: user.uid,
    title: title.trim(),
    category,
    frequency,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Delete a habit and its logs
export async function deleteHabit(habitId) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in.");

  // Delete habit doc
  await deleteDoc(doc(db, "habits", habitId));

  // Find and delete logs associated with this habit
  const q = query(logCollection, where("habitId", "==", habitId));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

// Log a habit completion for a specific date (YYYY-MM-DD)
export async function toggleHabitCompletion(habitId, dateStr, completed) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in.");

  const q = query(
    logCollection,
    where("userId", "==", user.uid),
    where("habitId", "==", habitId),
    where("date", "==", dateStr)
  );

  const snapshot = await getDocs(q);

  if (completed) {
    // If already exists, do nothing
    if (!snapshot.empty) return;
    
    // Add completion log
    await addDoc(logCollection, {
      userId: user.uid,
      habitId,
      date: dateStr,
      createdAt: serverTimestamp(),
    });
  } else {
    // Remove completion log if exists
    if (snapshot.empty) return;
    
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  }
}

// Subscribe to active habits
export function subscribeToHabits(userId, callback) {
  if (!userId) return () => {};

  const q = query(habitCollection, where("userId", "==", userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const habits = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(habits);
    },
    (error) => {
      console.error("Habits subscription error:", error);
    }
  );
}

// Subscribe to habit logs
export function subscribeToHabitLogs(userId, callback) {
  if (!userId) return () => {};

  const q = query(logCollection, where("userId", "==", userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(logs);
    },
    (error) => {
      console.error("Habit logs subscription error:", error);
    }
  );
}

// Calculate streaks for a list of logs of a specific habit
export function calculateStreak(habitLogs, habitId) {
  const completions = habitLogs
    .filter((log) => log.habitId === habitId)
    .map((log) => log.date)
    .sort();

  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Deduplicate dates
  const uniqueDates = [...new Set(completions)];

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Format today's date and yesterday's date in local time
  const getLocalDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  // Parse all dates to millisecond values for simple diff checking
  const dateObjects = uniqueDates.map((d) => new Date(d));
  
  // Calculate longest streak
  for (let i = 0; i < dateObjects.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(dateObjects[i] - dateObjects[i - 1]);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }
  }
  
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }

  // Calculate current streak
  // Check if they completed it today or yesterday to keep current streak alive
  const hasCompletedToday = uniqueDates.includes(todayStr);
  const hasCompletedYesterday = uniqueDates.includes(yesterdayStr);

  if (hasCompletedToday || hasCompletedYesterday) {
    let checkDate = hasCompletedToday ? new Date() : yesterday;
    currentStreak = 0;
    
    while (true) {
      const checkStr = getLocalDateString(checkDate);
      if (uniqueDates.includes(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}
